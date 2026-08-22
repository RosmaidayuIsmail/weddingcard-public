<template>
  <div class="max-w-3xl mx-auto pb-12">

    <!-- Approval gate - VIP Cinematic is admin-approved, not something a
         new account can just switch on themselves. Every VIP account
         starts 'pending' the moment they sign up (see signUpVip in
         useAuth.ts). -->
    <div v-if="vipApprovalStatus !== 'approved'" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-6 px-4 text-center">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon :name="gateIcon" class="w-12 h-12" :style="{ color: gateIconColor }" />
      </div>
      <div class="max-w-md space-y-2">
        <p class="text-lg text-white">{{ gateTitle }}</p>
        <p class="text-sm text-white/50">{{ gateDescription }}</p>
      </div>
      <UButton
        v-if="vipApprovalStatus === 'rejected'"
        size="lg"
        color="primary"
        class="font-semibold shadow-lg shadow-gold-500/20"
        :loading="requesting"
        @click="handleRequestAgain"
      >
        Request again
      </UButton>
    </div>

    <div v-else-if="loading" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading...</p>
    </div>

    <!-- Approved but no wedding created yet. -->
    <div v-else-if="!wedding" class="max-w-md mx-auto mt-8 animate-fade-up">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/20 mb-4">
          <UIcon name="i-heroicons-film" class="w-8 h-8 text-gold-300" />
        </div>
        <h1 class="text-3xl font-display font-bold text-white mb-2">You're approved!</h1>
        <p class="text-white/60 text-sm">Let's set up your VIP Cinematic invitation.</p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl space-y-5">
        <UFormField label="Bride's Name">
          <UInput v-model="brideName" placeholder="Aisyah" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Groom's Name">
          <UInput v-model="groomName" placeholder="Danial" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Your Custom Link Name" :error="slugError">
          <UInput v-model="slugInput" placeholder="aisyah-danial" size="lg" class="w-full" @input="onSlugInput" icon="i-heroicons-link" />
          <template #help>
            <span class="text-xs text-gold-300/70">yoursite.com/w/{{ slugPreview || 'your-link' }}/vip</span>
          </template>
        </UFormField>

        <UButton block size="xl" color="primary" class="font-semibold shadow-lg shadow-gold-500/20 mt-4 rounded-full" :loading="creating" @click="handleCreate">
          Create My VIP Invitation
        </UButton>
      </div>
    </div>

    <!-- Wedding Details - the source data the automatic cover/event/location
         scenes in VipCinematicInvite.vue pull from. Scenes themselves live
         on the "Your Scenes" page; the on/off switch + link live on
         "Preview & Publish" - each page saves only what it owns. -->
    <div v-else class="animate-fade-up">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-display font-bold text-white">Wedding Details</h1>
          <p class="text-sm text-white/50 mt-1">Fills the automatic cover and event-details scenes in your fly-through.</p>
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

      <div class="form-panel">
        <div class="grid sm:grid-cols-2 gap-4">
          <UFormField label="Bride's Name">
            <UInput v-model="details.brideName" placeholder="Aisyah" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Groom's Name">
            <UInput v-model="details.groomName" placeholder="Danial" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Wedding Date">
            <input v-model="details.dateISO" type="date" class="date-input" />
          </UFormField>
          <UFormField label="Time (as guests will see it)">
            <UInput v-model="details.timeLabel" placeholder="e.g. 10:00 AM" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Date (as guests will see it)">
            <UInput v-model="details.dateLabel" placeholder="e.g. Saturday, 12 September 2026" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Venue Name">
            <UInput v-model="details.venueName" placeholder="The Grand Ballroom" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Venue Address" class="sm:col-span-2">
            <UInput v-model="details.venueAddress" placeholder="123 Jalan Example, Kuala Lumpur" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Google Maps Link (optional)" class="sm:col-span-2">
            <UInput v-model="details.mapUrl" placeholder="https://maps.google.com/..." size="lg" class="w-full" />
          </UFormField>
        </div>
        <div class="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-800">
          <div class="min-w-0">
            <p class="text-sm font-medium text-white">RSVP button</p>
            <p class="text-xs text-gray-400">Show the RSVP button and page at the end of the fly-through.</p>
          </div>
          <USwitch v-model="details.rsvpEnabled" size="lg" />
        </div>
      </div>

      <!-- Couple Illustration - one picture of the two of you together,
           shown inside an ornamental arch frame on the cover, the very
           first scene of the fly-through. Optional - the cover uses a
           plain text frame when this is empty. -->
      <div class="form-panel mt-6">
        <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <UIcon name="i-heroicons-user-group" style="color: #e3b04a;" class="w-5 h-5" />
          Couple Illustration
        </h2>
        <p class="text-xs text-gray-400 mb-4">A picture of you both together, shown inside the ornamental arch on the cover. A photo or illustration with a transparent background works best. Optional - leave empty to keep the plain text cover.</p>
        <div class="flex items-center gap-4">
          <div v-if="details.coupleIllustrationUrl" class="w-20 h-28 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md bg-gray-800">
            <img :src="details.coupleIllustrationUrl" class="w-full h-full object-cover" />
          </div>
          <input ref="coupleIllustrationInput" type="file" accept="image/*" class="hidden" @change="handleCoupleIllustrationSelect">
          <div class="flex flex-wrap gap-2">
            <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-user-group" :loading="uploadingCoupleIllustration" :disabled="!cloudinaryConfigured" @click="coupleIllustrationInput?.click()">
              {{ details.coupleIllustrationUrl ? 'Change Picture' : 'Upload Picture' }}
            </UButton>
            <UButton v-if="details.coupleIllustrationUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="details.coupleIllustrationUrl = ''" />
          </div>
        </div>
      </div>

      <!-- Opening Style - the tap-to-open screen a guest sees first, before
           the cinematic fly-through starts. Same style catalog as the
           classic dashboard's Opening Design page (see
           DashboardOpeningPanel.vue) so VIP couples get the same choice,
           just condensed to what matters here: pick a style, and upload a
           picture if that style uses one. -->
      <div class="form-panel mt-6">
        <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <UIcon name="i-heroicons-envelope-open" style="color: #e3b04a;" class="w-5 h-5" />
          Opening Style
        </h2>
        <p class="text-xs text-gray-400 mb-4">The first screen a guest taps to open, before the fly-through begins.</p>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          <button
            v-for="opt in enabledOpeningStyles"
            :key="opt.value"
            type="button"
            class="opening-card"
            :class="{ 'opening-card-active': details.openingStyle === opt.value }"
            @click="details.openingStyle = opt.value"
          >
            <UIcon :name="opt.icon" class="w-5 h-5" :style="{ color: details.openingStyle === opt.value ? '#e3b04a' : undefined }" />
            <span class="text-[0.68rem] font-medium leading-tight text-center">{{ opt.label }}</span>
          </button>
        </div>

        <div v-if="details.openingStyle === 'modern-dark'" class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="palette in modernDarkPaletteCatalog"
            :key="palette.id"
            type="button"
            class="palette-swatch"
            :class="{ 'palette-swatch-active': (details.openingModernDarkPalette || modernDarkPaletteCatalog[0].id) === palette.id }"
            @click="details.openingModernDarkPalette = palette.id"
          >
            <span class="palette-dot" :style="{ background: palette.swatch }" />
            <span class="text-xs">{{ palette.label }}</span>
          </button>
        </div>
        <div v-else-if="details.openingStyle === 'minimal-light'" class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="palette in minimalLightPaletteCatalog"
            :key="palette.id"
            type="button"
            class="palette-swatch"
            :class="{ 'palette-swatch-active': (details.openingMinimalLightPalette || minimalLightPaletteCatalog[0].id) === palette.id }"
            @click="details.openingMinimalLightPalette = palette.id"
          >
            <span class="palette-dot" :style="{ background: palette.swatch }" />
            <span class="text-xs">{{ palette.label }}</span>
          </button>
        </div>

        <div v-if="showOpeningBgUpload" class="mt-4 pt-4 border-t border-gray-800">
          <p class="text-xs text-gray-400 mb-3">{{ openingBgCopy }}</p>
          <div class="flex items-center gap-4">
            <div v-if="details.openingBgUrl" class="w-16 h-24 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md">
              <img :src="details.openingBgUrl" class="w-full h-full object-cover" />
            </div>
            <input ref="openingBgInput" type="file" accept="image/*" class="hidden" @change="handleOpeningBgSelect">
            <div class="flex flex-wrap gap-2">
              <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-arrow-up-tray" :loading="uploadingOpeningBg" :disabled="!cloudinaryConfigured" @click="openingBgInput?.click()">
                {{ details.openingBgUrl ? 'Change Picture' : 'Upload Picture' }}
              </UButton>
              <UButton v-if="details.openingBgUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="details.openingBgUrl = ''" />
            </div>
          </div>
        </div>
      </div>

      <!-- Background Photo - a photo of the couple's own venue/place, used
           as a fixed backdrop behind the whole fly-through instead of the
           plain gradient. Optional. -->
      <div class="form-panel mt-6">
        <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <UIcon name="i-heroicons-photo" style="color: #e3b04a;" class="w-5 h-5" />
          Background Photo
        </h2>
        <p class="text-xs text-gray-400 mb-4">A photo of your venue or wedding place, shown behind every scene in the fly-through. Optional - leave empty to keep the plain color background.</p>
        <div class="flex items-center gap-4">
          <div v-if="backgroundImageUrl" class="w-24 h-24 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md">
            <img :src="backgroundImageUrl" class="w-full h-full object-cover" />
          </div>
          <input ref="backgroundImageInput" type="file" accept="image/*" class="hidden" @change="handleBackgroundImageSelect">
          <div class="flex flex-wrap gap-2">
            <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-photo" :loading="uploadingBackground" :disabled="!cloudinaryConfigured" @click="backgroundImageInput?.click()">
              {{ backgroundImageUrl ? 'Change Photo' : 'Upload Photo' }}
            </UButton>
            <UButton v-if="backgroundImageUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="backgroundImageUrl = ''" />
          </div>
        </div>
      </div>

      <div class="next-hint">
        <UIcon name="i-heroicons-arrow-right-circle" class="w-5 h-5 shrink-0" style="color: #e3b04a;" />
        <span>Next, add your story on the <NuxtLink to="/vip/dashboard/scenes" class="text-gold-300 hover:underline font-medium">Your Scenes</NuxtLink> page.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

const { profile, requestVipStatus } = useAuth()
const { wedding, loading, saving, createWedding, isSlugAvailable, updateContent, updateVipBackground, setPublished } = useMyWedding()
const { isConfigured: cloudinaryConfigured, uploadImage } = useCloudinary()
const { enabledOpeningStyles } = useThemes()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')
const gateIcon = computed(() => (vipApprovalStatus.value === 'rejected' ? 'i-heroicons-x-circle' : 'i-heroicons-clock'))
const gateIconColor = computed(() => (vipApprovalStatus.value === 'rejected' ? 'rgba(248, 113, 113, 0.7)' : '#e3b04a'))
const gateTitle = computed(() =>
  vipApprovalStatus.value === 'rejected' ? 'Your VIP request was not approved' : 'Your VIP request is awaiting approval'
)
const gateDescription = computed(() =>
  vipApprovalStatus.value === 'rejected'
    ? "You can send another request if you'd still like VIP Cinematic for your invitation."
    : "We've received your request - once our team approves it, you'll be able to build your invitation here."
)

const requesting = ref(false)
async function handleRequestAgain() {
  requesting.value = true
  try {
    await requestVipStatus()
    toast.add({ title: 'Request sent', color: 'success' })
  } finally {
    requesting.value = false
  }
}

// --- Create-the-wedding-doc flow (only reachable once) ---
const brideName = ref('')
const groomName = ref('')
const slugInput = ref('')
const slugError = ref('')
const creating = ref(false)
const slugPreview = computed(() => slugify(slugInput.value))
function onSlugInput() {
  slugError.value = ''
}
watch([brideName, groomName], () => {
  if (!slugInput.value) {
    slugInput.value = `${brideName.value}-${groomName.value}`.trim()
  }
})
async function handleCreate() {
  slugError.value = ''
  if (!brideName.value.trim() || !groomName.value.trim()) {
    toast.add({ title: 'Please enter both names', color: 'warning' })
    return
  }
  const clean = slugify(slugInput.value)
  if (!clean) {
    slugError.value = 'Please choose a link name'
    return
  }
  creating.value = true
  try {
    const available = await isSlugAvailable(clean)
    if (!available) {
      slugError.value = 'That link name is already taken'
      return
    }
    // Published immediately (not left 'draft') since the only page anyone is
    // ever pointed to is the VIP guest page, which needs the wedding doc to
    // be readable by guests at all once turned on from Preview & Publish.
    await createWedding(clean, brideName.value.trim(), groomName.value.trim())
    const { setPublished } = useMyWedding()
    await setPublished(true)
    toast.add({ title: 'Your VIP invitation is ready!', color: 'success' })
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Something went wrong'
  } finally {
    creating.value = false
  }
}

// --- Wedding Details form (only this page's own slice) ---
const details = reactive({
  brideName: '', groomName: '', dateISO: '', dateLabel: '', timeLabel: '',
  venueName: '', venueAddress: '', mapUrl: '', rsvpEnabled: true,
  openingStyle: 'classic', openingBgUrl: '', openingModernDarkPalette: '', openingMinimalLightPalette: '',
  coupleIllustrationUrl: ''
})
const savedAt = ref<number | null>(null)
const backgroundImageUrl = ref('')
const backgroundImageInput = ref<HTMLInputElement | null>(null)
const uploadingBackground = ref(false)

// Same "which styles need an uploaded picture" logic as DashboardOpeningPanel.vue.
const slideOpeningStyles = ['slide-up', 'slide-down', 'slide-left', 'slide-right']
const showOpeningBgUpload = computed(() =>
  details.openingStyle.includes('custom') || details.openingStyle === 'wax-seal' || slideOpeningStyles.includes(details.openingStyle)
)
const openingBgCopy = computed(() => {
  if (details.openingStyle === 'wax-seal') return 'Optional - a vertical picture (1080x1920) shown behind the wax seal as it cracks open. Leave empty for a plain gradient.'
  if (details.openingStyle === 'custom-split') return 'A vertical picture (1080x1920), sliced in half and slid open like double doors - make one in Canva if you like, then upload it here.'
  if (slideOpeningStyles.includes(details.openingStyle)) return 'Optional - a vertical picture (1080x1920) used as the cover, which slides off-screen when tapped.'
  return 'A vertical picture (1080x1920) used as the opening background - make one in Canva if you like, then upload it here.'
})
const openingBgInput = ref<HTMLInputElement | null>(null)
const uploadingOpeningBg = ref(false)
async function handleOpeningBgSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  uploadingOpeningBg.value = true
  try {
    details.openingBgUrl = await uploadImage(file, `weddings/${wedding.value.id}/opening`)
    toast.add({ title: 'Picture uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    uploadingOpeningBg.value = false
  }
  ;(event.target as HTMLInputElement).value = ''
}

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  details.brideName = value.content.brideName || ''
  details.groomName = value.content.groomName || ''
  details.dateISO = value.content.dateISO ? value.content.dateISO.slice(0, 10) : ''
  details.dateLabel = value.content.dateLabel || ''
  details.timeLabel = value.content.timeLabel || ''
  details.venueName = value.content.venueName || ''
  details.venueAddress = value.content.venueAddress || ''
  details.mapUrl = value.content.mapUrl || ''
  details.rsvpEnabled = value.content.rsvpEnabled !== false
  details.openingStyle = value.content.openingStyle || 'classic'
  details.openingBgUrl = value.content.openingBgUrl || ''
  details.openingModernDarkPalette = value.content.openingModernDarkPalette || ''
  details.openingMinimalLightPalette = value.content.openingMinimalLightPalette || ''
  details.coupleIllustrationUrl = value.content.coupleIllustrationUrl || ''
  backgroundImageUrl.value = value.vipBackgroundImageUrl || ''
}, { immediate: true })

const coupleIllustrationInput = ref<HTMLInputElement | null>(null)
const uploadingCoupleIllustration = ref(false)
async function handleCoupleIllustrationSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  uploadingCoupleIllustration.value = true
  try {
    details.coupleIllustrationUrl = await uploadImage(file, `weddings/${wedding.value.id}/couple`)
    toast.add({ title: 'Picture uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    uploadingCoupleIllustration.value = false
  }
  ;(event.target as HTMLInputElement).value = ''
}

async function handleBackgroundImageSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  uploadingBackground.value = true
  try {
    backgroundImageUrl.value = await uploadImage(file, `weddings/${wedding.value.id}/vip`)
    toast.add({ title: 'Photo uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    uploadingBackground.value = false
  }
  ;(event.target as HTMLInputElement).value = ''
}

async function save() {
  await updateContent({
    brideName: details.brideName.trim(),
    groomName: details.groomName.trim(),
    dateISO: details.dateISO,
    dateLabel: details.dateLabel.trim(),
    timeLabel: details.timeLabel.trim(),
    venueName: details.venueName.trim(),
    venueAddress: details.venueAddress.trim(),
    mapUrl: details.mapUrl.trim(),
    rsvpEnabled: details.rsvpEnabled,
    openingStyle: details.openingStyle,
    openingBgUrl: details.openingBgUrl,
    openingModernDarkPalette: details.openingModernDarkPalette,
    openingMinimalLightPalette: details.openingMinimalLightPalette,
    coupleIllustrationUrl: details.coupleIllustrationUrl
  })
  await updateVipBackground(backgroundImageUrl.value)
  savedAt.value = Date.now()
  toast.add({ title: 'Wedding details saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'Wedding Details — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.next-hint {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding: 0.9rem 1.1rem;
  border-radius: 0.85rem;
  background: rgba(212, 160, 23, 0.06);
  border: 1px solid rgba(212, 160, 23, 0.2);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.date-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  background: #1F2937;
  border: 1px solid #374151;
  color: #f3f4f6;
  font-size: 0.925rem;
  color-scheme: dark;
}
.date-input:focus {
  outline: none;
  border-color: var(--color-gold-400, #d4a017);
}

.opening-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.75rem 0.4rem;
  border-radius: 0.75rem;
  background: #1F2937;
  border: 1px solid #374151;
  color: #9CA3AF;
  transition: all 0.2s ease;
}
.opening-card:hover { border-color: rgba(212, 160, 23, 0.4); color: white; }
.opening-card-active { background: rgba(212, 160, 23, 0.1); border-color: var(--color-gold-400, #d4a017); color: #f3ddaa; }

.palette-swatch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: #1F2937;
  border: 1px solid #374151;
  color: #9CA3AF;
  transition: all 0.2s ease;
}
.palette-swatch:hover { border-color: rgba(212, 160, 23, 0.4); color: white; }
.palette-swatch-active { background: rgba(212, 160, 23, 0.1); border-color: var(--color-gold-400, #d4a017); color: #f3ddaa; }
.palette-dot { width: 1rem; height: 1rem; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.25); flex-shrink: 0; }
</style>
