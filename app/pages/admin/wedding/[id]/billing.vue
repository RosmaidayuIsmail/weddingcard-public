<template>
    <div>
      <div v-if="loading" class="text-center text-white/60 py-20">Loading...</div>
  
      <div v-else-if="!wedding" class="text-center text-white/60 py-20">
        <p>Wedding not found.</p>
        <UButton to="/admin" class="mt-4">Back to all weddings</UButton>
      </div>
  
      <div v-else class="space-y-6 max-w-3xl">
        <div>
          <p class="text-xs font-semibold tracking-widest uppercase text-indigo-300/80 mb-1 flex items-center gap-1.5">
            <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" /> Admin editing
          </p>
          <h1 class="text-2xl font-display font-bold text-gold-100">Billing</h1>
          <p class="text-sm text-white/60 mt-1">
            Current plan: <UBadge :color="wedding.plan === 'premium' ? 'primary' : 'neutral'" variant="subtle">{{ wedding.plan === 'premium' ? 'Premium' : 'Free' }}</UBadge>
            <UBadge :color="paymentBadgeColor" variant="subtle" class="ml-2">{{ paymentStatus }}</UBadge>
          </p>
        </div>
  
        <UAlert
          icon="i-heroicons-information-circle"
          color="info"
          variant="soft"
          title="Live checkout isn't connected yet"
          description="No payment gateway is wired up yet. These controls are for manual admin grants only; once Billplz or ToyyibPay is connected, payment status must be updated only by a verified server callback."
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
            <UButton block variant="soft" color="neutral" class="mt-4" :disabled="wedding.plan === 'free'" :loading="changing" @click="setPlan('free')">
              {{ wedding.plan === 'free' ? 'Current plan' : 'Downgrade to Free' }}
            </UButton>
          </div>
  
          <div class="plan-card plan-card-highlight">
            <p class="font-display text-lg text-gold-200">Premium</p>
            <p class="text-2xl font-bold mt-1">{{ premiumPriceLabel }}</p>
            <ul class="mt-4 space-y-2 text-sm text-white/70">
              <li>✓ All premium themes</li>
              <li>✓ Everything in Free</li>
              <li>✓ Priority support</li>
            </ul>
            <UButton block color="primary" class="mt-4 font-semibold" :disabled="wedding.plan === 'premium'" :loading="changing" @click="setPlan('premium')">
              {{ wedding.plan === 'premium' ? 'Current plan' : 'Grant Premium' }}
            </UButton>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="font-display text-lg">Payment status</h2>
              <p class="text-xs text-white/50 mt-1">Use only for a manual bank-transfer/admin grant while live checkout is unavailable.</p>
            </div>
            <USelect v-model="paymentStatus" :items="paymentStatusOptions" class="w-full sm:w-40" :disabled="changing" @update:model-value="setPaymentStatus" />
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
  import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
  import type { PaymentStatus } from '~/composables/useWeddingTypes'
  
  definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })
  
  const route = useRoute()
  const weddingId = computed(() => route.params.id as string)
  
  const { wedding, loading } = useMyWedding(weddingId)
  const { allThemes } = useThemes()
  const { db } = useFirebase()
  const toast = useToast()
  
  const changing = ref(false)
  const paymentStatus = ref<PaymentStatus>('unpaid')
  const paymentStatusOptions = [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' }
  ]

  watch(wedding, (value) => {
    if (value) paymentStatus.value = value.paymentStatus || 'unpaid'
  }, { immediate: true })

  const paidThemes = computed(() => allThemes.value.filter((theme) => Number(theme.price) > 0))
  const premiumPriceLabel = computed(() => {
    if (!paidThemes.value.length) return 'Included'
    return `From RM ${Math.min(...paidThemes.value.map((theme) => Number(theme.price)))}`
  })
  const paymentBadgeColor = computed(() => ({ paid: 'success', pending: 'warning', unpaid: 'neutral' }[paymentStatus.value] as 'success' | 'warning' | 'neutral'))
  
  async function setPlan(plan: 'free' | 'premium') {
    if (!db || !wedding.value || plan === wedding.value.plan) return
    changing.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { plan, updatedAt: serverTimestamp() })
      toast.add({ title: `Plan set to ${plan}`, color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not change plan', color: 'error' })
    } finally {
      changing.value = false
    }
  }

  async function setPaymentStatus(next: PaymentStatus) {
    if (!db || !wedding.value || next === wedding.value.paymentStatus) return
    changing.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { paymentStatus: next, updatedAt: serverTimestamp() })
      toast.add({ title: `Payment marked ${next}`, color: 'success' })
    } catch (error) {
      console.error(error)
      paymentStatus.value = wedding.value.paymentStatus || 'unpaid'
      toast.add({ title: 'Could not update payment status', color: 'error' })
    } finally {
      changing.value = false
    }
  }
  
  useSeoMeta({ title: 'Billing (Admin) — WeddingCard', robots: 'noindex, nofollow' })
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
