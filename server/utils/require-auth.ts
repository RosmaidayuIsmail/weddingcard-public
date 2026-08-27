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
    const decoded = await getAdminAuth().verifyIdToken(token)
    return { uid: decoded.uid }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}
