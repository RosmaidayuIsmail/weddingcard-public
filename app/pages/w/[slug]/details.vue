<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <p class="text-xl font-display mb-4">We couldn't find that invitation.</p>
      <UButton to="/" variant="soft" color="neutral" class="rounded-full">Go home</UButton>
    </div>
  </div>

  <div v-else class="min-h-screen theme-surface text-white px-4 py-8 sm:p-10 flex items-center justify-center relative overflow-hidden bg-ink-950" :style="styleVars">
    <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))` }"></div>
    
    <div v-if="wedding.content.coverPhotoUrl" class="absolute inset-0 z-0 transition-opacity duration-1000 animate-in fade-in" :class="wedding.content.hideSystemText ? 'opacity-100' : 'opacity-40'">
      <img :src="optimizedImageUrl(wedding.content.coverPhotoUrl, 1600)" alt="Background" loading="eager" fetchpriority="high" class="w-full h-full" :class="wedding.content.hideSystemText ? 'object-contain' : 'object-cover'" />
      <!-- Matches index.vue's hero: this fade used to always render even
           with hideSystemText on, muddying the bottom of a fully custom
           image that's meant to show as-is. -->
      <div v-if="!wedding.content.hideSystemText" class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
    </div>

    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" :color="wedding.content.petalColor || ''" class="z-0" />
    <CardOrnament :style="wedding.content.ornamentStyle" :color="wedding.content.ornamentColor || 'var(--theme-accent)'" class="z-0" />

    <!-- Same background-music track as the Opening page - MusicToggle just
         hooks into the already-running singleton player, so navigating here
         doesn't restart or interrupt it. Fixed (not absolute) since this
         page scrolls, unlike the Opening page's single hero screen. -->
    <div v-if="wedding.content.audioSrc" class="fixed top-4 right-4 z-30">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <div class="max-w-lg w-full relative z-10 animate-fade-up">
      <div class="flex items-center justify-between mb-6 px-2">
        <!-- Page-level chrome, not inside the card - so it reads off
             --theme-ink (dark on light themes like Matcha Strawberry, white
             on the dark themes) rather than a hardcoded white, which used to
             go invisible on any light-background theme. -->
        <UButton
          :to="coverLink"
          variant="ghost"
          color="neutral"
          size="md"
          icon="i-heroicons-arrow-left"
          aria-label="Back to Cover"
          class="rounded-full backdrop-blur-sm text-[color-mix(in_srgb,var(--theme-ink)_75%,transparent)] hover:text-[var(--theme-ink)] bg-[color-mix(in_srgb,var(--theme-ink)_8%,transparent)] border border-[color-mix(in_srgb,var(--theme-ink)_15%,transparent)]"
        />
        <!-- accent-btn: was color="primary" (fixed brand gold) - now follows
             the couple's own theme accent, same fix as rsvp.vue's
             Continue/Confirm buttons. -->
        <UButton v-if="wedding.content.rsvpEnabled !== false" :to="rsvpLink" color="neutral" size="sm" class="accent-btn rounded-full shadow-lg font-semibold px-5">RSVP</UButton>
        <div v-else class="w-10" aria-hidden="true" />
      </div>

      <div class="flex gap-1.5 w-full mb-4 px-2">
        <div v-for="(_, index) in slideKeys.length" :key="index" class="h-1.5 flex-1 rounded-full bg-[color-mix(in_srgb,var(--theme-ink)_18%,transparent)] overflow-hidden cursor-pointer" @click="goTo(index)">
          <div 
            class="h-full transition-all duration-300"
            :class="{ 'progress-bar': currentSlide === index, 'progress-paused': paused, 'w-full': index < currentSlide, 'w-0': index > currentSlide }" 
            :style="{ background: index <= currentSlide ? 'var(--theme-accent)' : '' }" 
          />
        </div>
      </div>

      <div
        ref="cardRef"
        class="relative backdrop-blur-xl border rounded-[2rem] shadow-2xl p-8 sm:p-10 min-h-[600px] sm:min-h-[640px] flex flex-col justify-center touch-pan-y transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        :class="cardStyleResolved === 'dark' ? 'classic-inner-card' : 'classic-inner-card-theme'"
        :style="{ borderColor: 'var(--theme-accent-soft)', '--card-text': cardTextColorResolved }"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <Transition :name="direction" mode="out-in">
          <div :key="currentSlide" class="space-y-6 text-center w-full absolute left-0 px-8 sm:px-10">
            
            <template v-if="currentKey === 'story'">
              <div v-if="wedding.content.detailsTopIcon && wedding.content.detailsTopIcon !== 'none'" class="flex justify-center mb-4 w-full px-2">
                <p
                  v-if="wedding.content.detailsTopIcon === 'bismillah'"
                  class="leading-relaxed"
                  dir="rtl"
                  :style="{
                    color: 'var(--theme-accent)',
                    fontFamily: `'Amiri', 'Traditional Arabic', serif`,
                    fontSize: `clamp(1rem, ${3 * ((wedding.content.detailsIconSize ?? 100) / 100)}vw, ${1.6 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem)`
                  }"
                >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <UIcon v-else-if="wedding.content.detailsTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem`, height: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem` }" />
                <UIcon v-else-if="wedding.content.detailsTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem`, height: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem` }" />
                <img v-else-if="wedding.content.detailsTopIcon === 'custom' && wedding.content.customIconUrl" :src="wedding.content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${7 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem`, height: 'auto', maxWidth: '85%', maxHeight: `${7 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem` }">
              </div>
              <p v-if="!wedding.content.hideSystemText" class="text-[color-mix(in_srgb,var(--card-text)_90%,transparent)] text-lg leading-relaxed whitespace-pre-line" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.story }}</p>
            </template>

            <template v-else-if="currentKey === 'couple'">
              <div v-if="!wedding.content.hideSystemText">
                <!-- var(--card-text), not a literal white or
                     var(--theme-ink) - see cardStyleResolved/
                     cardTextColorResolved above. wedding.content.nameColor
                     (the "Name Color" picker on the Theme tab, also used
                     for the cover page's names) still overrides it when a
                     couple sets one explicitly. -->
                <h2 class="text-5xl leading-tight drop-shadow-lg" :style="{ color: wedding.content.nameColor || 'var(--card-text)', fontFamily: 'var(--theme-heading-font)' }">
                  {{ wedding.content.brideName }} <br/>
                  <span class="text-[0.6em] opacity-80" :style="{ color: 'var(--theme-accent)' }">&amp;</span> <br/>
                  {{ wedding.content.groomName }}
                </h2>
                <div class="h-px w-16 mx-auto my-4" :style="{ background: 'var(--theme-accent)' }"></div>
                <p class="text-sm uppercase tracking-widest text-[color-mix(in_srgb,var(--card-text)_60%,transparent)]">{{ wedding.content.coupleDividerLabel || 'Bride & Groom' }}</p>
                <div v-if="wedding.content.monogramEnabled" class="mt-5 flex justify-center">
                  <img v-if="wedding.content.monogramType === 'upload' && wedding.content.monogramImageUrl" :src="wedding.content.monogramImageUrl" alt="Monogram" class="w-12 h-12 object-contain opacity-90">
                  <span v-else class="text-2xl" :style="{ fontFamily: monogramFontFamily, color: 'var(--theme-accent)' }">{{ monogramDisplayText }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="currentKey === 'family'">
              <div v-if="!wedding.content.hideSystemText">
                <UIcon v-if="!wedding.content.bridePhotoUrl && !wedding.content.groomPhotoUrl" name="i-heroicons-users" class="w-8 h-8 mx-auto mb-4 opacity-50" :style="{ color: 'var(--theme-accent)' }" />
                <div v-if="wedding.content.brideFullName || wedding.content.brideParents" class="space-y-1">
                  <img v-if="wedding.content.bridePhotoUrl" :src="wedding.content.bridePhotoUrl" alt="" class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2" :style="{ borderColor: 'var(--theme-accent)' }">
                  <p class="text-xs uppercase tracking-widest font-semibold mb-2" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.familyBrideLabel || 'Bride' }}</p>
                  <p class="font-bold text-lg text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ wedding.content.brideFullName }}</p>
                  <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_70%,transparent)]" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.childOfLabel || 'Child of' }} <br/>{{ wedding.content.brideParents }}</p>
                </div>
                <div class="h-px bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)] w-24 mx-auto my-6" />
                <div v-if="wedding.content.groomFullName || wedding.content.groomParents" class="space-y-1">
                  <img v-if="wedding.content.groomPhotoUrl" :src="wedding.content.groomPhotoUrl" alt="" class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2" :style="{ borderColor: 'var(--theme-accent)' }">
                  <p class="text-xs uppercase tracking-widest font-semibold mb-2" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.familyGroomLabel || 'Groom' }}</p>
                  <p class="font-bold text-lg text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ wedding.content.groomFullName }}</p>
                  <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_70%,transparent)]" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.childOfLabel || 'Child of' }} <br/>{{ wedding.content.groomParents }}</p>
                </div>
              </div>
            </template>

            <template v-else-if="currentKey === 'event'">
              <div v-if="!wedding.content.hideSystemText">
                <h2 class="font-display font-semibold text-2xl mb-6" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.detailsHeading || 'The Details' }}</h2>
                <div class="space-y-4 text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">
                  <div v-if="wedding.content.dateLabel" class="flex flex-col items-center">
                    <UIcon name="i-heroicons-calendar" class="w-5 h-5 mb-1 opacity-70" />
                    <p class="font-medium text-lg">{{ wedding.content.dateLabel }}</p>
                  </div>
                  <div v-if="wedding.content.timeLabel" class="flex flex-col items-center">
                    <UIcon name="i-heroicons-clock" class="w-5 h-5 mb-1 opacity-70" />
                    <p class="font-medium text-lg">{{ wedding.content.timeLabel }}</p>
                  </div>
                  <div v-if="wedding.content.venueName" class="flex flex-col items-center pt-2">
                    <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 mb-1 opacity-70" />
                    <p class="font-semibold text-lg">{{ wedding.content.venueName }}</p>
                    <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mt-1 max-w-[250px] mx-auto">{{ wedding.content.venueAddress }}</p>
                  </div>
                </div>
              </div>
              <div class="flex justify-center pt-6" :class="{ 'pt-12': wedding.content.hideSystemText }">
                <AddToCalendarButton
                  :bride-name="wedding.content.brideName"
                  :groom-name="wedding.content.groomName"
                  :date-iso="wedding.content.dateISO"
                  :venue-name="wedding.content.venueName"
                  :venue-address="wedding.content.venueAddress"
                  :rsvp-deadline-label="wedding.content.rsvpDeadlineLabel"
                  :label="wedding.content.calendarButtonLabel"
                  class="rounded-full shadow-lg"
                />
              </div>
            </template>

            <template v-else-if="currentKey === 'location'">
              <h2 class="font-display font-semibold text-2xl mb-2" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.locationHeading || 'Location' }}</h2>
              <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mb-6">{{ wedding.content.locationSubtitle || 'Scan or tap to open in Maps' }}</p>
              <div class="flex flex-col items-center gap-6">
                <div class="p-3 bg-white rounded-2xl shadow-xl">
                  <img :src="qrCodeUrl" :alt="`QR code linking to the venue on ${wedding.content.locationMapsButtonLabel || 'Google Maps'}`" class="w-36 h-36" loading="lazy">
                </div>
                <UButton :to="wedding.content.mapUrl" target="_blank" external icon="i-heroicons-map-pin" color="neutral" class="accent-btn font-semibold rounded-full px-6 shadow-md">
                  {{ wedding.content.locationMapsButtonLabel || 'Google Maps' }}
                </UButton>
              </div>
            </template>

            <template v-else-if="currentKey === 'gift'">
              <h2 class="font-display font-semibold text-2xl mb-4" :style="{ color: 'var(--theme-accent)' }">A Gift of Love</h2>
              <GiftCard :banks="[wedding.content.bank, wedding.content.bank2]" />
            </template>

            <template v-else-if="currentKey === 'flow'">
              <h2 class="font-display font-semibold text-2xl mb-6" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.eventFlowHeading || 'Event Flow' }}</h2>
              <FlowTimeline :items="wedding.flow" />
            </template>
          </div>
        </Transition>

        <div class="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer" @click="manualPrev"></div>
        <div class="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer" @click="manualNext"></div>
      </div>

      <div class="flex justify-center gap-12 mt-6 text-[color-mix(in_srgb,var(--theme-ink)_45%,transparent)]">
        <button type="button" aria-label="Previous slide" class="hover:text-[var(--theme-ink)] transition-colors p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)]" @click="manualPrev">
          <UIcon name="i-heroicons-chevron-left" class="w-8 h-8" />
        </button>
        <button type="button" aria-label="Next slide" class="hover:text-[var(--theme-ink)] transition-colors p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)]" @click="manualNext">
          <UIcon name="i-heroicons-chevron-right" class="w-8 h-8" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { autoMonogramText } from '~/composables/useWeddingTypes'

const route = useRoute()
const slug = route.params.slug as string

const guestNameQuery = computed(() => {
  const raw = route.query.to
  return typeof raw === 'string' ? raw : ''
})

const coverLink = computed(() => (guestNameQuery.value ? `/w/${slug}?to=${encodeURIComponent(guestNameQuery.value)}` : `/w/${slug}`))
const rsvpLink = computed(() => (guestNameQuery.value ? `/w/${slug}/rsvp?to=${encodeURIComponent(guestNameQuery.value)}` : `/w/${slug}/rsvp`))

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars, resolveCardStyle } = useThemes()

// Same cardStyle resolution as the RSVP page (app/pages/w/[slug]/rsvp.vue) -
// see useThemes.ts's resolveCardStyle for the full reasoning.
const cardStyleResolved = computed(() => resolveCardStyle(wedding.value?.themeId, wedding.value?.content.cardStyle))
const cardTextColorResolved = computed(() =>
  wedding.value?.content.cardTextColor || (cardStyleResolved.value === 'dark' ? '#ffffff' : 'var(--theme-ink)')
)

const monogramDisplayText = computed(() => {
  const content = wedding.value?.content
  if (!content) return ''
  if (content.monogramType === 'custom-text' && content.monogramText) return content.monogramText
  return autoMonogramText(content.brideName, content.groomName) || `${content.brideName?.charAt(0) || ''} & ${content.groomName?.charAt(0) || ''}`
})

const monogramFontFamily = computed(() => {
  const content = wedding.value?.content
  if (!content) return 'serif'
  if (content.monogramFontFamily) return content.monogramFontFamily
  return `'${content.monogramFont || 'Cormorant Garamond'}', serif`
})

const styleVars = computed(() =>
  themeStyleVars(
    wedding.value?.themeId,
    {
      bgFrom: wedding.value?.content.customBgFrom,
      bgTo: wedding.value?.content.customBgTo,
      accent: wedding.value?.content.customAccent
    },
    wedding.value?.content.customFontFamily || wedding.value?.content.fontFamily,
    wedding.value?.content.textWeight
  )
)

useHead({
  link: computed(() => {
    const links: Array<{ rel: string; href: string }> = []
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: wedding.value.content.customFontUrl })
    }
    if (wedding.value?.content.monogramFontUrl && !wedding.value.content.monogramFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: wedding.value.content.monogramFontUrl })
    }
    return links
  })
})

const slideKeys = computed(() => {
  if (!wedding.value) return ['story']
  const keys = ['story', 'couple']
  if (wedding.value.content.brideFullName || wedding.value.content.groomFullName) keys.push('family')
  keys.push('event')
  if (wedding.value.content.mapUrl) keys.push('location')
  if (wedding.value.content.enableGift && (
    wedding.value.content.bank?.accountNumber || wedding.value.content.bank?.qrCodeUrl ||
    wedding.value.content.bank2?.accountNumber || wedding.value.content.bank2?.qrCodeUrl
  )) {
    keys.push('gift')
  }
  if (wedding.value.flow?.length) keys.push('flow')
  return keys
})

const currentSlide = ref(0)
const currentKey = computed(() => slideKeys.value[currentSlide.value] ?? 'story')
const direction = ref<'slide-next' | 'slide-prev'>('slide-next')
const paused = ref(false)
const cardRef = ref<HTMLElement | null>(null)

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(wedding.value?.content.mapUrl ?? '')}&size=200x200`
)

function goTo(index: number) {
  if (index === currentSlide.value) return
  direction.value = index > currentSlide.value ? 'slide-next' : 'slide-prev'
  currentSlide.value = index
  restartAutoSlide()
}

function next() {
  direction.value = 'slide-next'
  currentSlide.value = (currentSlide.value + 1) % slideKeys.value.length
}

function prev() {
  direction.value = 'slide-prev'
  currentSlide.value = (currentSlide.value - 1 + slideKeys.value.length) % slideKeys.value.length
}

// Called by user-facing controls (arrow buttons, click zones, swipe) so a
// manual navigation always restarts the 7s auto-advance window - without
// this, the background timer could fire moments after a manual click,
// making it look like the slide "flashed" then jumped on its own.
function manualNext() {
  next()
  restartAutoSlide()
}

function manualPrev() {
  prev()
  restartAutoSlide()
}

let autoSlideInterval: ReturnType<typeof setInterval> | null = null

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    if (!paused.value) next()
  }, 7000)
}

function restartAutoSlide() {
  if (autoSlideInterval) clearInterval(autoSlideInterval)
  startAutoSlide()
}

onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  if (autoSlideInterval) clearInterval(autoSlideInterval)
})

const { direction: swipeDirection, isSwiping } = useSwipe(cardRef, {
  threshold: 40,
  onSwipeEnd() {
    if (swipeDirection.value === 'left') manualNext()
    else if (swipeDirection.value === 'right') manualPrev()
  }
})

watch(isSwiping, (value) => {
  paused.value = value
})

onKeyStroke('ArrowRight', () => manualNext())
onKeyStroke('ArrowLeft', () => manualPrev())

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({ title: `Wedding Details — ${value.content.brideName} & ${value.content.groomName}` })
  },
  { immediate: true }
)
</script>

<style scoped>
/* Same fix as rsvp.vue's .accent-btn: UButton's color="primary" is a fixed
   brand gold (app.config.ts), not the couple's own theme. !important beats
   Nuxt UI's own color classes. */
.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}
.accent-btn:hover {
  filter: brightness(1.08);
}

/* Two looks, chosen per-wedding by cardStyleResolved (see the script setup
   computed above, backed by useThemes.ts's resolveCardStyle) - same
   pattern as app/pages/w/[slug]/rsvp.vue's .classic-rsvp-card/
   .classic-rsvp-card-theme; see that file's detailed comment for the full
   reasoning. Every descendant above reads its color from --card-text via
   color-mix(), set inline via cardTextColorResolved. */
.classic-inner-card {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 30%, #0a1420) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 25%, #050b14) 100%
  );
  color: var(--card-text, #fff);
}

.classic-inner-card-theme {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 92%, var(--theme-ink, #000) 8%) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 88%, var(--theme-ink, #000) 12%) 100%
  );
  color: var(--card-text, var(--theme-ink, #fff));
}

.progress-bar {
  animation: progress 7s linear forwards;
  width: 0%;
}

.progress-paused {
  animation-play-state: paused;
}

@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-next-enter-from { opacity: 0; transform: scale(0.95) translateX(30px); }
.slide-next-leave-to { opacity: 0; transform: scale(0.95) translateX(-30px); }
.slide-prev-enter-from { opacity: 0; transform: scale(0.95) translateX(-30px); }
.slide-prev-leave-to { opacity: 0; transform: scale(0.95) translateX(30px); }

@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    animation: none;
    width: 100%;
  }
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: opacity 0.3s ease;
  }
  .slide-next-enter-from, .slide-next-leave-to,
  .slide-prev-enter-from, .slide-prev-leave-to {
    transform: none;
  }
}
</style>