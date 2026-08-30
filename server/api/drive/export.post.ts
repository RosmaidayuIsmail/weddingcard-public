import { z } from 'zod'
import type { ExportableGuest } from '../../utils/guest-export'

const bodySchema = z.object({ weddingId: z.string().min(1) })

/**
 * "Save to Drive" button next to Export CSV / Print-PDF on the Guest List
 * page. Builds a fresh CSV + PDF snapshot of the current guest list
 * server-side (so it always reflects the live Firestore data, not whatever
 * the browser happened to have cached) and uploads both into the couple's
 * own connected Drive folder.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId.' })
  }
  const { weddingId } = parsed.data

  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (!weddingSnap.exists || wedding?.ownerUid !== uid) {
    throw createError({ statusCode: 403, statusMessage: 'You can only export your own wedding.' })
  }

  const guestsSnap = await db.collection(`weddings/${weddingId}/guests`).get()
  const guests = guestsSnap.docs.map((d) => d.data() as ExportableGuest)

  const content = wedding?.content as Record<string, unknown> | undefined
  const coupleTitle = [content?.brideName, content?.groomName].filter(Boolean).join(' & ') || String(wedding?.slug || 'Wedding')

  const { accessToken, connection } = await getValidAccessToken(weddingId)
  const folderId = connection.folderId || (await ensureAppFolder(accessToken, `WeddingCard Exports - ${wedding?.slug || weddingId}`)).folderId

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
  const csv = buildGuestCSV(guests)
  const pdfBytes = await buildGuestPDF(guests, `${coupleTitle} - Guest List`)

  const [csvResult, pdfResult] = await Promise.all([
    uploadFileToFolder(accessToken, folderId, `guests-${stamp}.csv`, 'text/csv', csv),
    uploadFileToFolder(accessToken, folderId, `guests-${stamp}.pdf`, 'application/pdf', pdfBytes)
  ])

  return {
    csvLink: csvResult.webViewLink,
    pdfLink: pdfResult.webViewLink,
    folderLink: connection.folderLink || ''
  }
})
