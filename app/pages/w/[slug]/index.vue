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

  <div v-else class="theme-surface text-white relative overflow-hidden" :style="styleVars">
    <!-- Decorative background layers live at the page level (not inside the
         hero canvas below) specifically so they visually continue across
         the footer too, instead of stopping abruptly at the hero's edge. -->
    <div v-if="wedding.content.coverPhotoUrl && opened" class="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000 animate-in fade-in">
      <img :src="wedding.content.coverPhotoUrl" alt="Background" class="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]">
      <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent 0%, var(--theme-bg-to) 55%, var(--theme-bg-to) 100%)` }" />
    </div>
    <PetalsBackground v-if="wedding.content.enablePetals !== false" />
    <CardOrnament v-if="opened" :style="wedding.content.ornamentStyle" color="var(--theme-accent)" />

    <!-- HERO CANVAS: every 0-100% position below is relative to THIS box only,
         same as the editor's preview mockup. Nothing else on the page shares
         this coordinate space, so nothing can ever collide with it. -->
    <div class="relative overflow-hidden" :style="{ minHeight: 'max(100vh, 700px)' }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />

      <div v-if="opened" class="absolute top-6 right-6 z-30">
        <MusicToggle v-if="wedding.content.audioSrc" :src="wedding.content.audioSrc" />
      </div>

      <div v-if="opened && !wedding.content.hideSystemText" class="absolute inset-0 z-10">
        <!-- 1. Icon -->
        <div
          v-if="wedding.content.innerTopIcon && wedding.content.innerTopIcon !== 'none'"
          class="absolute flex flex-col items-center justify-center text-center w-full px-4 animate-in fade-in zoom-in delay-100"
          :style="{ left: `${wedding.content.iconX ?? 50}%`, top: `${wedding.content.iconY ?? 15}%`, transform: 'translate(-50%, -50%)' }"
        >
          <span v-if="wedding.content.innerTopIcon === 'bismillah'" class="text-4xl" :style="{ color: 'var(--theme-accent)', fontFamily: `'Amiri', 'Traditional Arabic', serif` }">﷽</span>
          <UIcon v-else-if="wedding.content.innerTopIcon === 'rings'" name="i-heroicons-lifebuoy" class="w-8 h-8" :style="{ color: 'var(--theme-accent)' }" />
          <UIcon v-else-if="wedding.content.innerTopIcon === 'heart'" name="i-heroicons-heart" class="w-8 h-8" :style="{ color: 'var(--theme-accent)' }" />
          <img v-else-if="wedding.content.innerTopIcon === 'custom' && wedding.content.customIconUrl" :src="wedding.content.customIconUrl" alt="" class="w-14 h-14 object-contain drop-shadow">
        </div>

        <!-- 2. Greeting -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-150"
          :style="{ left: `${wedding.content.greetingX ?? 50}%`, top: `${wedding.content.greetingY ?? 25}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p v-if="guestName" class="text-xs sm:text-sm tracking-[0.4em] uppercase font-semibold mb-2 drop-shadow-md" :style="{ color: 'var(--theme-accent)' }">
            {{ wedding.content.openingGreeting || 'Dear' }} {{ guestName }}
          </p>
          <h1 class="text-sm sm:text-base tracking-[0.35em] uppercase text-white/80 drop-shadow-md">
            {{ wedding.content.innerGreeting || "You're Invited" }}
          </h1>
        </div>

        <!-- 3. Intro -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.introX ?? 50}%`, top: `${wedding.content.introY ?? 32}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-base sm:text-lg font-light text-white/70 italic drop-shadow-md">
            {{ wedding.content.innerIntro || "To the wedding celebration of" }}
          </p>
        </div>

        <!-- 4. Names -->
        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.namesX ?? 50}%`, top: `${wedding.content.namesY ?? 50}%`, transform: 'translate(-50%, -50%)' }"
        >
          <div v-if="wedding.content.namesLayout === 'vertical'" class="flex flex-col items-center gap-0 font-heading drop-shadow-2xl" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(2rem,4.2vw,3rem)', lineHeight: '1.15' }">
            <span>{{ wedding.content.brideName }}</span>
            <span class="text-[0.4em] opacity-80 leading-none" style="color: #e3b04a;">&amp;</span>
            <span>{{ wedding.content.groomName }}</span>
          </div>
          <h2 v-else class="drop-shadow-2xl leading-tight" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(3.5rem,8vw,6rem)' }">
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
          <p v-if="wedding.content.venueAddress" class="text-xs sm:text-sm text-white/70 italic drop-shadow-md">
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
        <UButton :to="`/w/${slug}/details`" size="xl" color="neutral" variant="soft" class="w-full sm:w-auto font-medium rounded-full px-8 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
          {{ wedding.content.btnDetails || 'View Details' }}
        </UButton>
        <UButton :to="`/w/${slug}/rsvp`" size="xl" color="primary" class="w-full sm:w-auto font-semibold rounded-full px-10 shadow-[0_0_30px_-5px_var(--theme-accent)] hover:scale-105 transition-transform animate-glow">
          {{ wedding.content.btnRsvp || 'RSVP Now' }}
        </UButton>
      </div>
      <div class="mt-6 opacity-80 hover:opacity-100 transition-opacity">
        <ShareButtons :bride-name="wedding.content.brideName" :groom-name="wedding.content.groomName" :date-label="wedding.content.dateLabel" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars } = useThemes()

const styleVars = computed(() =>
  themeStyleVars(
    wedding.value?.themeId,
    {
      bgFrom: wedding.value?.content.customBgFrom,
      bgTo: wedding.value?.content.customBgTo,
      accent: wedding.value?.content.customAccent
    },
    wedding.value?.content.customFontFamily || wedding.value?.content.fontFamily
  )
)

useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

const guestName = computed(() => {
  const raw = route.query.to
  return typeof raw === 'string' ? raw : ''
})

const opened = ref(false)

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({
      title: `${value.content.openingTitle || "You're Invited"} — ${value.content.brideName} & ${value.content.groomName}'s Wedding`,
      description: value.content.dateLabel
        ? `Join us on ${value.content.dateLabel} as we celebrate our wedding. View the details and RSVP online.`
        : 'View the wedding details and RSVP online.'
    })
  },
  { immediate: true }
)
</script>