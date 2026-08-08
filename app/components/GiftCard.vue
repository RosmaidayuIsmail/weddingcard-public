<template>
  <div class="gift-card">
    <UIcon name="i-heroicons-gift" class="w-8 h-8 text-gold-300 mx-auto" />
    <p class="mt-2 text-sm text-white/80">
      Your presence is the greatest gift. For those who’d still like to send a token of love:
    </p>

    <!-- QR Code Display -->
    <div v-if="bank.qrCodeUrl" class="mt-6 mb-4 flex justify-center">
      <div class="p-2 bg-white rounded-xl shadow-lg border border-white/20">
        <img :src="bank.qrCodeUrl" alt="Bank Transfer QR Code" class="w-32 h-32 rounded-lg" />
      </div>
    </div>

    <!-- Bank Details -->
    <div class="mt-4 space-y-1 text-sm">
      <p v-if="bank.name" class="text-gold-200 font-semibold">{{ bank.name }}</p>
      <p v-if="bank.accountName" class="text-white/90">{{ bank.accountName }}</p>
      <button
        v-if="bank.accountNumber"
        type="button"
        class="account-number mt-2"
        @click="copyAccount"
      >
        {{ bank.accountNumber }}
        <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
      </button>
    </div>

    <p v-if="copied" class="mt-3 text-xs font-medium text-emerald-400">Account number copied ✨</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ bank: { name: string; accountName: string; accountNumber: string; qrCodeUrl?: string } }>()
const toast = useToast()
const copied = ref(false)

async function copyAccount() {
  if (!props.bank.accountNumber) return
  try {
    await navigator.clipboard.writeText(props.bank.accountNumber.replace(/\s+/g, ''))
    copied.value = true
    toast.add({ title: 'Copied', description: 'Account number copied to clipboard.', color: 'success' })
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.add({ title: 'Could not copy', color: 'error' })
  }
}
</script>

<style scoped>
.gift-card {
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 160, 23, 0.3);
  backdrop-filter: blur(8px);
}

.account-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(212, 160, 23, 0.15);
  border: 1px solid rgba(212, 160, 23, 0.4);
  color: #f3ddaa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-number:hover {
  background: rgba(212, 160, 23, 0.25);
  transform: translateY(-1px);
}
</style>