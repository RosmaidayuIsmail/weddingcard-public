<template>
  <!-- One section of the Inner Card story. Colours come from --card-text /
       --theme-accent / --theme-heading-font like every other slide, so it
       follows whichever card style (dark / glass / theme) the couple picked.
       Rendered from parsed blocks (never v-html), so couple-typed text is
       always escaped. -->
  <div class="story-page" :class="[compact ? 'story-page-compact' : '', `story-page-${density}`]">
    <template v-for="(block, i) in blocks" :key="i">
      <div v-if="block.type === 'gap'" class="story-gap" />

      <div v-else-if="block.type === 'divider'" class="story-divider" aria-hidden="true">
        <!-- Flourish border, drawn in currentColor so it follows the theme
             accent. Left half is mirrored to make the right half. -->
        <svg viewBox="0 0 200 18" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" class="story-divider-svg">
          <g>
            <path d="M2 9 H60" opacity="0.55" />
            <path d="M60 9 C68 9 70 3 77 3 C83 3 84 9 79 10 C75 11 73 7 76 6" />
            <path d="M66 9 C70 13 75 15 81 14 C86 13 90 11 93 9" opacity="0.8" />
          </g>
          <g transform="translate(200 0) scale(-1 1)">
            <path d="M2 9 H60" opacity="0.55" />
            <path d="M60 9 C68 9 70 3 77 3 C83 3 84 9 79 10 C75 11 73 7 76 6" />
            <path d="M66 9 C70 13 75 15 81 14 C86 13 90 11 93 9" opacity="0.8" />
          </g>
          <rect x="97.5" y="6.5" width="5" height="5" transform="rotate(45 100 9)" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <p v-else-if="block.type === 'heading'" class="story-heading">
        <span v-for="(seg, j) in block.segments" :key="j" :class="{ 'italic': seg.italic }">{{ seg.text }}</span>
      </p>

      <p v-else class="story-line" :class="{ 'story-line-strong': block.segments.every((seg) => seg.bold) }">
        <span v-for="(seg, j) in block.segments" :key="j" :class="{ 'font-bold': seg.bold, 'italic': seg.italic }">{{ seg.text }}</span>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: string
  /** Smaller type for the editor's live preview, which is a miniature card. */
  compact?: boolean
}>(), {
  compact: false
})

const blocks = computed(() => parseStoryBlocks(props.page))

// The inner card clips anything taller than itself, so a slide holding a
// whole doa (Bismillah, verse, names, closing) has to shrink to fit, while a
// short slide keeps the roomier size. Counts only the visible characters.
const density = computed<'roomy' | 'snug' | 'dense'>(() => {
  const chars = props.page.replace(/[*#~]/g, '').replace(/\s+/g, ' ').length
  if (chars > 480) return 'dense'
  if (chars > 300) return 'snug'
  return 'roomy'
})
</script>

<style scoped>
.story-page {
  /* Classic book serif, as on printed/TikTok-style doa cards. System serif
     stack on purpose: no extra web-font to load for this one slide. */
  font-family: Georgia, 'Times New Roman', 'Cormorant Garamond', serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-weight: var(--theme-text-weight);
  color: color-mix(in srgb, var(--card-text, #fff) 88%, transparent);
}

.story-line {
  /* Sized so a long verse reads comfortably on a phone instead of
     overflowing the card (the old single block used text-lg). */
  font-size: clamp(0.9rem, 3.9vw, 1.02rem);
  line-height: 1.75;
  max-width: 28rem;
  text-wrap: balance;
}

/* A line that is entirely bold (the closing blessing) is set a touch smaller
   with light tracking, so each verse line stays on as few lines as possible. */
.story-line-strong {
  font-size: 0.88em;
  letter-spacing: 0.025em;
}

.story-heading {
  margin: 0.55rem 0;
  font-family: inherit;
  font-size: clamp(1.35rem, 6.2vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--theme-accent);
}

.story-gap {
  height: 0.85rem;
}

.story-divider {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0.9rem 0;
  color: var(--theme-accent);
}

.story-divider-svg {
  width: min(13rem, 70%);
  height: auto;
}

.story-page-snug .story-line {
  font-size: clamp(0.84rem, 3.5vw, 0.95rem);
  line-height: 1.7;
}

.story-page-snug .story-heading {
  font-size: clamp(1.25rem, 5.6vw, 1.55rem);
}

.story-page-dense .story-line {
  font-size: clamp(0.78rem, 3.3vw, 0.9rem);
  line-height: 1.62;
}

.story-page-dense .story-heading {
  font-size: clamp(1.15rem, 5.2vw, 1.4rem);
  margin: 0.35rem 0;
}

.story-page-dense .story-gap {
  height: 0.55rem;
}

.story-page-dense .story-divider {
  margin: 0.6rem 0;
}

.story-page-compact .story-line {
  font-size: 0.78rem;
  line-height: 1.6;
}

.story-page-compact .story-heading {
  font-size: 1.15rem;
  margin: 0.35rem 0;
}

.story-page-compact .story-gap {
  height: 0.5rem;
}

.story-page-compact .story-divider {
  margin: 0.55rem 0;
}
</style>
