<template>
  <div class="pb-12">

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

      <div class="flex flex-col lg:flex-row gap-8 xl:gap-10">

        <!-- Left: editing -->
        <div class="flex-1 min-w-0 space-y-6">

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

      <!-- Family Details - full names + parents, shown on their own bride
           biodata / groom biodata scenes in the fly-through (right after the
           greeting card). Optional and independent - each scene only
           appears once that person's fields are filled in, same "empty
           means skipped" rule as Couple Illustration below. These fields
           already existed for the classic layout (see brideFullName etc. on
           WeddingContent) - this panel is what was missing to let VIP
           couples fill them in too. -->
      <div class="form-panel">
        <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <UIcon name="i-heroicons-identification" style="color: #e3b04a;" class="w-5 h-5" />
          Family Details
        </h2>
        <p class="text-xs text-gray-400 mb-4">Adds a bride biodata and a groom biodata scene to the fly-through, right after the greeting card. Leave a person's fields empty to skip their scene.</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <UFormField label="Bride's Full Name">
            <UInput v-model="details.brideFullName" placeholder="Nur Aisyah binti Ahmad" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Groom's Full Name">
            <UInput v-model="details.groomFullName" placeholder="Danial bin Hassan" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Bride's Parents">
            <UInput v-model="details.brideParents" placeholder="Tuan Haji ... & Puan Hajjah ..." size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Groom's Parents">
            <UInput v-model="details.groomParents" placeholder="Encik ... & Puan ..." size="lg" class="w-full" />
          </UFormField>
          <UFormField label="'Child of' label" class="sm:col-span-2">
            <UInput v-model="details.childOfLabel" placeholder="Child of" size="lg" class="w-full" />
          </UFormField>
        </div>
      </div>

      <!-- Couple Illustration - one picture of the two of you together,
           shown inside an ornamental arch frame on the cover, the very
           first scene of the fly-through. Optional - the cover uses a
           plain text frame when this is empty. -->
      <div class="form-panel">
        <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <UIcon name="i-heroicons-user-group" style="color: #e3b04a;" class="w-5 h-5" />
          Couple Illustration
        </h2>
        <p class="text-xs text-gray-400 mb-4">A picture of you both together, shown on the cover, the venue scene right after it, and the photo frames scene near the end. A photo or illustration with a transparent background works best. Optional - those three scenes stay in their plain text/skipped form when this is empty.</p>
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

      <!-- Doa (Prayer) - an optional extra scene between the event details
           and location scenes. Off by default since not every couple wants
           a religious text scene; turning it on with the text left empty
           still shows a generic Malay wedding doa rather than a blank scene. -->
      <div class="form-panel">
        <div class="flex items-center justify-between gap-4 mb-1">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" style="color: #e3b04a;" class="w-5 h-5" />
            Doa (Prayer)
          </h2>
          <USwitch v-model="details.enableDoa" size="lg" />
        </div>
        <p class="text-xs text-gray-400 mb-4">An extra scene between the event details and location scenes, showing a short prayer for the two of you. Off by default.</p>
        <UFormField v-if="details.enableDoa" label="Prayer text (optional)">
          <UTextarea v-model="details.doaText" placeholder="Leave empty to use a generic Malay wedding doa" :rows="3" class="w-full" />
        </UFormField>
      </div>

      <!-- Opening Style moved to its own "Opening Screen" page (full text,
           translation, and per-element font/color control - not just style
           + picture), same shared component as the classic dashboard's
           Opening Design page. This is just a hand-off link so it isn't
           edited in two places. -->
      <NuxtLink to="/vip/dashboard/opening" class="form-panel opening-linkout">
        <div class="flex items-center gap-3 min-w-0">
          <div class="p-2.5 rounded-lg bg-gold-400/10 border border-gold-400/20 shrink-0">
            <UIcon name="i-heroicons-envelope-open" class="w-5 h-5" style="color: #e3b04a;" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-white">Opening Screen</h2>
            <p class="text-xs text-gray-400 mt-0.5">Style, background picture, wording, and translation for the first screen a guest taps to open.</p>
          </div>
        </div>
        <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-500 shrink-0" />
      </NuxtLink>

      <!-- Background Photo - a photo of the couple's own venue/place, used
           as a fixed backdrop behind the whole fly-through instead of the
           plain gradient. Optional. -->
      <div class="form-panel">
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

        <!-- Right: live preview - same real VipCinematicInvite component
             and embedded phone-bezel pattern as Your Scenes (see that page's
             comment), fed the couple's real wedding with just the fields
             this page owns swapped for whatever's in the form above right
             now, so edits show up before you hit Save. -->
        <div class="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2 w-full mb-2 px-1">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
          </p>
          <p class="text-xs text-white/40 mb-4 px-1 leading-relaxed">
            The real fly-through, exactly as a guest sees it - tap the phone to open it.
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
                focus-scene="event"
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

const { profile, requestVipStatus } = useAuth()
const { wedding, loading, saving, createWedding, isSlugAvailable, updateContent, updateVipBackground, setPublished } = useMyWedding()
const { isConfigured: cloudinaryConfigured, uploadImage } = useCloudinary()
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
  brideFullName: '', brideParents: '', groomFullName: '', groomParents: '', childOfLabel: '',
  coupleIllustrationUrl: '',
  enableDoa: false, doaText: ''
})
const savedAt = ref<number | null>(null)
const backgroundImageUrl = ref('')
const backgroundImageInput = ref<HTMLInputElement | null>(null)
const uploadingBackground = ref(false)

// Feeds the Live Preview panel: the couple's real wedding doc, with the
// fields this page owns swapped for whatever's in `details`/
// `backgroundImageUrl` right now (not necessarily saved yet), same pattern
// as Your Scenes' previewWedding.
const previewWedding = computed(() => {
  if (!wedding.value) return null
  return {
    ...wedding.value,
    vipBackgroundImageUrl: backgroundImageUrl.value,
    content: {
      ...wedding.value.content,
      brideName: details.brideName,
      groomName: details.groomName,
      dateISO: details.dateISO,
      dateLabel: details.dateLabel,
      timeLabel: details.timeLabel,
      venueName: details.venueName,
      venueAddress: details.venueAddress,
      mapUrl: details.mapUrl,
      rsvpEnabled: details.rsvpEnabled,
      brideFullName: details.brideFullName,
      brideParents: details.brideParents,
      groomFullName: details.groomFullName,
      groomParents: details.groomParents,
      childOfLabel: details.childOfLabel,
      coupleIllustrationUrl: details.coupleIllustrationUrl,
      enableDoa: details.enableDoa,
      doaText: details.doaText
    }
  }
})
const rsvpLink = computed(() => (wedding.value ? `/w/${wedding.value.slug}/rsvp` : ''))

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
  details.brideFullName = value.content.brideFullName || ''
  details.brideParents = value.content.brideParents || ''
  details.groomFullName = value.content.groomFullName || ''
  details.groomParents = value.content.groomParents || ''
  details.childOfLabel = value.content.childOfLabel || ''
  details.coupleIllustrationUrl = value.content.coupleIllustrationUrl || ''
  details.enableDoa = value.content.enableDoa === true
  details.doaText = value.content.doaText || ''
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
    brideFullName: details.brideFullName.trim(),
    brideParents: details.brideParents.trim(),
    groomFullName: details.groomFullName.trim(),
    groomParents: details.groomParents.trim(),
    childOfLabel: details.childOfLabel.trim(),
    coupleIllustrationUrl: details.coupleIllustrationUrl,
    enableDoa: details.enableDoa,
    doaText: details.doaText.trim()
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

.opening-linkout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}
.opening-linkout:hover { border-color: rgba(212, 160, 23, 0.4); }

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
