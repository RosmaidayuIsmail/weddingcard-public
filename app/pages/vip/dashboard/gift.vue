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

    <div v-else class="animate-fade-up">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-display font-bold text-white">Gift & Bank</h1>
          <p class="text-sm text-white/50 mt-1">Fills the Gift scene in your fly-through.</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <UButton size="lg" color="primary" class="font-semibold shadow-xl shadow-gold-500/20" :loading="saving" @click="save">
            Save changes
          </UButton>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 xl:gap-10">

        <!-- Left: editing -->
        <div class="flex-1 min-w-0 space-y-6">

          <div class="form-panel">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 text-gold-300">
                <UIcon name="i-heroicons-gift" class="w-5 h-5" style="color: #e3b04a;" />
                <span class="font-medium tracking-wide">Gift / Money Transfer Details</span>
              </div>
              <button
                type="button"
                @click="form.enableGift = !form.enableGift"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                :class="form.enableGift ? 'bg-[#e3b04a]' : 'bg-gray-700'"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="form.enableGift ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
            <p class="text-xs text-white/40">
              Off by default. When on, the Gift scene appears in your guests' fly-through with the account details below.
            </p>

            <Transition name="fade-down">
              <div v-if="form.enableGift" class="space-y-4 pt-4 mt-4 border-t border-gray-800">
                <div class="grid sm:grid-cols-3 gap-4">
                  <UFormField label="Bank Name">
                    <UInput v-model="form.bank.name" size="md" class="w-full" placeholder="e.g. Maybank" />
                  </UFormField>
                  <UFormField label="Account Name">
                    <UInput v-model="form.bank.accountName" size="md" class="w-full" />
                  </UFormField>
                  <UFormField label="Account Number">
                    <UInput v-model="form.bank.accountNumber" size="md" class="w-full" />
                  </UFormField>
                </div>

                <div class="pt-4 border-t border-gray-800 mt-4">
                  <p class="text-sm font-medium text-gray-300 mb-3">Transfer QR Code <span class="text-xs text-gray-500 font-normal ml-1">(Optional)</span></p>
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div v-if="form.bank.qrCodeUrl" class="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 shrink-0 shadow-md">
                      <img :src="form.bank.qrCodeUrl" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex flex-col gap-2">
                      <input ref="qrInput" type="file" accept="image/*" class="hidden" @change="handleQrSelect">
                      <div class="flex flex-wrap gap-2">
                        <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-qr-code" :loading="qrUploading" :disabled="!cloudinaryConfigured" @click="qrInput?.click()">
                          {{ form.bank.qrCodeUrl ? 'Change QR' : 'Upload QR Code' }}
                        </UButton>
                        <UButton v-if="form.bank.qrCodeUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.bank.qrCodeUrl = ''" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-800 mt-4">
                  <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showBank2 = !showBank2">
                    <UIcon :name="showBank2 ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" />
                    {{ showBank2 ? 'Hide second account' : 'Add a second account (e.g. the other family)' }}
                  </button>
                  <Transition name="fade-down">
                    <div v-if="showBank2" class="mt-4 space-y-4">
                      <div class="grid sm:grid-cols-3 gap-4">
                        <UFormField label="Bank Name">
                          <UInput v-model="form.bank2.name" size="md" class="w-full" placeholder="e.g. CIMB" />
                        </UFormField>
                        <UFormField label="Account Name">
                          <UInput v-model="form.bank2.accountName" size="md" class="w-full" />
                        </UFormField>
                        <UFormField label="Account Number">
                          <UInput v-model="form.bank2.accountNumber" size="md" class="w-full" />
                        </UFormField>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-300 mb-3">Transfer QR Code <span class="text-xs text-gray-500 font-normal ml-1">(Optional)</span></p>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div v-if="form.bank2.qrCodeUrl" class="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 shrink-0 shadow-md">
                            <img :src="form.bank2.qrCodeUrl" class="w-full h-full object-cover" />
                          </div>
                          <div class="flex flex-col gap-2">
                            <input ref="qr2Input" type="file" accept="image/*" class="hidden" @change="handleQr2Select">
                            <div class="flex flex-wrap gap-2">
                              <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-qr-code" :loading="qr2Uploading" :disabled="!cloudinaryConfigured" @click="qr2Input?.click()">
                                {{ form.bank2.qrCodeUrl ? 'Change QR' : 'Upload QR Code' }}
                              </UButton>
                              <UButton v-if="form.bank2.qrCodeUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.bank2.qrCodeUrl = ''" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </Transition>
          </div>

        </div>

        <!-- Right: live preview - the actual VipCinematicInvite component
             (see its `embedded` prop), fed the real wedding data with just
             enableGift/bank/bank2 swapped for whatever's in the editor on
             the left right now, so edits show up before you even hit Save.
             Same real component the guest page uses - not a second
             reimplementation that can drift out of sync with it. The fly-
             through auto-plays through all its scenes including Gift. -->
        <div class="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2 w-full mb-2 px-1">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
          </p>
          <p class="text-xs text-white/40 mb-4 px-1 leading-relaxed">
            The real fly-through, exactly as a guest sees it - tap the phone to open it.
            Reflects your gift details below as you edit, even before you save.
          </p>
          <div class="phone-bezel w-full max-w-[340px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <div class="phone-screen hide-scrollbar relative">
              <VipCinematicInvite
                v-if="previewWedding"
                :key="wedding?.id"
                :wedding="previewWedding"
                :rsvp-link="rsvpLink"
                embedded
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

import type { WeddingBank } from '~/composables/useWeddingTypes'

const { profile } = useAuth()
const { wedding, loading, saving, updateContent } = useMyWedding()
const { isConfigured: cloudinaryConfigured, uploadImage } = useCloudinary()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')

function emptyBank(): WeddingBank {
  return { name: '', accountName: '', accountNumber: '', qrCodeUrl: '' }
}

const form = reactive<{ enableGift: boolean; bank: WeddingBank; bank2: WeddingBank }>({
  enableGift: false,
  bank: emptyBank(),
  bank2: emptyBank()
})
const showBank2 = ref(false)
const savedAt = ref<number | null>(null)

const qrInput = ref<HTMLInputElement | null>(null)
const qr2Input = ref<HTMLInputElement | null>(null)
const qrUploading = ref(false)
const qr2Uploading = ref(false)

// Feeds the Live Preview panel: the couple's real wedding doc, with only
// enableGift/bank/bank2 swapped for whatever's in the editor on the left
// right now (not necessarily saved yet) - same pattern as Your Scenes'
// previewWedding.
const previewWedding = computed(() => {
  if (!wedding.value) return null
  return {
    ...wedding.value,
    content: {
      ...wedding.value.content,
      enableGift: form.enableGift,
      bank: { ...form.bank },
      bank2: { ...form.bank2 }
    }
  }
})
const rsvpLink = computed(() => (wedding.value ? `/w/${wedding.value.slug}/rsvp` : ''))

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  form.enableGift = value.content.enableGift === true
  form.bank = { ...emptyBank(), ...(value.content.bank || {}) }
  form.bank2 = { ...emptyBank(), ...(value.content.bank2 || {}) }
  showBank2.value = !!(form.bank2.name || form.bank2.accountName || form.bank2.accountNumber || form.bank2.qrCodeUrl)
}, { immediate: true })

async function handleQrSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  qrUploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/qr`)
    form.bank.qrCodeUrl = url
    toast.add({ title: 'QR code uploaded - remember to save', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    qrUploading.value = false
  }
  if (qrInput.value) qrInput.value.value = ''
}

async function handleQr2Select(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  qr2Uploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/qr`)
    form.bank2.qrCodeUrl = url
    toast.add({ title: 'QR code uploaded - remember to save', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    qr2Uploading.value = false
  }
  if (qr2Input.value) qr2Input.value.value = ''
}

async function save() {
  await updateContent({
    enableGift: form.enableGift,
    bank: { ...form.bank },
    bank2: { ...form.bank2 }
  })
  savedAt.value = Date.now()
  toast.add({ title: 'Gift & bank details saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'Gift & Bank — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}
.phone-bezel {
  position: relative;
  height: 660px;
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: translateZ(0);
}
.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
}
.phone-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #111;
}
.fade-down-enter-active, .fade-down-leave-active { transition: all 0.25s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-8px); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
