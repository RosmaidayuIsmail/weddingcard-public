import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'

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

// --- PDF design: a real table (header band, summary stats, zebra-striped
// rows with colored status/tier chips) instead of a plain text dump. Colors
// are chosen to print well on white paper while echoing the app's own gold
// accent (see .gold-* classes across the dashboard). ---

const PAGE_WIDTH = 612 // US Letter, points
const PAGE_HEIGHT = 792
const MARGIN = 42
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const GOLD = rgb(0.62, 0.46, 0.09)
const GOLD_SOFT = rgb(0.97, 0.94, 0.85)
const INK = rgb(0.13, 0.13, 0.15)
const SUBTLE = rgb(0.5, 0.5, 0.52)
const LINE = rgb(0.88, 0.88, 0.86)
const ROW_ALT = rgb(0.985, 0.98, 0.965)
const GREEN = rgb(0.16, 0.5, 0.24)
const RED = rgb(0.72, 0.24, 0.22)
const GRAY_BADGE = rgb(0.93, 0.93, 0.93)

// Column x-offsets (from MARGIN) and boundaries within CONTENT_WIDTH.
const COL = {
  name: 0,
  tier: 185,
  status: 240,
  guests: 360,
  table: 415
}

function truncate(font: PDFFont, text: string, size: number, maxWidth: number): string {
  if (maxWidth <= 0) return ''
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  let out = text
  while (out.length > 1 && font.widthOfTextAtSize(`${out}…`, size) > maxWidth) {
    out = out.slice(0, -1)
  }
  return `${out}…`
}

function drawChip(
  page: PDFPage,
  opts: { x: number; baselineY: number; width: number; text: string; font: PDFFont; size: number; bg: RGB; color: RGB }
) {
  const { x, baselineY, width, text, font, size, bg, color } = opts
  const padY = 3.5
  const height = size + padY * 2
  page.drawRectangle({ x, y: baselineY - padY + 1, width, height, color: bg })
  const textWidth = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: x + Math.max(0, (width - textWidth) / 2), y: baselineY, size, font, color })
}

/**
 * Builds a properly laid-out, printable guest-list PDF - a title band with
 * the couple's names, a row of summary stats, then a real table (repeated
 * header on every page, zebra striping, colored status/tier chips) - used
 * for the "Save to Drive" export and the countdown-end email attachment.
 * This is generated headlessly with pdf-lib (no native bindings, safe in
 * Nitro's serverless bundle), so it's a separate design from the
 * dashboard's own browser "Print / PDF" button, which prints the live page.
 */
export async function buildGuestPDF(guests: ExportableGuest[], title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const attending = guests.filter((g) => g.attending === 'Yes')
  const declined = guests.filter((g) => g.attending === 'No')
  const pending = guests.filter((g) => !g.attending)
  const totalHeads = attending.reduce((sum, g) => sum + (g.guestCount || 0), 0)
  const generatedLabel = `Generated ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`

  const stats: Array<{ label: string; value: string; color: RGB }> = [
    { label: 'ATTENDING', value: String(attending.length), color: GREEN },
    { label: 'TOTAL GUESTS', value: String(totalHeads), color: GOLD },
    { label: 'DECLINED', value: String(declined.length), color: RED },
    { label: 'NO RESPONSE', value: String(pending.length), color: SUBTLE }
  ]

  const pages: PDFPage[] = []
  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT

  function addPage() {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    pages.push(page)
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 6, width: PAGE_WIDTH, height: 6, color: GOLD })
  }

  function drawTableHeader() {
    page.drawRectangle({ x: MARGIN, y: y - 20, width: CONTENT_WIDTH, height: 20, color: GOLD_SOFT })
    const labelY = y - 14
    page.drawText('GUEST', { x: MARGIN + COL.name + 6, y: labelY, size: 8, font: bold, color: GOLD })
    page.drawText('TIER', { x: MARGIN + COL.tier, y: labelY, size: 8, font: bold, color: GOLD })
    page.drawText('RSVP STATUS', { x: MARGIN + COL.status, y: labelY, size: 8, font: bold, color: GOLD })
    page.drawText('GUESTS', { x: MARGIN + COL.guests, y: labelY, size: 8, font: bold, color: GOLD })
    page.drawText('TABLE', { x: MARGIN + COL.table, y: labelY, size: 8, font: bold, color: GOLD })
    y -= 26
  }

  function drawFirstPageHeader() {
    addPage()
    y = PAGE_HEIGHT - 50

    const titleSize = 24
    const displayTitle = title || 'Guest List'
    const titleWidth = serif.widthOfTextAtSize(displayTitle, titleSize)
    page.drawText(displayTitle, { x: (PAGE_WIDTH - titleWidth) / 2, y, size: titleSize, font: serif, color: INK })
    y -= 22

    const metaLine = `${generatedLabel} · ${guests.length} guest${guests.length === 1 ? '' : 's'} invited`
    const metaWidth = font.widthOfTextAtSize(metaLine, 9.5)
    page.drawText(metaLine, { x: (PAGE_WIDTH - metaWidth) / 2, y, size: 9.5, font, color: SUBTLE })
    y -= 28

    // Summary stats, evenly spaced across the content width with thin dividers.
    const chipWidth = CONTENT_WIDTH / stats.length
    stats.forEach((stat, i) => {
      const cx = MARGIN + chipWidth * i
      const valueSize = 20
      const valueWidth = bold.widthOfTextAtSize(stat.value, valueSize)
      page.drawText(stat.value, { x: cx + (chipWidth - valueWidth) / 2, y, size: valueSize, font: bold, color: stat.color })
      const labelWidth = font.widthOfTextAtSize(stat.label, 7.5)
      page.drawText(stat.label, { x: cx + (chipWidth - labelWidth) / 2, y: y - 13, size: 7.5, font, color: SUBTLE })
      if (i > 0) {
        page.drawLine({ start: { x: cx, y: y + 17 }, end: { x: cx, y: y - 16 }, thickness: 0.75, color: LINE })
      }
    })
    y -= 36

    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + CONTENT_WIDTH, y }, thickness: 1, color: GOLD })
    y -= 14

    drawTableHeader()
  }

  function drawContinuationHeader() {
    addPage()
    y = PAGE_HEIGHT - 40
    page.drawText(`${title || 'Guest List'} · continued`, { x: MARGIN, y, size: 10, font: bold, color: SUBTLE })
    y -= 18
    drawTableHeader()
  }

  drawFirstPageHeader()

  const rowNameSize = 10.5
  const rowSubSize = 8
  const nameColWidth = COL.tier - COL.name - 10

  guests.forEach((guest, index) => {
    const detailParts = [
      guest.phone || '',
      guest.email || '',
      guest.dietary ? `Dietary: ${guest.dietary}` : '',
      guest.specialSeating ? 'Needs special seating' : ''
    ].filter(Boolean)
    const hasDetail = detailParts.length > 0
    const rowHeight = hasDetail ? 30 : 20

    if (y - rowHeight < MARGIN + 30) {
      drawContinuationHeader()
    }

    if (index % 2 === 1) {
      page.drawRectangle({ x: MARGIN, y: y - rowHeight, width: CONTENT_WIDTH, height: rowHeight, color: ROW_ALT })
    }

    const textY = y - 13
    page.drawText(truncate(bold, guest.name || 'Unnamed guest', rowNameSize, nameColWidth), {
      x: MARGIN + COL.name + 6, y: textY, size: rowNameSize, font: bold, color: INK
    })

    const tierLabel = guest.tier === 'vip' ? 'VIP' : 'General'
    drawChip(page, {
      x: MARGIN + COL.tier, baselineY: textY, width: COL.status - COL.tier - 8, text: tierLabel, font: bold, size: 7.5,
      bg: guest.tier === 'vip' ? GOLD_SOFT : GRAY_BADGE, color: guest.tier === 'vip' ? GOLD : SUBTLE
    })

    const statusLabel = guest.attending === 'Yes' ? 'Attending' : guest.attending === 'No' ? 'Declined' : 'No response'
    const statusColor = guest.attending === 'Yes' ? GREEN : guest.attending === 'No' ? RED : SUBTLE
    page.drawText(statusLabel, { x: MARGIN + COL.status, y: textY, size: 9, font, color: statusColor })

    const guestsLabel = guest.attending === 'Yes' ? String(guest.guestCount || 0) : '—'
    const guestsColWidth = COL.table - COL.guests - 8
    const guestsWidth = font.widthOfTextAtSize(guestsLabel, 9)
    page.drawText(guestsLabel, { x: MARGIN + COL.guests + Math.max(0, (guestsColWidth - guestsWidth) / 2), y: textY, size: 9, font, color: INK })

    const tableLabel = guest.tableAssignment || '—'
    const tableColWidth = CONTENT_WIDTH - COL.table
    const tableWidth = font.widthOfTextAtSize(tableLabel, 9)
    page.drawText(tableLabel, { x: MARGIN + COL.table + Math.max(0, (tableColWidth - tableWidth) / 2), y: textY, size: 9, font, color: INK })

    if (hasDetail) {
      // Spans the full row width (not just the name column) - it's the only
      // thing on this second line, so it can use all the room available.
      const detailWidth = CONTENT_WIDTH - COL.name - 12
      const detailText = truncate(font, detailParts.join('   ·   '), rowSubSize, detailWidth)
      page.drawText(detailText, { x: MARGIN + COL.name + 6, y: y - 25, size: rowSubSize, font, color: SUBTLE })
    }

    page.drawLine({ start: { x: MARGIN, y: y - rowHeight }, end: { x: MARGIN + CONTENT_WIDTH, y: y - rowHeight }, thickness: 0.5, color: LINE })

    y -= rowHeight
  })

  if (guests.length === 0) {
    page.drawText('No guests yet.', { x: MARGIN + 6, y: y - 16, size: 10, font, color: SUBTLE })
  }

  // Footer, drawn last across every page once the total page count is known.
  pages.forEach((p, i) => {
    const footerText = `Page ${i + 1} of ${pages.length}`
    const footerWidth = font.widthOfTextAtSize(footerText, 8)
    p.drawText(footerText, { x: (PAGE_WIDTH - footerWidth) / 2, y: 24, size: 8, font, color: SUBTLE })
    p.drawText('WeddingCard', { x: MARGIN, y: 24, size: 8, font, color: SUBTLE })
  })

  return pdf.save()
}
