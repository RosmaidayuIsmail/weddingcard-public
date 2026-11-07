/**
 * The Inner Card's "Your Story / Opening Message" field can now be written as
 * several sections instead of one long block, so a long doa or poem is not
 * crammed onto a single slide (see StoryPageContent.vue and the 'story:N'
 * slide keys in app/pages/w/[slug]/details.vue).
 *
 * Plain text keeps working exactly as before. Optional formatting:
 *   ---          on a line by itself: start a new section (its own slide)
 *   # Text       highlighted line - accent colour, heading font (e.g. the names)
 *   ~            on a line by itself: ornamental divider
 *   **text**     bold
 *   *text*       italic
 *   (blank line) a little extra space
 * Every line break you type is kept, so verses break where you break them.
 */

export interface StorySegment {
  text: string
  bold?: boolean
  italic?: boolean
}

export type StoryBlock =
  | { type: 'line'; segments: StorySegment[] }
  | { type: 'heading'; segments: StorySegment[] }
  | { type: 'divider' }
  | { type: 'gap' }

// Markers must hug the text (no space just inside them) so a stray "2 * 3 * 4"
// in plain text is not mistaken for italics.
const BOLD = /\*\*(?!\s)[^*\n]+?(?<!\s)\*\*/
const ITALIC = /(?<!\*)\*(?![\s*])[^*\n]*?(?<![\s*])\*(?!\*)/

/** Always returns at least one (possibly empty) page, matching the old single-slide behaviour. */
export function splitStoryPages(story?: string | null): string[] {
  const raw = (story || '').replace(/\r\n/g, '\n')
  const pages = raw
    .split(/^[ \t]*-{3,}[ \t]*$/m)
    .map((page) => page.trim())
    .filter((page) => page.length > 0)
  return pages.length ? pages : ['']
}

/**
 * True when the story uses sections or any formatting. Plain single-block
 * stories (every wedding written before this feature) keep their original
 * larger look instead of being silently restyled.
 */
export function storyIsRich(story?: string | null): boolean {
  const raw = story || ''
  if (splitStoryPages(raw).length > 1) return true
  return /^[ \t]*#[ \t]+\S/m.test(raw) || /^[ \t]*~[ \t]*$/m.test(raw) || BOLD.test(raw) || ITALIC.test(raw)
}

function parseInline(line: string): StorySegment[] {
  const segments: StorySegment[] = []
  const pattern = new RegExp(`(${BOLD.source}|${ITALIC.source})`, 'g')
  let last = 0
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) segments.push({ text: line.slice(last, index) })
    const token = match[0]
    if (token.startsWith('**')) segments.push({ text: token.slice(2, -2), bold: true })
    else segments.push({ text: token.slice(1, -1), italic: true })
    last = index + token.length
  }
  if (last < line.length) segments.push({ text: line.slice(last) })
  return segments.length ? segments : [{ text: line }]
}

export function parseStoryBlocks(page: string): StoryBlock[] {
  const blocks: StoryBlock[] = []
  for (const rawLine of page.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      // collapse runs of blank lines into one gap, and never start with one
      if (blocks.length && blocks[blocks.length - 1]!.type !== 'gap') blocks.push({ type: 'gap' })
      continue
    }
    if (line === '~') blocks.push({ type: 'divider' })
    else if (/^#\s+/.test(line)) blocks.push({ type: 'heading', segments: parseInline(line.replace(/^#\s+/, '')) })
    else blocks.push({ type: 'line', segments: parseInline(line) })
  }
  while (blocks.length && blocks[blocks.length - 1]!.type === 'gap') blocks.pop()
  return blocks
}
