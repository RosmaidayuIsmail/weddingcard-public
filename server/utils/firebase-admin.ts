import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null

/**
 * Lazy Firebase Admin singleton for Nitro server routes. The service account
 * arrives as a stringified JSON env var (NUXT_FIREBASE_SERVICE_ACCOUNT_JSON)
 * because Vercel serverless has no writable filesystem for key files.
 *
 * Admin SDK bypasses firestore.rules entirely - these helpers must only ever
 * be used from server/api routes behind requireAuth(), never echoed to clients.
 */
function getAdminApp(): App {
  if (adminApp) return adminApp

  const raw = useRuntimeConfig().firebaseServiceAccountJson as string | object | undefined
  if (!raw) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Payments are unavailable: NUXT_FIREBASE_SERVICE_ACCOUNT_JSON is not configured.'
    })
  }

  // Nitro's env parsing (destr) hands us an object when the value looks like
  // JSON, and a string otherwise - accept both.
  let serviceAccount: object
  if (typeof raw === 'string') {
    try {
      serviceAccount = JSON.parse(raw)
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Payments are unavailable: the Firebase service account JSON is malformed.'
      })
    }
  } else {
    serviceAccount = raw
  }

  adminApp = getApps().length ? getApps()[0]! : initializeApp({ credential: cert(serviceAccount) })
  return adminApp
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}
