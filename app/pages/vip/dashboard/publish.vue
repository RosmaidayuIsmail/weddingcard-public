<template>
  <div class="max-w-2xl mx-auto pb-12">

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
      <h1 class="text-3xl font-display font-bold text-white mb-1">Preview & Publish</h1>
      <p class="text-sm text-white/50 mb-6">Check the real animation, then turn your VIP page on when you're happy.</p>

      <!-- How it works -->
      <div class="how-it-works mb-6">
        <button type="button" class="how-it-works-toggle" @click="showGuide = !showGuide">
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" style="color: #e3b04a;" class="w-5 h-5" />
            How VIP Cinematic works
          </span>
          <UIcon :name="showGuide ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4 text-white/50" />
        </button>
        <div v-if="showGuide" class="how-it-works-body">
          <ol class="space-y-2.5">
            <li><b>Wedding Details</b> fills the automatic cover and event-details scenes.</li>
            <li><b>Your Scenes</b> is your own story, in whatever order you add it, with an optional camera position/zoom/timer per scene.</li>
            <li><b>Preview Live Cinematic</b> below opens the real, playing animation in a new tab, exactly as guests will see it.</li>
            <li>Turn the page on below once you're happy, then copy/share the link.</li>
          </ol>
        </div>
      </div>

      <div class="form-panel mb-6">
        <h2 class="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <UIcon name="i-heroicons-play-circle" style="color: #e3b04a;" class="w-5 h-5" />
          See the real thing
        </h2>
        <p class="text-sm text-gray-400 mb-4">
          Opens the actual guest page in a new tab, camera fly-through and all. You (the account owner) can always open it this way, even while the page is off for everyone else.
        </p>
        <UButton size="lg" variant="soft" color="neutral" icon="i-heroicons-play-circle" class="font-semibold" :loading="opening" @click="previewLive">
          Preview Live Cinematic
        </UButton>
      </div>

      <div class="form-panel">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-white flex items-center gap-2">
              <UIcon name="i-heroicons-power" style="color: #e3b04a;" class="w-5 h-5" />
              VIP page is {{ vipEnabled ? 'on' : 'off' }}
            </h2>
            <p class="text-xs text-gray-400 mt-1">
              {{ vipEnabled ? 'Guests visiting the VIP link below will see the automatic cinematic invitation.' : "Turn this on once you're happy with your scenes - the link stays private until then." }}
            </p>
          </div>
          <USwitch v-model="vipEnabled" size="lg" @update:model-value="saveEnabled" />
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex flex-wrap items-center gap-3">
          <code class="text-xs text-gold-300 bg-black/30 px-3 py-1.5 rounded-lg break-all">{{ vipLinkPath }}</code>
          <UButton variant="soft" color="gray" size="xs" icon="i-heroicons-clipboard" @click="copyLink">Copy link</UButton>
          <UButton variant="link" color="gray" size="xs" :to="vipLinkPath" target="_blank" external :padded="false">
            Open Live <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-1 w-3 h-3" />
          </UButton>
        </div>
        <span v-if="savedAt" class="mt-3 inline-flex text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full items-center gap-1.5">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

const { profile } = useAuth()
const { wedding, loading, updateVip } = useMyWedding()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')
const vipLinkPath = computed(() => (wedding.value ? `/w/${wedding.value.slug}/vip` : ''))

const vipEnabled = ref(false)
const savedAt = ref<number | null>(null)
const opening = ref(false)
const showGuide = ref(true)

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  vipEnabled.value = !!value.vipEnabled
}, { immediate: true })

async function copyLink() {
  if (!vipLinkPath.value) return
  const full = `${window.location.origin}${vipLinkPath.value}`
  try {
    await navigator.clipboard.writeText(full)
    toast.add({ title: 'Link copied', color: 'success' })
  } catch {
    toast.add({ title: 'Could not copy - copy it manually', color: 'error' })
  }
}

// Only this page's own slice (the on/off switch) is saved here - scenes are
// read live off `wedding` and passed through unchanged rather than risking
// clobbering unsaved edits made on the Your Scenes page.
async function saveEnabled(value: boolean) {
  if (!wedding.value) return
  await updateVip(value, wedding.value.vipScenes || [])
  savedAt.value = Date.now()
  setTimeout(() => { savedAt.value = null }, 3000)
}

async function previewLive() {
  if (!wedding.value) return
  opening.value = true
  try {
    window.open(vipLinkPath.value, '_blank')
  } finally {
    opening.value = false
  }
}

useSeoMeta({ title: 'Preview & Publish — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}
.how-it-works {
  border-radius: 1rem;
  border: 1px solid rgba(212, 160, 23, 0.25);
  background: rgba(212, 160, 23, 0.06);
  overflow: hidden;
}
.how-it-works-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f3ddaa;
}
.how-it-works-body {
  padding: 0 1.1rem 1.1rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
}
.how-it-works-body li b {
  color: rgba(255, 255, 255, 0.9);
}
</style>
