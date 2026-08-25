<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
    <p class="animate-pulse tracking-widest uppercase text-xs">Loading Invitation...</p>
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 text-gold-300/50 mb-4 mx-auto" />
      <p class="text-xl font-display mb-6">We couldn't find that invitation.</p>
      <UButton to="/" variant="soft" color="neutral" size="lg" class="rounded-full px-8">Return Home</UButton>
    </div>
  </div>

  <!-- 'story' opts a wedding into the single-scroll layout (StoryInvite.vue)
       instead of this classic hero+footer markup. Old weddings with no
       layoutStyle saved yet fall back to 'classic' via createDefaultContent(),
       so this v-else-if condition is the only thing gating the branch - the
       classic markup itself is untouched. -->
  <div v-else-if="wedding.content.layoutStyle !== 'story'" class="theme-surface text-white relative overflow-hidden" :style="styleVars">
    <!-- Admin-authored Custom Code (Platform Admin > Custom Code), rendered
         inside a sandboxed iframe - see CustomCodeBlock.vue for the safety
         design. Position is admin-configurable; defaults to bottom. -->
    <CustomCodeBlock v-if="customCode.position === 'top'" class="relative z-20" />

    <!-- Decorative background layers live at the page level (not inside the
         hero canvas below) specifically so they visually continue across
         the footer too, instead of stopping abruptly at the hero's edge.

         Cropped full-bleed with object-cover, same as the Opening and
         Details pages - always full width, never boxed/centered. Legibility
         for the text on top comes from a black tint overlay + the bottom
         fade below, NOT from dimming the photo itself, so the photo stays
         as vibrant/visible as it is on those other pages. -->
    <!-- Mounted as soon as the wedding loads (not gated on `opened`) so the
         browser starts downloading this photo while the guest is still
         looking at the envelope, instead of only starting once they tap it
         open - that delay was exactly why the background used to pop in
         late/unfinished right after the open animation. Visibility is
         controlled separately by opacity below, once BOTH the envelope is
         open AND the image has actually finished loading. -->
    <div v-if="wedding.content.coverPhotoUrl" class="absolute inset-0 z-0 transition-opacity duration-700" :class="opened && coverPhotoLoaded ? 'opacity-100' : 'opacity-0'">
      <img
        :src="optimizedCoverPhotoUrl"
        alt="Background"
        loading="eager"
        fetchpriority="high"
        class="w-full h-full animate-[pulse_20s_ease-in-out_infinite_alternate]"
        :class="wedding.content.hideSystemText ? 'object-contain' : 'object-cover scale-105'"
        @load="coverPhotoLoaded = true"
      >
      <div v-if="!wedding.content.hideSystemText" class="absolute inset-0 bg-black/40"></div>
      <!-- This bottom fade used to always render, even with hideSystemText
           on - so a couple's fully custom, edge-to-edge design (baked-in
           typography, no room for a dimmed band) still got its bottom third
           muddied into the theme's background color regardless. Gated the
           same way as the black tint above now, so "use my image as-is"
           actually means as-is. -->
      <div v-if="!wedding.content.hideSystemText" class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent 0%, var(--theme-bg-to) 90%)` }" />
    </div>
    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" />
    <CardOrnament v-if="opened" :style="wedding.content.ornamentStyle" color="var(--theme-accent)" />

    <!-- HERO CANVAS: every 0-100% position below is relative to THIS box only,
         same as the editor's preview mockup. Nothing else on the page shares
         this coordinate space, so nothing can ever collide with it. -->
    <div class="relative overflow-hidden" :style="{ minHeight: 'max(100vh, 700px)' }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />

      <div v-if="opened" class="absolute top-6 right-6 z-30">
        <!-- autoplay: this only mounts the instant the guest taps the
             envelope open, so calling play() here happens within that same
             tap's "user gesture" window - browsers allow autoplay-with-sound
             right after a real tap/click, just not on page load with no
             interaction at all. Falls back to the muted icon (silently) if
             a particular browser still blocks it. -->
        <MusicToggle v-if="wedding.content.audioSrc" :src="wedding.content.audioSrc" autoplay />
      </div>

      <div v-if="opened && !wedding.content.hideSystemText" class="absolute inset-0 z-10">
        <!-- 1. Icon -->
        <div
          v-if="wedding.content.innerTopIcon && wedding.content.innerTopIcon !== 'none'"
          class="absolute flex flex-col items-center justify-center text-center w-full max-w-[92vw] px-4 animate-in fade-in zoom-in delay-100"
          :style="{ left: `${wedding.content.iconX ?? 50}%`, top: `${wedding.content.iconY ?? 15}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p
            v-if="wedding.content.innerTopIcon === 'bismillah'"
            class="leading-relaxed"
            dir="rtl"
            :style="{
              color: 'var(--theme-accent)',
              fontFamily: `'Amiri', 'Traditional Arabic', serif`,
              fontSize: `clamp(1.25rem, ${3.2 * ((wedding.content.iconSize ?? 100) / 100)}vw, ${1.9 * ((wedding.content.iconSize ?? 100) / 100)}rem)`
            }"
          >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <UIcon v-else-if="wedding.content.innerTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem`, height: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem` }" />
          <UIcon v-else-if="wedding.content.innerTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem`, height: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem` }" />
          <img v-else-if="wedding.content.innerTopIcon === 'custom' && wedding.content.customIconUrl" :src="wedding.content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${7 * ((wedding.content.iconSize ?? 100) / 100)}rem`, height: 'auto', maxWidth: '90vw', maxHeight: `${7 * ((wedding.content.iconSize ?? 100) / 100)}rem` }">
          <p v-if="wedding.content.iconSubtitle" class="mt-3 text-xs sm:text-sm text-white/60 italic">{{ wedding.content.iconSubtitle }}</p>
        </div>

        <!-- 2. Greeting -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-150"
          :style="{ left: `${wedding.content.greetingX ?? 50}%`, top: `${wedding.content.greetingY ?? 25}%`, transform: 'translate(-50%, -50%)' }"
        >
          <h1 class="text-sm sm:text-base tracking-[0.35em] uppercase drop-shadow-md" :style="{ color: 'var(--theme-accent)', fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.innerGreeting || "You're Invited" }}
          </h1>
        </div>

        <!-- 3. Intro -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.introX ?? 50}%`, top: `${wedding.content.introY ?? 32}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-base sm:text-lg text-white/80 italic drop-shadow-md" :style="{ fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.innerIntro || "To the wedding celebration of" }}
          </p>
        </div>

        <!-- 4. Names -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.namesX ?? 50}%`, top: `${wedding.content.namesY ?? 50}%`, transform: 'translate(-50%, -50%)' }"
        >
          <!-- Vertical Layout -->
          <div v-if="wedding.content.namesLayout === 'vertical'" class="flex flex-col items-center gap-0 font-heading drop-shadow-2xl" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${2 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${4.2 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${3 * ((wedding.content.nameSize ?? 100) / 100)}rem)`, lineHeight: '1.15' }">
            <span>{{ wedding.content.brideName }}</span>
            <span class="text-[0.4em] opacity-80 leading-none" style="color: #e3b04a;">&amp;</span>
            <span>{{ wedding.content.groomName }}</span>
          </div>
          
          <!-- ADDED: Diagonal Layout -->
          <div v-else-if="wedding.content.namesLayout === 'diagonal'" class="flex flex-col font-heading drop-shadow-2xl w-full max-w-xs mx-auto" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${2.5 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${5 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${3.5 * ((wedding.content.nameSize ?? 100) / 100)}rem)`, lineHeight: '1.1' }">
            <span class="self-start text-left ml-4 sm:-ml-8">{{ wedding.content.brideName }}</span>
            <span class="text-[0.5em] opacity-80 leading-none self-center my-2" style="color: #e3b04a;">&amp;</span>
            <span class="self-end text-right mr-4 sm:-mr-8">{{ wedding.content.groomName }}</span>
          </div>

          <!-- Horizontal Layout (Fallback/Default) -->
          <h2 v-else class="drop-shadow-2xl leading-tight" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${3.5 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${8 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${6 * ((wedding.content.nameSize ?? 100) / 100)}rem)` }">
            {{ wedding.content.brideName }} <span class="text-[0.7em] mx-2 opacity-80" style="color: #e3b04a;">&amp;</span> {{ wedding.content.groomName }}
          </h2>
        </div>

        <!-- 5. Date -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-500"
          :style="{ left: `${wedding.content.dateX ?? 50}%`, top: `${wedding.content.dateY ?? 70}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-sm sm:text-base font-medium text-white/90 drop-shadow-md">
            {{ wedding.content.dateLabel }}
          </p>
        </div>

        <!-- 6. Venue -->
        <div
          class="absolute w-full max-w-md text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-500"
          :style="{ left: `${wedding.content.venueX ?? 50}%`, top: `${wedding.content.venueY ?? 78}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p v-if="wedding.content.venueAddress" class="text-xs sm:text-sm text-white/80 italic drop-shadow-md" :style="{ fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.venueAddress }}
          </p>
        </div>
      </div>

      <!-- A small "scroll for more" cue only makes sense once content is open -->
      <div v-if="opened" class="absolute bottom-4 inset-x-0 flex justify-center z-10 pointer-events-none animate-bounce opacity-60">
        <UIcon name="i-heroicons-chevron-down" class="w-6 h-6" :style="{ color: 'var(--theme-accent)' }" />
      </div>
    </div>

    <!-- FOOTER: normal document flow, always directly below the hero canvas -
         never overlaps anything above since it's a separate layout region,
         not absolutely positioned on top of it. -->
    <div v-if="opened" class="relative z-20 flex flex-col items-center pb-16 pt-12 px-6 bg-gradient-to-b from-transparent to-black/30 animate-in fade-in duration-700">
      <div v-if="wedding.content.dateISO" class="mb-8">
        <CountdownTimer :target="wedding.content.dateISO" />
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
        <UButton
          :to="detailsLink"
          size="xl"
          :color="wedding.content.rsvpEnabled === false ? 'primary' : 'neutral'"
          :variant="wedding.content.rsvpEnabled === false ? 'solid' : 'soft'"
          class="w-full sm:w-auto font-medium rounded-full px-8 transition-colors"
          :class="wedding.content.rsvpEnabled === false ? 'shadow-[0_0_30px_-5px_var(--theme-accent)] animate-glow' : 'bg-white/5 hover:bg-white/10 border border-white/10'"
        >
          {{ wedding.content.btnDetails || 'View Details' }}
        </UButton>
        <UButton v-if="wedding.content.rsvpEnabled !== false" :to="rsvpLink" size="xl" color="primary" class="w-full sm:w-auto font-semibold rounded-full px-10 shadow-[0_0_30px_-5px_var(--theme-accent)] hover:scale-105 transition-transform animate-glow">
          {{ wedding.content.btnRsvp || 'RSVP Now' }}
        </UButton>
      </div>
      <div class="mt-6 opacity-80 hover:opacity-100 transition-opacity">
        <ShareButtons :bride-name="wedding.content.brideName" :groom-name="wedding.content.groomName" :date-label="wedding.content.dateLabel" :share-message="wedding.content.shareMessage" />
      </div>

      <CustomCodeBlock v-if="customCode.position !== 'top'" class="mt-10 w-full max-w-lg mx-auto" />
    </div>
  </div>

  <StoryInvite v-else :wedding="wedding" :guest-name="guestName" :rsvp-link="rsvpLink" />
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars, customCode } = useThemes()

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

// Optimized (auto-format/auto-quality/width-capped) version of the cover
// photo - see optimizedImageUrl() in useCloudinary.ts for why. coverPhotoLoaded
// tracks whether it's actually finished downloading, so it only fades in
// once it's ready rather than popping in half-rendered.
const optimizedCoverPhotoUrl = computed(() => optimizedImageUrl(wedding.value?.content.coverPhotoUrl, 1600))
const coverPhotoLoaded = ref(false)

useHead({
  link: computed(() => {
    const links: Array<Record<string, string>> = []
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: wedding.value.content.customFontUrl })
    }
    // Kick off the cover photo download as early as possible - before the
    // <img> tag even exists yet - so it's ready well before the guest taps
    // the envelope open.
    if (optimizedCoverPhotoUrl.value) {
      links.push({ rel: 'preload', as: 'image', href: optimizedCoverPhotoUrl.value, fetchpriority: 'high' })
    }
    return links
  })
})

const guestName = computed(() => {
  const raw = route.query.to
  return typeof raw === 'string' ? raw : ''
})

const detailsLink = computed(() => (guestName.value ? `/w/${slug}/details?to=${encodeURIComponent(guestName.value)}` : `/w/${slug}/details`))
const rsvpLink = computed(() => (guestName.value ? `/w/${slug}/rsvp?to=${encodeURIComponent(guestName.value)}` : `/w/${slug}/rsvp`))

const opened = ref(false)

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({
      title: `${value.content.openingTitle || "You're Invited"} \u2014 ${value.content.brideName} & ${value.content.groomName}'s Wedding`,
      description: value.content.dateLabel
        ? `Join us on ${value.content.dateLabel} as we celebrate our wedding. View the details and RSVP online.`
        : 'View the wedding details and RSVP online.'
    })
  },
  { immediate: true }
)

// Primes the background-music track (buffers the audio file / readies the
// hidden YouTube player) the moment the wedding loads, while the guest is
// still looking at the closed envelope - not just when they tap it open.
// MusicToggle's own ensurePlaying() call on tap then has little to nothing
// left to wait for, instead of starting the download from zero at that
// exact moment (which was the audible lag).
const { preparePlayer } = useBackgroundMusic()
watch(
  () => wedding.value?.content.audioSrc,
  (src) => {
    if (src) preparePlayer(src)
  },
  { immediate: true }
)
</script>