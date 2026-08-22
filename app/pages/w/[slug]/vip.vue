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

  <!-- The couple hasn't turned this page on yet (VIP dashboard > VIP page
       is off) - a graceful message instead of a 404, since this link may
       get visited before it's ready. The account that owns this wedding (or
       a superadmin) is let through anyway, so the "Preview Live Cinematic"
       button in VipScenesPanel.vue always shows the real thing even before
       it's switched on for guests. -->
  <div v-else-if="!wedding.vipEnabled && !canPreviewWhileOff" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm">
      <UIcon name="i-heroicons-film" class="w-12 h-12 text-gold-300/50 mb-4 mx-auto" />
      <p class="text-xl font-display mb-2">The VIP invitation isn't ready yet.</p>
      <p class="text-sm text-white/60 mb-6">Please check back soon.</p>
      <UButton to="/" variant="soft" color="neutral" size="lg" class="rounded-full px-8">Return Home</UButton>
    </div>
  </div>

  <div v-else class="relative">
    <div v-if="!wedding.vipEnabled" class="fixed top-0 inset-x-0 z-50 bg-gold-500 text-ink-950 text-xs font-semibold text-center py-1.5 tracking-wide">
      Preview only - this page is still off for guests. Turn it on from your VIP dashboard when you're ready.
    </div>
    <VipCinematicInvite :wedding="wedding" :guest-name="guestName" :rsvp-link="rsvpLink" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)

// Lets the owner (or a superadmin) open this exact URL as a genuine preview
// even while vipEnabled is off, so "Preview Live Cinematic" in
// VipScenesPanel.vue always reflects reality instead of a fake mock-up.
const { currentUser, profile } = useAuthState()
const canPreviewWhileOff = computed(() =>
  !!wedding.value && !!currentUser.value &&
  (currentUser.value.uid === wedding.value.ownerUid || profile.value?.role === 'superadmin')
)

const guestName = computed(() => {
  const raw = route.query.to
  return typeof raw === 'string' ? raw : ''
})

const rsvpLink = computed(() => (guestName.value ? `/w/${slug}/rsvp?to=${encodeURIComponent(guestName.value)}` : `/w/${slug}/rsvp`))

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

// Same background-music priming as the classic invitation page - see
// pages/w/[slug]/index.vue for the full reasoning.
const { preparePlayer } = useBackgroundMusic()
watch(
  () => wedding.value?.content.audioSrc,
  (src) => {
    if (src) preparePlayer(src)
  },
  { immediate: true }
)
</script>
