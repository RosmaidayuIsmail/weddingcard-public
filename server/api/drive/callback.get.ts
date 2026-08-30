/**
 * Step 2 of "Connect Google Drive" - Google redirects the couple's browser
 * here (a plain GET, no Authorization header) after they approve consent.
 * We look up the `state` token minted by auth-url.get.ts to find which
 * wedding this belongs to, exchange the code for tokens, create/find this
 * app's export folder in their Drive, save the connection, then bounce the
 * browser back to the Guest List page.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code || '')
  const state = String(query.state || '')
  const siteUrl = ((useRuntimeConfig().public.siteUrl as string) || '').replace(/\/$/, '')
  const returnTo = (message: string) => sendRedirect(event, `${siteUrl}/dashboard/guests?drive=${message}`)

  if (query.error) {
    return returnTo('cancelled')
  }
  if (!code || !state) {
    return returnTo('error')
  }

  const db = getAdminDb()
  const stateRef = db.doc(`driveOAuthStates/${state}`)
  const stateSnap = await stateRef.get()
  if (!stateSnap.exists) {
    return returnTo('error')
  }
  const stateData = stateSnap.data() as { weddingId: string; ownerUid: string; createdAt: number }
  await stateRef.delete()

  // 15 minute window to complete the consent flow.
  if (Date.now() - stateData.createdAt > 15 * 60 * 1000) {
    return returnTo('expired')
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await exchangeCodeForTokens(code)
    const driveEmail = await fetchGoogleEmail(accessToken)

    const weddingSnap = await db.doc(`weddings/${stateData.weddingId}`).get()
    const wedding = weddingSnap.data() as Record<string, unknown> | undefined
    const slug = String(wedding?.slug || stateData.weddingId)
    const { folderId, folderLink } = await ensureAppFolder(accessToken, `WeddingCard Exports - ${slug}`)

    await driveConnectionRef(stateData.weddingId).set({
      weddingId: stateData.weddingId,
      ownerUid: stateData.ownerUid,
      connected: true,
      refreshToken,
      accessToken,
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
      driveEmail,
      folderId,
      folderLink,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return returnTo('connected')
  } catch (error) {
    console.error('Google Drive connect failed', error)
    return returnTo('error')
  }
})
