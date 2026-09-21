/**
 * Rotates (invalidates + replaces) this wedding's guest-intake token - the
 * "New link" button next to the intake link on the Guest List page. Anyone
 * still holding the old link immediately stops being able to submit guests
 * with it.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)
  const weddingId = getRouterParam(event, 'weddingId')
  if (!weddingId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId.' })
  }

  await requireWeddingAccess(uid, weddingId, 'You can only manage your own wedding.')

  const token = await rotateIntakeToken(weddingId)
  return { token }
})
