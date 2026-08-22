<template>
  <div class="pb-12">

    <div v-if="vipApprovalStatus !== 'approved' || loading" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-4 text-center px-4">
      <UIcon name="i-heroicons-heart" class="w-10 h-10" style="color: rgba(227, 176, 74, 0.5);" />
      <p class="text-white">Set up your wedding details first.</p>
      <UButton to="/vip/dashboard" color="primary">Go to Wedding Details</UButton>
    </div>

    <div v-else class="animate-fade-up space-y-6">

      <div>
        <h1 class="text-3xl font-display font-bold text-white">Overview</h1>
        <p class="text-sm text-white/50 mt-1">{{ wedding.content.brideName || 'Your' }} &amp; {{ wedding.content.groomName || 'Wedding' }} - a snapshot of your VIP Cinematic invitation.</p>
      </div>

      <!-- Countdown -->
      <div v-if="wedding.content.dateISO" class="form-panel text-center">
        <p class="text-xs text-white/50 uppercase tracking-widest font-semibold mb-4">Counting down to the big day</p>
        <div v-if="!countdownElapsed" class="flex items-center justify-center gap-3 sm:gap-5">
          <div v-for="unit in countdownUnits" :key="unit.label" class="countdown-cell">
            <span class="countdown-number">{{ unit.value }}</span>
            <span class="countdown-label">{{ unit.label }}</span>
          </div>
        </div>
        <p v-else class="text-gold-200 font-display text-xl">Today's the day! 🎉</p>
      </div>

      <!-- Setup Checklist -->
      <div v-if="checklistPercent < 100" class="form-panel" style="border-color: rgba(212, 160, 23, 0.2); background: rgba(212, 160, 23, 0.04);">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-check-badge" class="w-5 h-5" style="color: #e3b04a;" /> Finish setting up your VIP invitation
          </p>
          <span class="text-xs text-white/50">{{ checklistDoneCount }}/{{ checklistItems.length }} done</span>
        </div>
        <div class="h-1.5 rounded-full bg-white/5 overflow-hidden mb-5">
          <div class="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-500" :style="{ width: `${checklistPercent}%` }" />
        </div>
        <div class="grid sm:grid-cols-2 gap-2.5">
          <NuxtLink
            v-for="item in checklistItems"
            :key="item.key"
            :to="item.to"
            class="checklist-item"
            :class="{ 'checklist-item-done': item.done }"
          >
            <UIcon :name="item.done ? 'i-heroicons-check-circle-solid' : 'i-heroicons-arrow-right-circle'" class="w-5 h-5 shrink-0" :class="item.done ? 'text-emerald-400' : 'text-white/30'" />
            <span class="text-sm" :class="item.done ? 'text-white/50 line-through' : 'text-white/80'">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
      <div v-else class="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 flex items-center gap-3">
        <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-emerald-400 shrink-0" />
        <p class="text-sm text-white/80">Your VIP invitation is fully set up. Keep an eye on Guest List for new responses!</p>
      </div>

      <!-- RSVP Stats -->
      <div class="space-y-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="p-2 rounded-lg bg-white/5 self-start mb-2"><UIcon name="i-heroicons-envelope" class="w-5 h-5 text-white/60" /></div>
            <div>
              <p class="stat-label">Total Invited</p>
              <p class="stat-number">{{ totalInvited }}</p>
            </div>
          </div>
          <div class="stat-card border-emerald-500/20 bg-emerald-500/5">
            <div class="p-2 rounded-lg bg-emerald-500/10 self-start mb-2"><UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-400" /></div>
            <div>
              <p class="stat-label text-emerald-400/70">Attending</p>
              <p class="stat-number text-emerald-400">{{ totalAttending }}</p>
            </div>
          </div>
          <div class="stat-card border-red-500/20 bg-red-500/5">
            <div class="p-2 rounded-lg bg-red-500/10 self-start mb-2"><UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-400" /></div>
            <div>
              <p class="stat-label text-red-400/70">Not Attending</p>
              <p class="stat-number text-red-400">{{ totalNotAttending }}</p>
            </div>
          </div>
          <div class="stat-card" style="border-color: rgba(212, 160, 23, 0.2); background: rgba(212, 160, 23, 0.05);">
            <div class="p-2 rounded-lg self-start mb-2" style="background: rgba(212, 160, 23, 0.1);"><UIcon name="i-heroicons-users" class="w-5 h-5" style="color: #e3b04a;" /></div>
            <div>
              <p class="stat-label" style="color: rgba(227, 176, 74, 0.7);">Total Headcount</p>
              <p class="stat-number" style="color: #e3b04a;">{{ totalGuestCount }}</p>
            </div>
          </div>
        </div>

        <!-- Response rate bar -->
        <div class="stat-card !flex-row items-center justify-between gap-4">
          <div>
            <p class="stat-label">Response Rate</p>
            <p class="text-sm text-white/50 mt-1">{{ totalResponded }} of {{ totalInvited }} guests have responded</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-28 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500" :style="{ width: `${responseRatePercent}%` }" />
            </div>
            <span class="text-lg font-bold text-white tabular-nums">{{ responseRatePercent }}%</span>
          </div>
        </div>

        <!-- Recent Responses -->
        <div v-if="recentGuests.length" class="stat-card !block">
          <p class="stat-label mb-3">Latest Responses</p>
          <div class="space-y-2">
            <div v-for="g in recentGuests" :key="g.id" class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/80 truncate">{{ g.name }}</span>
              <UBadge :color="g.attending === 'Yes' ? 'success' : 'error'" variant="subtle" size="sm">
                {{ g.attending === 'Yes' ? 'Attending' : 'Not attending' }}
              </UBadge>
            </div>
          </div>
          <NuxtLink to="/vip/dashboard/guests" class="text-xs text-gold-300/80 hover:text-gold-200 mt-3 inline-flex items-center gap-1">
            View all guests <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

const { profile } = useAuth()
const { wedding, loading } = useMyWedding()
const { guests, totalInvited, totalResponded, totalAttending, totalNotAttending, totalGuestCount } = useGuests(() => wedding.value?.id)

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')

// --- Countdown: no separate <CountdownTimer> component exists in this
// codebase yet, so the days/hours/minutes/seconds are computed inline here
// off a ticking `now` ref, same self-contained approach as the rest of this
// page (no new composables needed).
const now = ref(Date.now())
let countdownTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  countdownTimer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const remainingMs = computed(() => {
  if (!wedding.value?.content.dateISO) return 0
  const target = new Date(wedding.value.content.dateISO).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, target - now.value)
})
const countdownElapsed = computed(() => remainingMs.value <= 0)
const countdownUnits = computed(() => {
  const totalSeconds = Math.floor(remainingMs.value / 1000)
  return [
    { label: 'Days', value: Math.floor(totalSeconds / 86400) },
    { label: 'Hours', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'Minutes', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 'Seconds', value: totalSeconds % 60 }
  ]
})

// --- Setup checklist: computed straight from the wedding's own data (and
// the VIP-specific vipScenes/vipEnabled fields) so it never drifts out of
// sync with what's actually been filled in - no separate progress field to
// maintain. Every link points at a VIP dashboard route, not the classic
// dashboard's routes. "Print Labels" isn't included below - it's a one-off
// export tool rather than a piece of saved wedding content, so there's no
// natural "done" signal for it the way there is for the other pages.
const checklistItems = computed(() => {
  if (!wedding.value) return []
  const c = wedding.value.content
  return [
    { key: 'details', label: 'Fill in your wedding details', done: !!(c.brideName && c.groomName && c.dateISO && c.venueName), to: '/vip/dashboard' },
    { key: 'opening', label: 'Design your opening screen', done: !!(c.openingTitle || c.openingGreeting || c.openingBgUrl), to: '/vip/dashboard/opening' },
    { key: 'scenes', label: 'Write your story scenes', done: (wedding.value.vipScenes?.length || 0) > 0, to: '/vip/dashboard/scenes' },
    { key: 'flow', label: 'Add your event flow', done: (wedding.value.flow?.length || 0) > 0, to: '/vip/dashboard/flow' },
    { key: 'design', label: 'Style your colors & fonts', done: !!(c.customAccent || c.fontFamily || c.customFontFamily), to: '/vip/dashboard/design' },
    { key: 'gift', label: 'Set up your gift & money details', done: c.enableGift === true, to: '/vip/dashboard/gift' },
    { key: 'rsvp', label: 'Customize your RSVP text', done: !!c.rsvpDeadlineLabel, to: '/vip/dashboard/rsvp' },
    { key: 'guests', label: 'Add your first guest', done: totalInvited.value > 0, to: '/vip/dashboard/guests' },
    { key: 'publish', label: 'Turn your VIP page on', done: wedding.value.vipEnabled === true, to: '/vip/dashboard/publish' }
  ]
})
const checklistDoneCount = computed(() => checklistItems.value.filter((i) => i.done).length)
const checklistPercent = computed(() => checklistItems.value.length ? Math.round((checklistDoneCount.value / checklistItems.value.length) * 100) : 100)

const responseRatePercent = computed(() => (totalInvited.value > 0 ? Math.round((totalResponded.value / totalInvited.value) * 100) : 0))
const recentGuests = computed(() => guests.value.filter((g) => g.attending).slice(0, 5))

useSeoMeta({ title: 'Overview — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.countdown-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 4.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 0.85rem;
  background: rgba(212, 160, 23, 0.06);
  border: 1px solid rgba(212, 160, 23, 0.18);
}

.countdown-number {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: #f3ddaa;
}

.countdown-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 0.4rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.checklist-item:hover {
  border-color: rgba(212, 160, 23, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.checklist-item-done {
  opacity: 0.7;
}
</style>
