import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Minimal shape of a guest row needed to build an export - deliberately not
 * importing the full client-side GuestDoc type here since this runs in the
 * Nitro server bundle and only needs these fields.
 */
export interface ExportableGuest {
  name: string
  tier: 'vip' | 'general'
  phone: string
  email?: string
  attending: 'Yes' | 'No' | ''
  guestCount: number
  specialSeating: boolean
  dietary: string
  doa: string
  tableAssignment?: string
  submittedAt: string
}

const CSV_HEADER = ['Name', 'Tier', 'Phone', 'Email', 'Attending', 'Guests', 'Special Seating', 'Dietary Needs', 'Blessings', 'Submitted At']

/**
 * Same column layout as the client-side exportCSV() in useGuests.ts, kept in
 * sync by hand since one runs in the browser and the other in the Nitro
 * server bundle. Used both by the "Save to Drive" button (server/api/drive/
 * export.post.ts) and the countdown-end cron job.
 */
export function buildGuestCSV(guests: ExportableGuest[]): string {
  const escapeCell = (cell: string) => `"${String(cell ?? '').replace(/"/g, '""')}"`
  const rows = guests.map((g) => [
    g.name,
    g.tier,
    g.phone,
    g.email || '',
    g.attending || 'No response yet',
    String(g.guestCount ?? 0),
    g.specialSeating ? 'Yes' : 'No',
    g.dietary || '',
    (g.doa || '').replace(/\n/g, ' '),
    g.submittedAt || ''
  ])
  return [CSV_HEADER, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
}

/**
 * Builds a simple printable guest-list PDF (title + one line per guest) with
 * pdf-lib, which is pure JS with no native bindings - safe to run in Nitro's
 * serverless bundle on Vercel/Firebase Functions. Not a pixel-perfect
 * replica of the dashboard's own "Print / PDF" (browser print-to-PDF); this
 * is the server-generated counterpart used for Drive uploads and email
 * attachments, where there's no browser available to print from.
 */
export async function buildGuestPDF(guests: ExportableGuest[], title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 612 // US Letter, points
  const pageHeight = 792
  const margin = 40
  const lineHeight = 16

  let page = pdf.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  function drawText(text: string, size: number, bold = false, color = rgb(0.1, 0.1, 0.1)) {
    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
    page.drawText(text, { x: margin, y, size, font: bold ? boldFont : font, color, maxWidth: pageWidth - margin * 2 })
    y -= lineHeight
  }

  drawText(title || 'Guest List', 16, true)
  y -= 4
  drawText(`Generated ${new Date().toLocaleString()} · ${guests.length} guest(s)`, 9, false, rgb(0.4, 0.4, 0.4))
  y -= 10

  const attending = guests.filter((g) => g.attending === 'Yes')
  const totalHeads = attending.reduce((sum, g) => sum + (g.guestCount || 0), 0)
  drawText(`Attending: ${attending.length} · Total guests: ${totalHeads} · Declined: ${guests.filter((g) => g.attending === 'No').length} · No response: ${guests.filter((g) => !g.attending).length}`, 9, false, rgb(0.4, 0.4, 0.4))
  y -= 14

  for (const g of guests) {
    const statusLabel = g.attending === 'Yes' ? `Attending (${g.guestCount})` : g.attending === 'No' ? 'Declined' : 'No response'
    drawText(`${g.name}  •  ${g.tier === 'vip' ? 'VIP' : 'General'}  •  ${statusLabel}`, 11, true)
    const details = [
      g.phone ? `Phone: ${g.phone}` : '',
      g.email ? `Email: ${g.email}` : '',
      g.dietary ? `Dietary: ${g.dietary}` : '',
      g.tableAssignment ? `Table: ${g.tableAssignment}` : ''
    ].filter(Boolean).join('   ')
    if (details) drawText(details, 9, false, rgb(0.35, 0.35, 0.35))
    y -= 4
  }

  return pdf.save()
}
