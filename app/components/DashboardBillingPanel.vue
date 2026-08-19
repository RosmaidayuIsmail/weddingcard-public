<template>
  <div>
    <div v-if="loading" class="text-center text-white/60 py-20">Loading...</div>

    <div v-else-if="!wedding" class="text-center text-white/60 py-20">
      <p>You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" class="mt-4">Go create it</UButton>
    </div>

    <div v-else class="space-y-8 max-w-4xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-gold-100">Billing &amp; Plan</h1>
          <p class="text-sm text-white/60 mt-1 flex items-center gap-2">
            Current plan:
            <UBadge :color="wedding.plan === 'premium' ? 'primary' : 'neutral'" variant="subtle">{{ wedding.plan === 'premium' ? 'Premium' : 'Free' }}</UBadge>
            <UBadge v-if="wedding.plan === 'premium'" :color="wedding.paymentStatus === 'paid' ? 'success' : 'warning'" variant="subtle">
              {{ paymentStatusLabel }}
            </UBadge>
          </p>
        </div>
        <UButton v-if="wedding.plan !== 'premium'" color="primary" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :disabled="!!pendingRequest" @click="openUpgradeModal">
          {{ pendingRequest ? 'Request pending' : 'Upgrade to Premium' }}
        </UButton>
      </div>

      <!-- Premium already active -->
      <UAlert
        v-if="wedding.plan === 'premium'"
        icon="i-heroicons-sparkles"
        color="success"
        variant="soft"
        title="You're on Premium"
        description="Every premium theme is unlocked for your card. Thank you for supporting WeddingCard!"
      />

      <!-- Pending request status -->
      <div v-else-if="pendingRequest" class="pending-card">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-white">Your upgrade request is being reviewed</p>
            <p class="text-sm text-white/60 mt-1">
              Submitted {{ formatDate(pendingRequest.createdAt) }}<span v-if="pendingRequest.themeName"> · interested in <span class="text-gold-200">{{ pendingRequest.themeName }}</span></span>
            </p>
            <p v-if="pendingRequest.note" class="text-sm text-white/50 mt-2 italic">"{{ pendingRequest.note }}"</p>
            <p class="text-xs text-white/40 mt-3">We'll reach out to arrange payment, then activate Premium on your card - no need to submit again.</p>
          </div>
        </div>
      </div>

      <!-- How payment works -->
      <UAlert
        v-if="wedding.plan !== 'premium'"
        icon="i-heroicons-information-circle"
        color="info"
        variant="soft"
        title="How upgrading works right now"
        description="Live card checkout isn't connected yet. Requesting an upgrade below sends us your details - we'll follow up to arrange payment, then switch your card to Premium ourselves."
      />

      <!-- Feature comparison -->
      <div>
        <h2 class="font-display text-lg mb-3">Compare plans</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="plan-card">
            <p class="font-display text-lg">Free</p>
            <p class="text-2xl font-bold mt-1">RM 0</p>
            <ul class="mt-4 space-y-2 text-sm text-white/70">
              <li v-for="feature in freeFeatures" :key="feature" class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" /> {{ feature }}
              </li>
            </ul>
            <UButton block variant="soft" color="neutral" class="mt-5" disabled>
              {{ wedding.plan === 'free' ? 'Current plan' : 'Included' }}
            </UButton>
          </div>

          <div class="plan-card plan-card-highlight">
            <div class="flex items-center gap-2">
              <p class="font-display text-lg text-gold-200">Premium</p>
              <UBadge color="primary" variant="subtle" size="sm">Most popular</UBadge>
            </div>
            <p class="text-2xl font-bold mt-1">From RM {{ cheapestPremiumPrice }}</p>
            <ul class="mt-4 space-y-2 text-sm text-white/70">
              <li v-for="feature in premiumFeatures" :key="feature" class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="w-4 h-4 mt-0.5 text-gold-300 shrink-0" /> {{ feature }}
              </li>
            </ul>
            <UButton
              block
              color="primary"
              class="mt-5 font-semibold"
              :disabled="wedding.plan === 'premium' || !!pendingRequest"
              @click="openUpgradeModal"
            >
              {{ wedding.plan === 'premium' ? 'Current plan' : pendingRequest ? 'Request pending' : 'Upgrade to Premium' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Premium theme gallery -->
      <div>
        <h2 class="font-display text-lg mb-3">Theme pricing</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div v-for="theme in allThemes" :key="theme.id" class="theme-row">
            <div class="flex items-center gap-3 min-w-0">
              <span class="swatch" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.accent})` }" />
              <div class="min-w-0">
                <p class="truncate">{{ theme.name }}</p>
                <p class="text-xs text-white/40 truncate">{{ theme.tagline }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UIcon v-if="theme.price > 0 && wedding.plan !== 'premium'" name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-white/30" />
              <span :class="theme.price === 0 ? 'text-emerald-300' : 'text-gold-300'">{{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment / request history -->
      <div>
        <h2 class="font-display text-lg mb-3">Request history</h2>
        <div v-if="requests.length === 0" class="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">
          No upgrade requests yet.
        </div>
        <div v-else class="space-y-2">
          <div v-for="req in requests" :key="req.id" class="history-row">
            <div class="min-w-0">
              <p class="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                Premium upgrade
                <UBadge :color="statusColor(req.status)" variant="subtle" size="sm">{{ statusLabel(req.status) }}</UBadge>
              </p>
              <p class="text-xs text-white/40 mt-0.5">
                {{ formatDate(req.createdAt) }}<span v-if="req.themeName"> · {{ req.themeName }}</span>
              </p>
              <p v-if="req.note" class="text-xs text-white/40 mt-1 italic truncate">"{{ req.note }}"</p>
            </div>
            <span class="text-sm text-gold-300 shrink-0">RM {{ req.estimatedAmount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade request modal -->
    <UModal v-model:open="upgradeModalOpen" title="Request Premium upgrade">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-white/60">
            This sends us your request - we'll follow up to arrange payment (estimated from RM {{ cheapestPremiumPrice }}), then activate Premium on your card ourselves.
          </p>
          <UFormField label="Which premium theme are you most excited about? (optional)">
            <USelect
              v-model="upgradeForm.themeId"
              :items="premiumThemeOptions"
              placeholder="Any premium theme"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Anything you'd like us to know? (optional)">
            <UTextarea v-model="upgradeForm.note" :rows="3" placeholder="e.g. preferred payment method, timeline..." class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="upgradeModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="submitting" @click="submitUpgrade">Send request</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// This is the real Billing panel, shared by /dashboard/billing and the
// /admin/wedding/[id]/billing admin page. overrideWeddingId is only ever
// set by the admin page; couples hitting their own dashboard never pass
// it, so useMyWedding() falls back to its normal own-wedding lookup.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { allThemes } = useThemes()
const { requests, pendingRequest, submitUpgradeRequest } = useBillingRequests(computed(() => wedding.value?.id))

const freeFeatures = [
  '2 free themes',
  'Unlimited RSVPs',
  'Guest list (VIP + general)',
  'Printable card',
  'Full multi-language RSVP flow'
]
const premiumFeatures = [
  'All premium themes unlocked',
  'Everything in Free',
  'Priority support'
]

const premiumThemes = computed(() => allThemes.value.filter((t) => t.price > 0))
const cheapestPremiumPrice = computed(() => premiumThemes.value.reduce((min, t) => Math.min(min, t.price), premiumThemes.value[0]?.price ?? 29))
const premiumThemeOptions = computed(() => premiumThemes.value.map((t) => ({ label: `${t.name} (RM ${t.price})`, value: t.id })))

const paymentStatusLabel = computed(() => {
  if (!wedding.value) return ''
  return wedding.value.paymentStatus === 'paid' ? 'Paid' : wedding.value.paymentStatus === 'pending' ? 'Payment pending' : 'Unpaid'
})

const upgradeModalOpen = ref(false)
const submitting = ref(false)
const upgradeForm = reactive({ themeId: '', note: '' })

function openUpgradeModal() {
  upgradeForm.themeId = ''
  upgradeForm.note = ''
  upgradeModalOpen.value = true
}

async function submitUpgrade() {
  submitting.value = true
  try {
    const theme = premiumThemes.value.find((t) => t.id === upgradeForm.themeId)
    await submitUpgradeRequest({
      themeId: theme?.id,
      themeName: theme?.name,
      estimatedAmount: theme?.price ?? cheapestPremiumPrice.value,
      note: upgradeForm.note
    })
    upgradeModalOpen.value = false
  } finally {
    submitting.value = false
  }
}

function statusLabel(status: string) {
  return status === 'approved' ? 'Approved' : status === 'declined' ? 'Declined' : 'Pending review'
}
function statusColor(status: string) {
  return status === 'approved' ? 'success' : status === 'declined' ? 'error' : 'warning'
}
function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

useSeoMeta({ title: 'Billing — WeddingCard' })
</script>

<style scoped>
.plan-card {
  border-radius: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.plan-card-highlight {
  border-color: rgba(212, 160, 23, 0.5);
  background: rgba(212, 160, 23, 0.08);
}

.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
}

.swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  shrink: 0;
  flex-shrink: 0;
}

.pending-card {
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.history-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
