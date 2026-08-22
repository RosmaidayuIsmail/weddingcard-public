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
          <h1 class="text-3xl font-display font-bold text-white">Design</h1>
          <p class="text-sm text-white/50 mt-1">Colors, fonts, and the falling-particle effect for your whole fly-through.</p>
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

        <!-- Left: controls -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Curated Themes -->
          <div class="form-panel">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <UIcon name="i-heroicons-swatch" style="color: #e3b04a;" class="w-5 h-5" />
                  Curated Themes
                </h2>
                <p class="text-xs text-gray-400 mt-1">Pick a starting palette and heading font for your fly-through.</p>
              </div>
            </div>

            <div class="theme-grid">
              <button
                v-for="theme in allThemes"
                :key="theme.id"
                type="button"
                class="theme-card"
                :class="{ 'theme-card-active': selectedThemeId === theme.id }"
                @click="selectedThemeId = theme.id"
              >
                <span
                  class="theme-swatch"
                  :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})`, borderColor: theme.palette.accent }"
                >
                  <span class="theme-swatch-accent" :style="{ background: theme.palette.accent }" />
                </span>
                <span class="flex-1 min-w-0 text-left">
                  <span class="block text-sm font-medium truncate">{{ theme.name }}</span>
                  <span class="block text-[0.7rem] text-white/40 truncate">{{ theme.headingFont }}</span>
                </span>
                <UIcon v-if="selectedThemeId === theme.id" name="i-heroicons-check-circle" class="w-5 h-5 text-current shrink-0" />
              </button>
            </div>
          </div>

          <!-- Custom Palette -->
          <div class="form-panel">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <UIcon name="i-heroicons-paint-brush" style="color: #e3b04a;" class="w-5 h-5" />
                  Custom Palette
                </h2>
                <p class="text-xs text-gray-400 mt-1">Fine-tune the colors to match your motif perfectly.</p>
              </div>
              <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-arrow-path" title="Reset to theme defaults" @click="resetColors" />
            </div>

            <div class="grid grid-cols-3 gap-2 sm:gap-4">
              <label class="color-picker-wrapper group">
                <span class="color-picker-label">Bg Start</span>
                <div class="color-picker-swatch" :style="{ backgroundColor: form.customBgFrom || currentTheme.palette.bgFrom }">
                  <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :value="form.customBgFrom || currentTheme.palette.bgFrom" @input="form.customBgFrom = ($event.target as HTMLInputElement).value">
                </div>
                <span class="text-[0.65rem] font-mono text-gray-500 uppercase tracking-widest mt-1 hidden sm:block">{{ form.customBgFrom || currentTheme.palette.bgFrom }}</span>
              </label>
              <label class="color-picker-wrapper group">
                <span class="color-picker-label">Bg End</span>
                <div class="color-picker-swatch" :style="{ backgroundColor: form.customBgTo || currentTheme.palette.bgTo }">
                  <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :value="form.customBgTo || currentTheme.palette.bgTo" @input="form.customBgTo = ($event.target as HTMLInputElement).value">
                </div>
                <span class="text-[0.65rem] font-mono text-gray-500 uppercase tracking-widest mt-1 hidden sm:block">{{ form.customBgTo || currentTheme.palette.bgTo }}</span>
              </label>
              <label class="color-picker-wrapper group">
                <span class="color-picker-label">Accent</span>
                <div class="color-picker-swatch" :style="{ backgroundColor: form.customAccent || currentTheme.palette.accent }">
                  <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :value="form.customAccent || currentTheme.palette.accent" @input="form.customAccent = ($event.target as HTMLInputElement).value">
                </div>
                <span class="text-[0.65rem] font-mono text-gray-500 uppercase tracking-widest mt-1 hidden sm:block">{{ form.customAccent || currentTheme.palette.accent }}</span>
              </label>
            </div>
          </div>

          <!-- Typography -->
          <div class="form-panel">
            <div class="mb-4">
              <h2 class="text-base font-semibold text-white flex items-center gap-2">
                <UIcon name="i-heroicons-language" style="color: #e3b04a;" class="w-5 h-5" />
                Typography
              </h2>
              <p class="text-xs text-gray-400 mt-1">Select a curated font, or link any font from Google Fonts.</p>
            </div>

            <div class="flex bg-gray-900 border border-gray-700 rounded-lg p-1 mb-5">
              <button
                type="button"
                class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300"
                :class="!useCustomFont ? 'bg-gray-700 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-white'"
                @click="toggleFontMode(false)"
              >
                Curated Defaults
              </button>
              <button
                type="button"
                class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2"
                :class="useCustomFont ? 'bg-gray-700 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-white'"
                @click="toggleFontMode(true)"
              >
                <UIcon name="i-heroicons-link" class="w-4 h-4" /> Custom Google Font
              </button>
            </div>

            <div v-show="!useCustomFont" class="animate-in fade-in duration-300">
              <USelect v-model="fontSelectValue" :items="fontSelectItems" size="xl" class="w-full shadow-inner" />
            </div>

            <div v-show="useCustomFont" class="p-4 sm:p-5 rounded-xl bg-gold-400/5 border border-gold-400/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div class="p-3 sm:p-4 rounded-lg bg-black/40 border border-white/5 text-sm text-white/70">
                <p class="font-semibold text-gold-300 mb-2 flex items-center gap-2"><UIcon name="i-heroicons-sparkles" /> Auto-Magic Font Setup!</p>
                <p class="text-xs mb-3">Just paste the website link from Google Fonts and we will extract the correct code for you automatically.</p>
                <ul class="list-disc pl-4 space-y-2 text-xs">
                  <li><strong>Example Paste:</strong> <code class="text-emerald-400 bg-emerald-400/10 px-1 rounded break-all">https://fonts.google.com/specimen/Edu+VIC+WA+NT+Hand+Precursive</code></li>
                </ul>
              </div>

              <UFormField label="Google Font Stylesheet URL">
                <UInput v-model="form.customFontUrl" placeholder="Paste URL here..." size="md" class="w-full">
                  <template #leading><UIcon name="i-heroicons-link" style="color: #e3b04a;" class="w-4 h-4" /></template>
                </UInput>
              </UFormField>

              <UFormField label="CSS Font Family Name">
                <UInput v-model="form.customFontFamily" placeholder="Auto-filled..." size="md" class="w-full">
                  <template #leading><UIcon name="i-heroicons-code-bracket" style="color: #e3b04a;" class="w-4 h-4" /></template>
                </UInput>
              </UFormField>
            </div>

            <div class="mt-6 p-6 rounded-xl bg-gray-900 border border-gray-800 text-center overflow-hidden flex items-center justify-center min-h-[100px] shadow-inner">
              <span
                class="text-3xl sm:text-4xl transition-all duration-300 drop-shadow-md"
                :style="{ fontFamily: activeFontFamily, color: currentTheme.palette.ink }"
              >
                {{ wedding.content.brideName || 'Aisyah' }} <span class="text-[0.6em] mx-1 opacity-80" :style="{ color: form.customAccent || currentTheme.palette.accent }">&amp;</span> {{ wedding.content.groomName || 'Danial' }}
              </span>
            </div>
          </div>

          <!-- Text Boldness -->
          <div class="form-panel">
            <h2 class="text-base font-semibold text-white flex items-center gap-2 mb-1">
              <UIcon name="i-heroicons-bold" style="color: #e3b04a;" class="w-5 h-5" />
              Text Boldness
            </h2>
            <p class="text-xs text-gray-400 mb-4">If descriptive text is hard to read against your chosen colors (especially busy or darker themes), try a bolder weight.</p>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="opt in textWeightOptions"
                :key="opt.value"
                type="button"
                class="p-2.5 rounded-xl border text-xs transition-colors"
                :style="{ fontWeight: opt.value }"
                :class="(form.textWeight || '300') === opt.value ? 'border-[#e3b04a] bg-[#e3b04a]/10 text-gold-200' : 'border-gray-700 text-gray-400 hover:border-gray-600'"
                @click="form.textWeight = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Falling Petals -->
          <div class="form-panel">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <UIcon name="i-heroicons-sparkles" style="color: #e3b04a;" class="w-5 h-5" />
                  Falling Petals Animation
                </h2>
                <p class="text-xs text-gray-400 mt-1">Add a beautiful falling-particle effect over the background.</p>
              </div>
              <button
                type="button"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                :class="form.enablePetals ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                @click="form.enablePetals = !form.enablePetals"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="form.enablePetals ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <div v-if="form.enablePetals" class="pt-5 grid grid-cols-4 gap-2">
              <button
                v-for="opt in petalStyleOptions"
                :key="opt.value"
                type="button"
                class="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors"
                :class="(form.petalStyle || 'petals') === opt.value ? 'border-[#e3b04a] bg-[#e3b04a]/10 text-gold-200' : 'border-gray-700 text-gray-400 hover:border-gray-600'"
                @click="form.petalStyle = opt.value"
              >
                <UIcon :name="opt.icon" class="w-5 h-5" />
                <span class="text-[10px] font-medium">{{ opt.label }}</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Right: live preview - same real VipCinematicInvite component
             and embedded phone-bezel pattern as every other VIP dashboard
             page, fed the couple's real wedding with just the theme/content
             fields this page owns swapped for whatever's in the form above
             right now, so a color, font, or petals change shows up in the
             real fly-through before you even hit Save. -->
        <div class="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2 w-full mb-2 px-1">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
          </p>
          <p class="text-xs text-white/40 mb-4 px-1 leading-relaxed">
            The real fly-through, exactly as a guest sees it - tap the phone to open it.
            Reflects your changes as you edit, even before you save.
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

const { profile } = useAuth()
const { wedding, loading, saving, updateContent, updateTheme } = useMyWedding()
const { getTheme, allThemes, allFontOptions, enabledPetalStyles } = useThemes()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')
const rsvpLink = computed(() => (wedding.value ? `/w/${wedding.value.slug}/rsvp` : ''))

const savedAt = ref<number | null>(null)
const selectedThemeId = ref('timeless-gold')

// Only this page's own slice of WeddingContent - the fields VipCinematicInvite
// actually reads for colors/fonts/petals (see themeStyleVars(...) near the top
// of its script and the PetalsBackground line near the bottom). Monogram,
// ornamentStyle, and nameColor/nameSize are deliberately left out - grepping
// VipCinematicInvite.vue confirms none of them are read anywhere on the VIP
// guest page, so they stay classic-dashboard-only.
const form = reactive({
  customBgFrom: '',
  customBgTo: '',
  customAccent: '',
  fontFamily: '',
  customFontUrl: '',
  customFontFamily: '',
  textWeight: '300',
  enablePetals: true,
  petalStyle: 'petals'
})

const textWeightOptions = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '600' },
  { label: 'Bold', value: '700' }
]

// Sourced from the shared platform catalog (app/composables/useThemes.ts) so
// admin's Design Options toggles control exactly what appears here. If this
// wedding's current value was disabled by admin AFTER the couple picked it,
// it's kept in the list anyway so their own picker never looks broken or
// silently loses their existing selection. Same pattern as the classic
// Design Studio (app/pages/dashboard/editor.vue).
const petalStyleOptions = computed(() => {
  const list = enabledPetalStyles.value
  return list.some((o) => o.value === form.petalStyle) || !form.petalStyle
    ? list
    : [{ label: form.petalStyle, value: form.petalStyle, icon: 'i-heroicons-sparkles' }, ...list]
})

const currentTheme = computed(() => getTheme(selectedThemeId.value))

// Typography controls - mirrors the classic Design Studio's font picker
// exactly: a curated dropdown sourced from useThemes(), or a "paste a
// Google Fonts link" custom mode that auto-extracts the stylesheet URL and
// CSS family name from a pasted fonts.google.com/specimen/... link.
const FONT_DEFAULT_SENTINEL = 'default'

const fontSelectItems = computed(() => [
  { label: `Theme default (${currentTheme.value.headingFont})`, value: FONT_DEFAULT_SENTINEL },
  ...allFontOptions.value.map((f) => ({ label: f.label, value: f.id }))
])

const fontSelectValue = computed({
  get: () => form.fontFamily || FONT_DEFAULT_SENTINEL,
  set: (value: string) => {
    form.fontFamily = value === FONT_DEFAULT_SENTINEL ? '' : value
  }
})

function getFontFamilyName(val: string) {
  if (val === FONT_DEFAULT_SENTINEL || !val) {
    return currentTheme.value.headingFont
  }
  return val
}

const useCustomFont = ref(false)

function toggleFontMode(isCustom: boolean) {
  useCustomFont.value = isCustom
  if (!isCustom) {
    form.customFontUrl = ''
    form.customFontFamily = ''
  }
}

const activeFontFamily = computed(() => {
  if (useCustomFont.value && form.customFontFamily) return form.customFontFamily
  return getFontFamilyName(fontSelectValue.value)
})

watch(() => form.customFontUrl, (newVal) => {
  if (newVal && newVal.includes('fonts.google.com/specimen/')) {
    try {
      const urlObj = new URL(newVal)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)
      const rawFontName = pathSegments[pathSegments.length - 1]

      if (rawFontName) {
        const cleanFontNameEncoded = rawFontName.split('?')[0]
        form.customFontUrl = `https://fonts.googleapis.com/css2?family=${cleanFontNameEncoded}&display=swap`
        if (!form.customFontFamily) {
          const fontNameDecoded = decodeURIComponent(cleanFontNameEncoded).replace(/\+/g, ' ')
          form.customFontFamily = `'${fontNameDecoded}', cursive`
        }
        toast.add({ title: 'Google Font auto-formatted!', color: 'success' })
      }
    } catch (e) {
      console.error(e)
    }
  }
})

// Injects the pasted Google Font stylesheet live, exactly the way the
// classic Design Studio does - so the phone preview on the right (which is
// the real VipCinematicInvite component) can actually render the custom
// font, not just store its name.
useHead({
  link: computed(() => {
    const links: Array<{ rel: string; href: string }> = []
    if (form.customFontUrl && !form.customFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: form.customFontUrl })
    }
    return links
  })
})

function resetColors() {
  form.customBgFrom = ''
  form.customBgTo = ''
  form.customAccent = ''
}

// Feeds the Live Preview panel: the couple's real wedding doc, with just the
// theme id and the design-related content fields this page owns swapped for
// whatever's in the form above right now (not necessarily saved yet) - same
// "real component, unsaved draft merged in" pattern as Your Scenes and
// Wedding Details' own previewWedding computeds.
const previewWedding = computed(() => {
  if (!wedding.value) return null
  return {
    ...wedding.value,
    themeId: selectedThemeId.value,
    content: {
      ...wedding.value.content,
      customBgFrom: form.customBgFrom,
      customBgTo: form.customBgTo,
      customAccent: form.customAccent,
      fontFamily: form.fontFamily,
      customFontUrl: form.customFontUrl,
      customFontFamily: form.customFontFamily,
      textWeight: form.textWeight,
      enablePetals: form.enablePetals,
      petalStyle: form.petalStyle
    }
  }
})

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  selectedThemeId.value = value.themeId

  form.customBgFrom = value.content.customBgFrom || ''
  form.customBgTo = value.content.customBgTo || ''
  form.customAccent = value.content.customAccent || ''
  form.fontFamily = value.content.fontFamily || ''
  form.customFontUrl = value.content.customFontUrl || ''
  form.customFontFamily = value.content.customFontFamily || ''
  form.textWeight = value.content.textWeight || '300'
  form.enablePetals = value.content.enablePetals !== false
  form.petalStyle = value.content.petalStyle || 'petals'

  if (form.customFontUrl || form.customFontFamily) {
    useCustomFont.value = true
  }
}, { immediate: true })

async function save() {
  await updateContent({ ...form })
  if (wedding.value && selectedThemeId.value !== wedding.value.themeId) {
    await updateTheme(selectedThemeId.value)
  }
  savedAt.value = Date.now()
  toast.add({ title: 'Design updated successfully', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'Design — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.theme-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 0.85rem;
  background: #1f2937;
  border: 1px solid #374151;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.theme-card:hover {
  background: #374151;
  border-color: rgba(212, 160, 23, 0.4);
  color: white;
}

.theme-card-active {
  background: rgba(212, 160, 23, 0.1);
  border-color: #e3b04a;
  color: #f3ddaa;
}

.theme-swatch {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  flex-shrink: 0;
}

.theme-swatch-accent {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 2px solid #111827;
}

.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.color-picker-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.color-picker-swatch {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid #374151;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, border-color 0.2s;
  overflow: hidden;
}

.color-picker-wrapper:hover .color-picker-swatch {
  transform: scale(1.1);
  border-color: #e3b04a;
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
