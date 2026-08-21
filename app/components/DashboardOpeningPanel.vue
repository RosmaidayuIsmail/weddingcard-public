<template>
  <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">
    
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" style="color: #e3b04a;" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading Studio...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-envelope-open" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pt-4 lg:pt-0">
        <div>
          <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            Opening Design
          </h1>
          <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
            <UIcon name="i-heroicons-envelope-open" class="w-4 h-4" style="color: #e3b04a;" />
            Design the first thing your guests see when they click your link.
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <UButton 
            size="lg" 
            color="primary" 
            class="font-semibold shadow-xl shadow-gold-500/20 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/30 w-full sm:w-auto" 
            :loading="saving" 
            @click="saveContent"
          >
            Save changes
          </UButton>
        </div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">
        
        <!-- Left Column: Controls -->
        <div class="flex-1 w-full lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-8 order-2 lg:order-1">
          
          <div class="space-y-8 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <!-- Cover Style Selector -->
            <div>
              <h3 class="text-sm font-semibold text-white mb-3">Cover Layout Style</h3>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="opt in openingStyles"
                  :key="opt.value"
                  type="button"
                  class="ornament-card group"
                  :class="{ 'ornament-card-active': form.openingStyle === opt.value }"
                  @click="form.openingStyle = opt.value"
                >
                  <div class="h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                       :style="{ color: form.openingStyle === opt.value ? '#e3b04a' : 'currentColor' }">
                    <UIcon :name="opt.icon" class="w-6 h-6 drop-shadow" />
                  </div>
                  <span class="text-xs font-medium">{{ opt.label }}</span>
                  <UIcon v-if="form.openingStyle === opt.value" name="i-heroicons-check-circle" class="absolute top-2 right-2 w-4 h-4 text-current" />
                </button>
              </div>
            </div>

            <!-- Modern Dark / Minimal Light palette picker - each of these
                 two styles is a couple-selectable curated color palette
                 (real gradient + blob colors, not just a label) rather than
                 one fixed look. -->
            <Transition name="fade-down">
              <div v-if="form.openingStyle === 'modern-dark'" class="p-5 rounded-xl bg-[#111827] border border-gray-700 space-y-3">
                <h3 class="text-sm font-semibold text-white">Modern Dark Palette</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    v-for="palette in modernDarkPaletteCatalog"
                    :key="palette.id"
                    type="button"
                    class="palette-swatch"
                    :class="{ 'palette-swatch-active': (form.openingModernDarkPalette || modernDarkPaletteCatalog[0].id) === palette.id }"
                    @click="form.openingModernDarkPalette = palette.id"
                  >
                    <span class="palette-swatch-dot" :style="{ background: palette.swatch }" />
                    <span class="text-xs">{{ palette.label }}</span>
                  </button>
                </div>
              </div>
              <div v-else-if="form.openingStyle === 'minimal-light'" class="p-5 rounded-xl bg-[#111827] border border-gray-700 space-y-3">
                <h3 class="text-sm font-semibold text-white">Minimal Light Palette</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    v-for="palette in minimalLightPaletteCatalog"
                    :key="palette.id"
                    type="button"
                    class="palette-swatch"
                    :class="{ 'palette-swatch-active': (form.openingMinimalLightPalette || minimalLightPaletteCatalog[0].id) === palette.id }"
                    @click="form.openingMinimalLightPalette = palette.id"
                  >
                    <span class="palette-swatch-dot" :style="{ background: palette.swatch }" />
                    <span class="text-xs">{{ palette.label }}</span>
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Cover Picture Upload - powers the Canva backgrounds AND now
                 the Wax Seal doors, which can slide open over your own
                 picture instead of a plain gradient, same as Split Door. -->
            <Transition name="fade-down">
              <div v-if="showOpeningBgUpload" class="p-5 rounded-xl bg-indigo-900/20 border border-indigo-800 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-indigo-800/40 shrink-0">
                    <UIcon name="i-heroicons-paint-brush" class="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ openingBgPanelCopy.title }}</p>
                    <p class="text-xs text-gray-400">{{ openingBgPanelCopy.description }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div v-if="form.openingBgUrl" class="w-16 h-24 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md">
                    <img :src="form.openingBgUrl" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <input ref="openingBgInput" type="file" accept="image/*" class="hidden" @change="handleOpeningBgSelect">
                    <div class="flex flex-wrap gap-2">
                      <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-arrow-up-tray" :loading="openingBgUploading" :disabled="!cloudinaryConfigured" @click="openingBgInput?.click()">
                        {{ form.openingBgUrl ? 'Change Background' : 'Upload Image' }}
                      </UButton>
                      <UButton v-if="form.openingBgUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.openingBgUrl = ''" />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Background Music - plays once a guest taps the envelope open,
                 same moment MusicToggle appears on the real page. -->
            <div class="pt-6 border-t border-gray-800">
              <h3 class="text-sm font-semibold text-white mb-1">Background Music</h3>
              <p class="text-xs text-gray-400 mb-4">Plays as soon as a guest opens the envelope. Leave empty for a silent opening.</p>
              <div class="flex items-center gap-3 flex-wrap">
                <input ref="audioInput" type="file" accept="audio/*" class="hidden" @change="handleAudioSelect">
                <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-arrow-up-tray" :loading="audioUploading" :disabled="!cloudinaryConfigured" @click="audioInput?.click()">
                  {{ form.audioSrc ? 'Change Track' : 'Upload Audio' }}
                </UButton>
                <MusicToggle v-if="form.audioSrc" :src="form.audioSrc" />
                <UButton v-if="form.audioSrc" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.audioSrc = ''" />
              </div>
              <UFormField label="Or paste a song link — YouTube, YouTube Music, or a direct audio URL" class="mt-3">
                <UInput v-model="form.audioSrc" placeholder="https://music.youtube.com/watch?v=... or https://.../song.mp3" class="w-full" />
              </UFormField>
              <p class="text-xs text-gray-500 mt-2">A YouTube or YouTube Music link plays through YouTube's own player in the background — no downloading needed. It won't work if the video's owner has disabled embedding elsewhere.</p>
              <p v-if="!cloudinaryConfigured" class="text-xs text-amber-400/80 mt-2">Image/audio uploads aren't configured on this deployment - paste a link instead.</p>
            </div>

            <!-- Language Translation Presets -->
            <div class="pt-6 border-t border-gray-800">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 class="text-sm font-semibold text-white">Opening Text Settings</h3>
                <div class="flex flex-wrap bg-gray-900 border border-gray-700 rounded-full p-1 gap-0.5">
                  <button v-for="preset in allTextPresets" :key="preset.id" type="button" @click="applyTranslation(preset)" class="px-3 py-1 text-xs font-medium rounded-full transition-colors hover:bg-gray-800 hover:text-white text-gray-400">{{ preset.label }}</button>
                </div>
              </div>

              <div class="space-y-4">
                <UFormField label="Main Title">
                  <UInput v-model="form.openingTitle" placeholder="e.g. Walimatul Urus" size="lg" class="w-full" />
                </UFormField>
                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showTitleStyle = !showTitleStyle">
                  <UIcon :name="showTitleStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font, size, color &amp; boldness
                </button>
                <div v-if="showTitleStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingTitle" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <UFormField label="Guest Greeting">
                  <UInput v-model="form.openingGreeting" placeholder="e.g. Menjemput {guestName} sekeluarga" size="lg" class="w-full" />
                  <template #help><span class="text-xs text-gray-500">Use <code class="text-gold-300">{guestName}</code> anywhere in the sentence - text before and after it both work, e.g. "Menjemput {guestName} sekeluarga". Each of the three parts - before, the name, and after - can have its own font below, so e.g. "Menjemput" and "sekeluarga" don't have to match.</span></template>
                </UFormField>
                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showGreetingStyle = !showGreetingStyle">
                  <UIcon :name="showGreetingStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font for the text before the name (e.g. "Menjemput")
                </button>
                <div v-if="showGreetingStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingGreeting" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showGuestNameStyle = !showGuestNameStyle">
                  <UIcon :name="showGuestNameStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font for the guest's name itself
                </button>
                <div v-if="showGuestNameStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingGuestName" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showGreetingAfterStyle = !showGreetingAfterStyle">
                  <UIcon :name="showGreetingAfterStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font for the text after the name (e.g. "sekeluarga")
                </button>
                <div v-if="showGreetingAfterStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingGreetingAfter" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <UFormField label="Action Button Text">
                  <UInput v-model="form.openingActionText" placeholder="e.g. Klik untuk buka" size="lg" class="w-full" />
                </UFormField>
                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showActionStyle = !showActionStyle">
                  <UIcon :name="showActionStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font, size, color &amp; boldness
                </button>
                <div v-if="showActionStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingAction" :form="form" :font-select-items="fontSelectItems" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Mobile Preview of the ENVELOPE -->
        <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
            </p>
            <UButton variant="link" color="gray" size="xs" icon="i-heroicons-arrow-path" :padded="false" @click="previewOpened = false">
              Reset Preview
            </UButton>
          </div>
          
          <!-- Smartphone Mockup Wrapper -->
          <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <!-- The actual Envelope preview component -->
            <div class="phone-screen hide-scrollbar relative bg-[#04101f]" :style="styleVars">
              <!-- Pass "Guest Name" as dummy text so you can see the auto-filling -->
              <EnvelopeIntro v-model:opened="previewOpened" guest-name="Guest Name" :content="form" />
              <!-- Show something behind it so opening it looks natural -->
              <div v-if="previewOpened" class="absolute inset-0 flex items-center justify-center text-white/50 text-sm italic">
                (Inner card revealed)
              </div>
              <!-- Same spot/trigger as the real page, but deliberately NOT
                   autoplay: this preview shares the same page-wide audio
                   player as the actual live site, so an autoplaying toggle
                   here meant every tap of "preview the animation" while
                   editing also started playing music unprompted. Tapping
                   the icon still lets you manually check how a track
                   sounds. -->
              <div v-if="previewOpened && form.audioSrc" class="absolute top-4 right-4 z-30">
                <MusicToggle :src="form.audioSrc" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createDefaultContent, type WeddingContent } from '~/composables/useWeddingTypes'

import type { TextPreset } from '~/composables/useThemes'

// This is the real Opening Design editor, shared by /dashboard/opening and
// the /admin/wedding/[id]/opening admin page. overrideWeddingId is only
// ever set by the admin page; couples hitting their own dashboard never
// pass it, so useMyWedding() falls back to its normal own-wedding lookup.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading, saving, updateContent } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { isConfigured: cloudinaryConfigured, uploadImage, uploadAudio } = useCloudinary()
const { themeStyleVars, allFontOptions, allTextPresets, enabledOpeningStyles: openingStyles } = useThemes()

const fontSelectItems = computed(() => [
  { label: 'Auto (use theme default)', value: '' },
  ...allFontOptions.value.map((f) => ({ label: f.label, value: f.id }))
])

const showTitleStyle = ref(false)
const showGreetingStyle = ref(false)
const showGuestNameStyle = ref(false)
const showGreetingAfterStyle = ref(false)
const showActionStyle = ref(false)
const toast = useToast()

const form = reactive<WeddingContent>(createDefaultContent())
const savedAt = ref<number | null>(null)
const previewOpened = ref(false)

const openingBgInput = ref<HTMLInputElement | null>(null)
const openingBgUploading = ref(false)

const audioInput = ref<HTMLInputElement | null>(null)
const audioUploading = ref(false)

async function handleAudioSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  audioUploading.value = true
  try {
    const url = await uploadAudio(file, `weddings/${wedding.value.id}/audio`, file.name)
    form.audioSrc = url
    toast.add({ title: 'Background music uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: error instanceof Error ? error.message : 'Upload failed', color: 'error' })
  } finally {
    audioUploading.value = false
  }
  if (audioInput.value) audioInput.value.value = ''
}

// The cover picture upload panel now powers every style except Classic,
// Modern Dark and Minimal Light: the two Canva backgrounds (required),
// Wax Seal (optional - falls back to a gradient panel), and the four
// Slide styles (optional - falls back to a gradient background).
const slideStyles = ['slide-up', 'slide-down', 'slide-left', 'slide-right']
const showOpeningBgUpload = computed(() =>
  form.openingStyle.includes('custom') || form.openingStyle === 'wax-seal' || slideStyles.includes(form.openingStyle)
)

const openingBgPanelCopy = computed(() => {
  if (form.openingStyle === 'wax-seal') {
    return {
      title: 'Wax Seal Door Picture (optional)',
      description: 'Upload a vertical photo (1080x1920) to show behind the wax seal as it cracks open - the doors slide over it just like Split Door. Leave empty to use the default gradient panels.'
    }
  }
  if (form.openingStyle === 'custom-split') {
    return {
      title: 'Split Door Background',
      description: 'Upload your own vertical design (1080x1920) - it\'s sliced in half and slides open like double doors.'
    }
  }
  if (slideStyles.includes(form.openingStyle)) {
    return {
      title: 'Slide Cover Picture (optional)',
      description: 'Upload a vertical photo (1080x1920) to use as the cover - it travels off-screen with the rest of the cover when tapped. Leave empty to use the default gradient.'
    }
  }
  return {
    title: 'Custom Canva Background',
    description: 'Upload your own vertical design (1080x1920) to use as the opening background.'
  }
})

// Dynamically inject custom Google Font stylesheet into the editor for live preview
useHead({
  link: computed(() => {
    if (form.customFontUrl && !form.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: form.customFontUrl }]
    }
    return []
  })
})

const styleVars = computed(() => {
  if (!wedding.value) return {}
  return themeStyleVars(
    wedding.value.themeId,
    { bgFrom: form.customBgFrom, bgTo: form.customBgTo, accent: form.customAccent },
    form.customFontFamily || form.fontFamily
  )
})

function applyTranslation(preset: TextPreset) {
  form.openingTitle = preset.openingTitle
  form.openingGreeting = preset.openingGreeting
  form.openingActionText = preset.openingActionText
  toast.add({ title: 'Text presets applied', color: 'success' })
}

let initialized = false
watch(
  wedding,
  (value) => {
    if (!value || initialized) return
    initialized = true
    Object.assign(form, value.content)
    
    // Fallbacks for older DB entries
    if (!form.openingStyle) form.openingStyle = 'classic'
    if (!form.openingTitle) form.openingTitle = "You're Invited"
    if (!form.openingGreeting) form.openingGreeting = 'Dear'
    if (!form.openingActionText) form.openingActionText = 'Tap to open'
  },
  { immediate: true }
)

async function saveContent() {
  await updateContent({ ...form })
  savedAt.value = Date.now()
  toast.add({ title: 'Opening Design saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

async function handleOpeningBgSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  openingBgUploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/opening`)
    form.openingBgUrl = url
    toast.add({ title: 'Opening background uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    openingBgUploading.value = false
  }
  if (openingBgInput.value) openingBgInput.value.value = ''
}

useSeoMeta({ title: 'Opening Design — WeddingCard' })
</script>

<style scoped>
/* Form Panels */
.form-panel {
  border-radius: 1.25rem;
  padding: 1.75rem;
  background: #111827; 
  border: 1px solid #374151; 
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.panel-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
}

/* Ornament Cards */
.ornament-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-radius: 1rem;
  background: #1F2937;
  border: 1px solid #374151;
  color: #9CA3AF;
  transition: all 0.3s ease;
}

.ornament-card:hover {
  background: #374151; 
  border-color: rgba(212, 160, 23, 0.4);
  color: white;
}

.ornament-card-active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--color-gold-400);
  color: #f3ddaa;
}

/* Modern Dark / Minimal Light palette swatches */
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
.palette-swatch:hover {
  border-color: rgba(212, 160, 23, 0.4);
  color: white;
}
.palette-swatch-active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--color-gold-400);
  color: #f3ddaa;
}
.palette-swatch-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

/* Smartphone Bezel */
.phone-bezel {
  position: relative;
  height: 720px; 
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
  box-shadow: inset 0 -1px 1px rgba(255,255,255,0.05);
}

.phone-screen {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.fade-down-enter-active, .fade-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151; 
  border-radius: 10px;
}
</style>