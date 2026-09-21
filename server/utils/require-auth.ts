import type { H3Event } from 'h3'

/**
 * Verifies the caller's Firebase ID token (sent as `Authorization: Bearer`)
 * and returns their uid. Throws 401 otherwise. Used by every /api/payments
 * route that couples invoke.
 */
export async function requireAuth(event: H3Event): Promise<{ uid: string }> {
  const header = getHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing bearer token' })
  }

  try {
    const decoded = await verifyFirebaseIdToken(token)
    return { uid: decoded.uid }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}

/**
 * Like requireAuth(), but also checks that the caller's own users/{uid}
 * profile doc has role === 'superadmin' - used to gate every admin-only
 * server route (creating weddings for other people, the admin-wide Google
 * Drive connection, etc). Reads Firestore via the Admin SDK, so this is
 * authoritative even though the client-side role check in
 * middleware/superadmin.ts can't be trusted on its own.
 */
export async function requireSuperAdmin(event: H3Event): Promise<{ uid: string }> {
  const { uid } = await requireAuth(event)
  const snap = await getAdminDb().doc(`users/${uid}`).get()
  const role = (snap.data() as { role?: string } | undefined)?.role
  if (role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Superadmin access required.' })
  }
  return { uid }
}

/**
 * Loads a wedding and confirms the caller may act on it: either the couple
 * who owns it, or a superadmin (who manages every couple's wedding from
 * /admin/wedding/[id]/...). Checking ownerUid alone returned 403 for the
 * superadmin on any wedding that belongs to a couple's own account, which
 * broke the Guest List page's intake link, exports and Drive status there.
 * Returns the wedding's data so callers don't need to re-read it.
 */
export async function requireWeddingAccess(
  uid: string,
  weddingId: string,
  forbiddenMessage: string
): Promise<Record<string, unknown>> {
  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (!weddingSnap.exists || !wedding) {
    throw createError({ statusCode: 403, statusMessage: forbiddenMessage })
  }
  if (wedding.ownerUid === uid) return wedding

  const role = ((await db.doc(`users/${uid}`).get()).data() as { role?: string } | undefined)?.role
  if (role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: forbiddenMessage })
  }
  return wedding
}
