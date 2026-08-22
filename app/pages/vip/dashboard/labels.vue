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
          <h1 class="text-3xl font-display font-bold text-white">Page Text</h1>
          <p class="text-sm text-white/50 mt-1">Translate or customize the headings and labels guests see throughout your fly-through.</p>
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

        <!-- Left: editing. Iterates the same `detailsTextFields` array (and
             `builtInDetailsPresets`) the classic dashboard's Design Studio
             "Details Page Text" panel uses, so this can never drift out of
             sync with the fields VipCinematicInvite.vue actually reads off
             `wedding.content`. -->
        <div class="flex-1 min-w-0 max-w-2xl space-y-6">

          <div class="form-panel">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-1">
              <h2 class="text-base font-semibold text-white flex items-center gap-2">
                <UIcon name="i-heroicons-language" style="color: #e3b04a;" class="w-5 h-5" />
                Details & Location Text
              </h2>
              <div class="flex gap-2">
                <UButton
                  v-for="preset in builtInDetailsPresets"
                  :key="preset.id"
                  size="xs"
                  variant="soft"
                  color="gray"
                  class="hover:bg-gray-800 border border-gray-700"
                  @click="applyPreset(preset)"
                >
                  {{ preset.label }}
                </UButton>
              </div>
            </div>
            <p class="text-xs text-white/50 mb-4">
              Section headings and labels on the Details/Location scenes - leave blank to use the English defaults shown as placeholders.
            </p>
            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField v-for="field in detailsTextFields" :key="field.key" :label="field.label">
                <UInput v-model="form[field.key]" :placeholder="builtInDetailsPresets[0].texts[field.key]" size="sm" class="w-full" />
              </UFormField>
            </div>
          </div>

        </div>

        <!-- Right: live preview - same real VipCinematicInvite component and
             embedded phone-bezel pattern as every other VIP dashboard page.
             Feeds the couple's real wedding doc with these 10 fields
             swapped for whatever's in `form` right now (not necessarily
             saved yet), same pattern as Your Scenes'/Wedding Details'
             previewWedding. -->
        <div class="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2 w-full mb-2 px-1">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
          </p>
          <p class="text-xs text-white/40 mb-4 px-1 leading-relaxed">
            Reflects the form as you edit, even before you save.
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
import type { WeddingContent } from '~/composables/useWeddingTypes'

definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

const { profile } = useAuth()
const { wedding, loading, saving, updateContent } = useMyWedding()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')
const rsvpLink = computed(() => (wedding.value ? `/w/${wedding.value.slug}/rsvp` : ''))

// Only the fields this page owns - `detailsTextFields` is the single shared
// source of truth (from useThemes.ts) for which WeddingContent keys are
// section headings/labels, so this form can never miss or mistype one.
const form = reactive<Partial<Pick<WeddingContent, DetailsTextKey>>>({})

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  for (const field of detailsTextFields) {
    form[field.key] = value.content[field.key] || ''
  }
}, { immediate: true })

const previewWedding = computed(() => {
  if (!wedding.value) return null
  return {
    ...wedding.value,
    content: {
      ...wedding.value.content,
      ...form
    }
  }
})

const savedAt = ref<number | null>(null)

function applyPreset(preset: DetailsPreset) {
  Object.assign(form, preset.texts)
  toast.add({ title: `${preset.label} text preset applied`, color: 'success' })
}

async function save() {
  if (!wedding.value) return
  try {
    await updateContent(form)
    savedAt.value = Date.now()
    toast.add({ title: 'Saved', color: 'success' })
    setTimeout(() => { savedAt.value = null }, 3000)
  } catch {
    // updateContent already toasts on failure
  }
}

useSeoMeta({ title: 'Page Text — VIP Cinematic' })
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
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
