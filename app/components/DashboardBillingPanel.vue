<template>
  <div>
    <div v-if="loading" class="text-center text-white/60 py-20">Loading...</div>

    <div v-else-if="!wedding" class="text-center text-white/60 py-20">
      <p>You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" class="mt-4">Go create it</UButton>
    </div>

    <div v-else class="space-y-6 max-w-3xl">
      <div>
        <h1 class="text-2xl font-display font-bold text-gold-100">Billing</h1>
        <p class="text-sm text-white/60 mt-1">
          Current plan: <UBadge :color="wedding.plan === 'premium' ? 'primary' : 'neutral'" variant="subtle">{{ wedding.plan === 'premium' ? 'Premium' : 'Free' }}</UBadge>
        </p>
      </div>

      <UAlert
        icon="i-heroicons-information-circle"
        color="info"
        variant="soft"
        title="Payments aren't wired up yet"
        description="This is a preview of pricing and plans. Live checkout via FPX/Billplz/ToyyibPay is the next thing to connect — the buttons below show what it will look like."
      />

      <div class="grid sm:grid-cols-2 gap-4">
        <div class="plan-card">
          <p class="font-display text-lg">Free</p>
          <p class="text-2xl font-bold mt-1">RM 0</p>
          <ul class="mt-4 space-y-2 text-sm text-white/70">
            <li>✓ 2 free themes</li>
            <li>✓ Unlimited RSVPs</li>
            <li>✓ Guest list (VIP + general)</li>
            <li>✓ Printable card</li>
          </ul>
          <UButton block variant="soft" color="neutral" class="mt-4" disabled>
            {{ wedding.plan === 'free' ? 'Current plan' : 'Included' }}
          </UButton>
        </div>

        <div class="plan-card plan-card-highlight">
          <p class="font-display text-lg text-gold-200">Premium</p>
          <p class="text-2xl font-bold mt-1">From RM 29</p>
          <ul class="mt-4 space-y-2 text-sm text-white/70">
            <li>✓ All premium themes</li>
            <li>✓ Everything in Free</li>
            <li>✓ Priority support</li>
          </ul>
          <UButton block color="primary" class="mt-4 font-semibold" @click="showComingSoon">
            Upgrade
          </UButton>
        </div>
      </div>

      <div>
        <h2 class="font-display text-lg mb-3">Theme pricing</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div v-for="theme in allThemes" :key="theme.id" class="theme-row">
            <span>{{ theme.name }}</span>
            <span class="text-gold-300">{{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }}</span>
          </div>
        </div>
      </div>
    </div>
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
const toast = useToast()

function showComingSoon() {
  toast.add({
    title: 'Coming soon',
    description: 'Live Billplz/ToyyibPay checkout will connect here in a future update.',
    color: 'info'
  })
}

useSeoMeta({ title: 'Billing \u2014 WeddingCard' })
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
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
}
</style>