<template>
  <div class="preview-card" :style="styleVars">
    <div class="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
    <CardOrnament :style="content.ornamentStyle" color="var(--theme-accent)" class="pointer-events-none" />
    <div v-if="content.coverPhotoUrl" class="preview-photo pointer-events-none" :style="{ backgroundImage: `url(${content.coverPhotoUrl})` }" />

    <template v-if="!content.hideSystemText">
      
      <!-- 1. Top Icon -->
      <div v-if="content.innerTopIcon && content.innerTopIcon !== 'none'"
           class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.icon }"
           :style="{ left: `${content.iconX ?? 50}%`, top: `${content.iconY ?? 15}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'icon')"
      >
        <span v-if="content.innerTopIcon === 'bismillah'" class="text-4xl" :style="{ color: 'var(--theme-accent)', fontFamily: `'Amiri', 'Traditional Arabic', serif` }">﷽</span>
        <UIcon v-else-if="content.innerTopIcon === 'rings'" name="i-heroicons-lifebuoy" class="w-8 h-8" :style="{ color: 'var(--theme-accent)' }" />
        <UIcon v-else-if="content.innerTopIcon === 'heart'" name="i-heroicons-heart" class="w-8 h-8" :style="{ color: 'var(--theme-accent)' }" />
        <img v-else-if="content.innerTopIcon === 'custom' && content.customIconUrl" :src="content.customIconUrl" alt="" class="w-12 h-12 object-contain drop-shadow">
      </div>

      <!-- 2. Greeting -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.greeting }"
           :style="{ left: `${content.greetingX ?? 50}%`, top: `${content.greetingY ?? 25}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'greeting')"
      >
        <p class="preview-eyebrow">{{ content.innerGreeting || "You're Invited" }}</p>
      </div>

      <!-- 3. Intro -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.intro }"
           :style="{ left: `${content.introX ?? 50}%`, top: `${content.introY ?? 32}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'intro')"
      >
        <p class="preview-meta text-[0.65rem] !opacity-70 italic whitespace-nowrap">{{ content.innerIntro || "To the wedding celebration of" }}</p>
      </div>

      <!-- 4. Names (Supports Horizontal & Vertical) -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.names }"
           :style="{ left: `${content.namesX ?? 50}%`, top: `${content.namesY ?? 50}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'names')"
      >
        <div v-if="content.namesLayout === 'vertical'" class="flex flex-col items-center gap-1 font-heading preview-names drop-shadow-lg" :style="{ fontFamily: 'var(--theme-heading-font)' }">
          <span>{{ content.brideName || 'Bride' }}</span>
          <span class="text-[0.45em] text-gold-300 opacity-80 leading-none">&amp;</span>
          <span>{{ content.groomName || 'Groom' }}</span>
        </div>
        <p v-else class="font-heading preview-names drop-shadow-lg whitespace-nowrap" :style="{ fontFamily: 'var(--theme-heading-font)' }">
          {{ content.brideName || 'Bride' }} <span class="text-[0.6em] mx-1 text-gold-300 opacity-80">&amp;</span> {{ content.groomName || 'Groom' }}
        </p>
      </div>

      <!-- 5. Date -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.date }"
           :style="{ left: `${content.dateX ?? 50}%`, top: `${content.dateY ?? 70}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'date')"
      >
        <p class="preview-meta font-medium whitespace-nowrap">{{ content.dateLabel || 'Wedding date' }}</p>
      </div>

      <!-- 6. Venue -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.venue }"
           :style="{ left: `${content.venueX ?? 50}%`, top: `${content.venueY ?? 78}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'venue')"
      >
        <p class="preview-meta text-xs whitespace-nowrap">{{ content.venueName || 'Venue' }}</p>
      </div>

    </template>

    <!-- Footer reservation guide (edit mode only) - the live page pins RSVP/Details
         buttons here, so dragged text should stay above this zone -->
    <div
      v-if="editable"
      class="absolute inset-x-0 bottom-0 z-10 pointer-events-none flex items-start justify-center pt-2"
      style="height: 22%; background: linear-gradient(to top, rgba(0,0,0,0.35), transparent);"
    >
      <span class="text-[9px] uppercase tracking-widest text-white/40">Buttons area — avoid placing text here</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeddingContent } from '~/composables/useWeddingTypes'

const props = defineProps<{ 
  content: WeddingContent; 
  themeId: string;
  editable?: boolean;
}>()

const { themeStyleVars } = useThemes()

const styleVars = computed(() =>
  themeStyleVars(
    props.themeId,
    { bgFrom: props.content.customBgFrom, bgTo: props.content.customBgTo, accent: props.content.customAccent },
    props.content.customFontFamily || props.content.fontFamily 
  )
)

const isDragging = ref<Record<string, boolean>>({ icon: false, greeting: false, intro: false, names: false, date: false, venue: false })

function onPointerDown(e: PointerEvent, key: string) {
  if (!props.editable) return
  e.preventDefault()
  isDragging.value[key] = true

  const parent = (e.currentTarget as HTMLElement).parentElement
  if (!parent) return

  const rect = parent.getBoundingClientRect()

  const onPointerMove = (moveEvent: PointerEvent) => {
    let x = ((moveEvent.clientX - rect.left) / rect.width) * 100
    let y = ((moveEvent.clientY - rect.top) / rect.height) * 100
    
    // Lock within sensible bounds so it doesn't get completely lost off-screen
    props.content[`${key}X` as keyof WeddingContent] = Math.max(5, Math.min(95, x))
    props.content[`${key}Y` as keyof WeddingContent] = Math.max(5, Math.min(95, y))
  }

  const onPointerUp = () => {
    isDragging.value[key] = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
</script>

<style scoped>
.preview-card {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 19;
  height: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  background: linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to));
  border: 1px solid var(--theme-accent-soft);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  touch-action: none;
}

.preview-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.45;
}

.preview-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--theme-accent);
  white-space: nowrap;
}

.preview-names {
  color: var(--theme-ink);
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  line-height: 1.1;
}

.preview-meta {
  font-size: 0.8rem;
  color: var(--theme-ink);
  opacity: 0.85;
  font-weight: 300;
  letter-spacing: 0.05em;
}
</style>