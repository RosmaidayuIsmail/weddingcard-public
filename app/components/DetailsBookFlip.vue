<template>
  <div class="book-flip-wrap">
    <div v-show="!bookReady" class="book-loading">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" style="color: var(--theme-accent)" />
    </div>

    <!-- Cover page: a closed-book splash, shown alone (showCover) until
         tapped - the couple's names/monogram standing in for a printed
         cover, styled to match the wedding's own theme instead of a
         generic book texture. -->
    <div v-show="bookReady" ref="bookEl" class="book-container">
      <div class="book-page book-cover" @click="openBook">
        <div class="book-cover-inner" :class="cardStyleClass" :style="{ borderColor: 'var(--theme-accent-soft)', '--card-text': cardTextColor }">
          <div v-if="monogramEnabled" class="mb-4">
            <img v-if="monogramType === 'upload' && monogramImageUrl" :src="monogramImageUrl" alt="Monogram" class="w-14 h-14 object-contain mx-auto opacity-90">
            <span v-else class="text-3xl" :style="{ fontFamily: monogramFontFamily, color: 'var(--theme-accent)' }">{{ monogramDisplayText }}</span>
          </div>
          <UIcon v-else name="i-heroicons-heart" class="w-8 h-8 mx-auto mb-4 opacity-70" :style="{ color: 'var(--theme-accent)' }" />
          <h2 class="text-3xl leading-tight drop-shadow-lg" :style="{ color: 'var(--card-text)', fontFamily: 'var(--theme-heading-font)' }">
            {{ brideName }}
            <span class="block text-[0.55em] opacity-70 my-1" :style="{ color: 'var(--theme-accent)' }">&amp;</span>
            {{ groomName }}
          </h2>
          <div class="h-px w-14 mx-auto my-5" :style="{ background: 'var(--theme-accent)' }"></div>
          <p class="cover-hint" :style="{ color: 'var(--theme-accent)' }">
            <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 inline-block mr-1.5 align-[-0.15em]" />
            Tap to open
          </p>
        </div>
      </div>

      <div v-for="page in pages" :key="page.key" class="book-page book-content-page" :class="cardStyleClass" :style="{ borderColor: 'var(--theme-accent-soft)', '--card-text': cardTextColor }">
        <div class="book-page-inner">
          <h3 class="book-page-title" :style="{ color: 'var(--theme-accent)' }">{{ page.label }}</h3>
          <DetailsSlideContent
            :slide-key="page.key"
            :content="content"
            :flow="flow"
            :menu="menu"
            :qr-code-url="qrCodeUrl"
            :monogram-display-text="monogramDisplayText"
            :monogram-font-family="monogramFontFamily"
          />
        </div>
      </div>
    </div>

    <div v-show="bookReady" class="book-nav">
      <button type="button" aria-label="Previous page" class="book-nav-btn" :disabled="currentPage === 0" @click="flipPrev">
        <UIcon name="i-heroicons-chevron-left" class="w-6 h-6" />
      </button>
      <span class="book-nav-count">{{ currentPage === 0 ? 'Cover' : `${currentPage} / ${pages.length}` }}</span>
      <button type="button" aria-label="Next page" class="book-nav-btn" :disabled="currentPage >= pages.length" @click="flipNext">
        <UIcon name="i-heroicons-chevron-right" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlowItem, MenuItem, WeddingContent } from '~/composables/useWeddingTypes'

const props = defineProps<{
  pages: Array<{ key: string; label: string }>
  content: WeddingContent
  flow: FlowItem[]
  menu: MenuItem[]
  qrCodeUrl: string
  monogramDisplayText: string
  monogramFontFamily: string
  cardStyleResolved: 'dark' | 'glass' | 'theme'
  cardTextColor: string
}>()

const brideName = computed(() => props.content.brideName)
const groomName = computed(() => props.content.groomName)
const monogramEnabled = computed(() => props.content.monogramEnabled)
const monogramType = computed(() => props.content.monogramType)
const monogramImageUrl = computed(() => props.content.monogramImageUrl)

const cardStyleClass = computed(() => {
  if (props.cardStyleResolved === 'dark') return 'book-page-dark'
  if (props.cardStyleResolved === 'glass') return 'book-page-glass'
  return 'book-page-theme'
})

const bookEl = ref<HTMLElement | null>(null)
const bookReady = ref(false)
const currentPage = ref(0) // 0 = cover, 1..N = pages[0..N-1]

// PageFlip attaches window listeners the instant it's constructed and has
// no bundled types (see app/types/page-flip.d.ts) - it must only ever be
// created client-side, after the page elements above already exist in the
// DOM (loadFromHTML reparents the real elements, it doesn't clone them, so
// Vue's scoped styles on .book-page/.book-page-inner keep applying
// wherever the library moves them).
let pageFlip: import('page-flip').PageFlip | null = null

onMounted(async () => {
  if (!import.meta.client || !bookEl.value) return
  const { PageFlip } = await import('page-flip')

  pageFlip = new PageFlip(bookEl.value, {
    width: 380,
    height: 560,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 480,
    minHeight: 420,
    maxHeight: 640,
    showCover: true,
    usePortrait: true,
    mobileScrollSupport: true,
    flippingTime: 700,
    maxShadowOpacity: 0.4
  })

  const pageEls = bookEl.value.querySelectorAll<HTMLElement>('.book-page')
  pageFlip.loadFromHTML(pageEls)
  pageFlip.on('flip', (e) => { currentPage.value = e.data })

  await nextTick()
  bookReady.value = true
})

onBeforeUnmount(() => {
  pageFlip?.destroy()
  pageFlip = null
})

function openBook() {
  if (currentPage.value === 0) pageFlip?.flipNext()
}

function flipNext() {
  pageFlip?.flipNext()
}

function flipPrev() {
  pageFlip?.flipPrev()
}

onKeyStroke('ArrowRight', () => flipNext())
onKeyStroke('ArrowLeft', () => flipPrev())
</script>

<style scoped>
.book-flip-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.book-loading {
  min-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.book-container {
  width: 100%;
  max-width: 420px;
  height: 560px;
  margin: 0 auto;
}

.book-page {
  overflow: hidden;
}

.book-cover {
  cursor: pointer;
}

.book-cover-inner,
.book-page-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 2.25rem 1.75rem;
}

.book-page-inner {
  overflow-y: auto;
  justify-content: flex-start;
}

.book-page-title {
  font-family: var(--theme-heading-font);
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 1.25rem;
  opacity: 0.85;
}

.cover-hint {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  animation: cover-hint-pulse 2.2s ease-in-out infinite;
}

@keyframes cover-hint-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

.book-page-dark {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 30%, #0a1420) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 25%, #050b14) 100%
  );
  color: var(--card-text, #fff);
  border: 1px solid var(--theme-accent-soft);
}

.book-page-theme {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 92%, var(--theme-ink, #000) 8%) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 88%, var(--theme-ink, #000) 12%) 100%
  );
  color: var(--card-text, var(--theme-ink, #fff));
  border: 1px solid var(--theme-accent-soft);
}

.book-page-glass {
  background: color-mix(in srgb, var(--theme-bg-from, #ffffff) 30%, transparent);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid color-mix(in srgb, var(--theme-ink, #000000) 12%, transparent);
  color: var(--card-text, var(--theme-ink));
}

.book-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.25rem;
  color: color-mix(in srgb, var(--theme-ink) 55%, transparent);
}

.book-nav-btn {
  padding: 0.5rem;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.book-nav-btn:hover:not(:disabled) {
  color: var(--theme-ink);
  background: color-mix(in srgb, var(--theme-ink) 10%, transparent);
}

.book-nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.book-nav-count {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  min-width: 4.5rem;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .cover-hint {
    animation: none;
  }
}
</style>

<!-- Unscoped: page-flip's own generated wrapper elements (.stf__parent,
     .stf__block, etc.) sit around our scoped .book-page elements but were
     never created by this component's template, so Vue's scoped attribute
     never reaches them - these two rules are the only overrides needed for
     the library's own chrome to sit flush with the rest of the card. -->
<style>
.stf__parent {
  margin: 0 auto;
}
</style>
