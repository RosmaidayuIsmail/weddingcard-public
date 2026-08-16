<template>
    <div>
      <!-- THEMES -->
      <div v-if="section === 'themes'" class="space-y-6 animate-fade-up">
        <div>
          <div v-if="customThemes.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-swatch" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
            </div>
            <p class="text-white/50 text-sm">No custom themes added yet.</p>
          </div>
          <div v-else class="grid sm:grid-cols-2 gap-3">
            <div v-for="theme in customThemes" :key="theme.id" class="catalog-card group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl shrink-0 border border-white/10 shadow-inner" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})` }"></div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium truncate">{{ theme.name }}</p>
                  <p class="text-xs text-white/40 truncate">{{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }} &middot; {{ theme.headingFont }}</p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditTheme(theme)" />
                  <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === theme.id" @click="removeTheme(theme.id)" />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon :name="editingThemeId ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">{{ editingThemeId ? `Editing "${themeForm.name || editingThemeId}"` : 'Add a new theme' }}</p>
            <button v-if="editingThemeId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditTheme">Cancel</button>
          </div>
  
          <div class="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="field-label">Theme name</label>
              <UInput v-model="themeForm.name" placeholder="e.g. Coastal Breeze" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Short tagline</label>
              <UInput v-model="themeForm.tagline" placeholder="e.g. Airy blues for a beachside wedding" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Price (RM, 0 = free)</label>
              <UInput v-model.number="themeForm.price" type="number" min="0" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Heading font</label>
              <USelect v-model="themeForm.headingFont" :items="fontSelectItems" size="lg" class="w-full" />
            </div>
          </div>
  
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            <div v-for="field in colorFields" :key="field.key">
              <label class="field-label">{{ field.label }}</label>
              <div class="flex items-center gap-2">
                <input v-model="themeForm[field.key]" type="color" class="w-9 h-9 rounded-lg border border-white/20 bg-transparent shrink-0 cursor-pointer" />
                <UInput v-model="themeForm[field.key]" size="sm" class="w-full" />
              </div>
            </div>
          </div>
  
          <div class="flex items-center gap-3 mt-5">
            <UButton color="primary" :icon="editingThemeId ? 'i-heroicons-check' : 'i-heroicons-plus'" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingTheme" :disabled="!canAddTheme" @click="submitTheme">
              {{ editingThemeId ? 'Save changes' : 'Add theme' }}
            </UButton>
            <p v-if="!canAddTheme" class="text-xs text-white/30">Give it a name to enable this button.</p>
          </div>
        </div>
  
        <details class="text-sm text-white/40">
          <summary class="cursor-pointer hover:text-white/60">Built-in themes ({{ themes.length }}, not editable here)</summary>
          <div class="mt-3 grid sm:grid-cols-2 gap-2">
            <div v-for="theme in themes" :key="theme.id" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <div class="w-5 h-5 rounded shrink-0" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})` }"></div>
              <span>{{ theme.name }}</span>
            </div>
          </div>
        </details>
      </div>
  
      <!-- FONTS -->
      <div v-if="section === 'fonts'" class="space-y-6 animate-fade-up">
        <div>
          <div v-if="customFonts.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-language" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
            </div>
            <p class="text-white/50 text-sm">No custom fonts added yet.</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="font in customFonts" :key="font.id" class="catalog-card group flex items-center justify-between">
              <div>
                <p class="font-medium">{{ font.label }}</p>
                <p class="text-xs text-white/40">{{ font.id }} &middot; {{ font.category }}</p>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditFont(font)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === font.id" @click="removeFont(font.id)" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon :name="editingFontId ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">{{ editingFontId ? `Editing "${fontForm.label || editingFontId}"` : 'Add a new font' }}</p>
            <button v-if="editingFontId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditFont">Cancel</button>
          </div>
  
          <div class="grid sm:grid-cols-3 gap-4 mt-4">
            <div class="sm:col-span-2">
              <label class="field-label">Google Font family name</label>
              <UInput v-model="fontForm.id" placeholder="e.g. Montserrat" size="lg" class="w-full" :disabled="!!editingFontId" />
            </div>
            <div>
              <label class="field-label">Category</label>
              <USelect v-model="fontForm.category" :items="['script', 'serif', 'sans']" size="lg" class="w-full" />
            </div>
          </div>
          <div class="mt-4">
            <label class="field-label">Display label</label>
            <UInput v-model="fontForm.label" placeholder="e.g. Montserrat (modern sans)" size="lg" class="w-full" />
          </div>
          <p class="text-xs text-white/40 mt-3">Loaded automatically via Google Fonts - make sure the family name is published there.</p>
          <div class="flex items-center gap-3 mt-4">
            <UButton color="primary" :icon="editingFontId ? 'i-heroicons-check' : 'i-heroicons-plus'" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingFont" :disabled="!canAddFont" @click="submitFont">
              {{ editingFontId ? 'Save changes' : 'Add font' }}
            </UButton>
            <p v-if="!canAddFont" class="text-xs text-white/30">Enter a font family name to enable this button.</p>
          </div>
        </div>
  
        <details class="text-sm text-white/40">
          <summary class="cursor-pointer hover:text-white/60">Built-in fonts ({{ fontOptions.length }}, not editable here)</summary>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="font in fontOptions" :key="font.id" class="px-2.5 py-1 rounded-full bg-white/[0.03] text-xs">{{ font.label }}</span>
          </div>
        </details>
      </div>
  
      <!-- TEXT PRESETS / LANGUAGES -->
      <div v-if="section === 'presets'" class="space-y-6 animate-fade-up">
        <div>
          <p class="text-sm text-white/50 mb-4">Use <code class="text-gold-300 bg-white/5 px-1.5 py-0.5 rounded">{guestName}</code> as a placeholder in the greeting.</p>
  
          <div v-if="customPresets.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-language" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
            </div>
            <p class="text-white/50 text-sm">No custom presets added yet.</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="preset in customPresets" :key="preset.id" class="catalog-card group">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium">{{ preset.label }}</p>
                  <p class="text-xs text-white/40 mt-1.5">Title: "{{ preset.openingTitle }}"</p>
                  <p class="text-xs text-white/40">Greeting: "{{ preset.openingGreeting }}"</p>
                  <p class="text-xs text-white/40">Action: "{{ preset.openingActionText }}"</p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditPreset(preset)" />
                  <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === preset.id" @click="removePreset(preset.id)" />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon :name="editingPresetId ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">{{ editingPresetId ? `Editing "${presetForm.label || editingPresetId}"` : 'Add a new preset / language' }}</p>
            <button v-if="editingPresetId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditPreset">Cancel</button>
          </div>
  
          <div class="space-y-4 mt-4">
            <div>
              <label class="field-label">Preset name</label>
              <UInput v-model="presetForm.label" placeholder="e.g. Indonesian" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Opening title</label>
              <UInput v-model="presetForm.openingTitle" placeholder="e.g. Walimatul Urus" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Greeting</label>
              <UInput v-model="presetForm.openingGreeting" placeholder="Use {guestName} as a placeholder" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Action text</label>
              <UInput v-model="presetForm.openingActionText" placeholder="e.g. Tap to open" size="lg" class="w-full" />
            </div>
          </div>
          <div class="flex items-center gap-3 mt-5">
            <UButton color="primary" :icon="editingPresetId ? 'i-heroicons-check' : 'i-heroicons-plus'" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingPreset" :disabled="!canAddPreset" @click="submitPreset">
              {{ editingPresetId ? 'Save changes' : 'Add preset' }}
            </UButton>
          </div>
        </div>
  
        <details class="text-sm text-white/40">
          <summary class="cursor-pointer hover:text-white/60">Built-in presets ({{ builtInTextPresets.length }}, not editable here)</summary>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="p in builtInTextPresets" :key="p.id" class="px-2.5 py-1 rounded-full bg-white/[0.03] text-xs">{{ p.label }}</span>
          </div>
        </details>
      </div>
  
      <!-- OPENING STYLES -->
      <div v-if="section === 'opening-styles'" class="space-y-6 animate-fade-up">
        <UAlert
          icon="i-heroicons-information-circle"
          color="info"
          variant="soft"
          title="These can be turned on/off, not authored"
          description="Each style is real animation code, not just data, so this list can't create a brand new one - but you can control exactly which of these couples are allowed to pick from."
        />
  
        <!-- This is documentation for editing the codebase, NOT a live form -
             nothing typed here runs anywhere. It exists so a developer (you,
             or whoever you hire) doesn't have to go dig up docs/adding-new-
             animations.md separately. -->
        <div class="dev-guide-card">
          <button type="button" class="dev-guide-toggle" @click="showDevGuide = !showDevGuide">
            <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-indigo-300" />
            <span class="font-semibold">How to add a brand new one (for developers)</span>
            <UIcon :name="showDevGuide ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4 ml-auto text-white/40" />
          </button>
  
          <div v-if="showDevGuide" class="px-5 pb-5 space-y-6">
            <p class="text-xs text-white/40 -mt-1">
              This edits the project's source code and needs a normal deploy to take effect - it isn't something you fill in here on the website. Full copy also lives at <code class="text-gold-300 bg-white/5 px-1 rounded">docs/adding-new-animations.md</code> in the repo.
            </p>
  
            <div>
              <p class="text-sm font-semibold text-gold-200 mb-3">Adding a new Opening Style animation</p>
              <div class="space-y-4">
                <div v-for="step in openingStyleSteps" :key="step.title">
                  <p class="text-sm font-medium text-white">{{ step.title }}</p>
                  <p v-if="step.file" class="text-xs font-mono text-indigo-300/80 mt-0.5">{{ step.file }}</p>
                  <p class="text-xs text-white/50 mt-1.5">{{ step.body }}</p>
                  <pre v-if="step.code" class="code-block">{{ step.code }}</pre>
                </div>
              </div>
            </div>
  
            <div>
              <p class="text-sm font-semibold text-gold-200 mb-3">Adding a new Falling Petals shape</p>
              <div class="space-y-4">
                <div v-for="step in petalSteps" :key="step.title">
                  <p class="text-sm font-medium text-white">{{ step.title }}</p>
                  <p class="text-xs font-mono text-indigo-300/80 mt-0.5">{{ step.file }}</p>
                  <p class="text-xs text-white/50 mt-1.5">{{ step.body }}</p>
                  <pre class="code-block">{{ step.code }}</pre>
                </div>
              </div>
              <p class="text-xs text-white/40 mt-3">It'll then appear automatically in both the couple's Design Studio picker and the Starter Defaults petal-style dropdown - both read from the same list.</p>
            </div>
  
            <p class="text-xs text-white/40">
              Same pattern applies to Names Layout Alignment and similar options elsewhere in Design Studio - each is CSS/layout logic, not data, so a new one means adding to the relevant options array plus a matching template branch.
            </p>
          </div>
        </div>
  
        <div class="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div class="space-y-2">
            <div v-for="style in openingStyleCatalog" :key="style.value" class="catalog-card flex items-center justify-between" :class="{ 'catalog-card-previewing': previewStyle === style.value }">
              <button type="button" class="flex items-center gap-3 min-w-0 text-left" @click="setPreviewStyle(style.value)">
                <div class="p-2 rounded-lg shrink-0" :class="isStyleEnabled(style.value) ? 'bg-gold-400/10' : 'bg-white/5'">
                  <UIcon :name="style.icon" class="w-4 h-4" :style="{ color: isStyleEnabled(style.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
                </div>
                <span class="font-medium truncate" :class="isStyleEnabled(style.value) ? 'text-white' : 'text-white/40'">{{ style.label }}</span>
                <UIcon v-if="previewStyle === style.value" name="i-heroicons-eye" class="w-4 h-4 text-gold-300 shrink-0" />
              </button>
              <USwitch :model-value="isStyleEnabled(style.value)" :loading="togglingStyle === style.value" @update:model-value="(v: boolean) => toggleStyle(style.value, v)" />
            </div>
          </div>
  
          <!-- Live preview: a DEMO card, never a real couple's wedding. Click
               any style on the left to load it here; tap the phone to see it
               open, same interaction a couple would have. -->
          <div class="lg:sticky lg:top-6">
            <div class="flex items-center justify-between mb-3 px-1">
              <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
              </p>
              <button type="button" class="text-xs text-white/40 hover:text-white/70" @click="previewOpened = false">Reset</button>
            </div>
            <div class="phone-bezel w-full max-w-[360px] mx-auto shadow-2xl">
              <div class="phone-notch"></div>
              <div class="phone-screen relative bg-[#04101f]" :style="previewStyleVars">
                <EnvelopeIntro v-model:opened="previewOpened" guest-name="Guest Name" :content="previewContent" />
                <div v-if="previewOpened" class="absolute inset-0 flex items-center justify-center text-white/50 text-sm italic px-6 text-center">
                  (This is where the couple's own details would appear)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Theme, FontOption, TextPreset } from '~/composables/useThemes'
  import type { WeddingContent } from '~/composables/useWeddingTypes'
  
  const props = defineProps<{ section: 'themes' | 'fonts' | 'presets' | 'opening-styles' }>()
  
  const toast = useToast()
  const {
    themes, fontOptions, builtInTextPresets,
    openingStyleCatalog, disabledOpeningStyles,
    allThemes, allFontOptions, allTextPresets,
    addCustomTheme, removeCustomTheme, addCustomFont, removeCustomFont, addTextPreset, removeTextPreset,
    setOpeningStyleEnabled, themeStyleVars
  } = useThemes()
  
  const removingId = ref('')
  
  // Anything in allThemes/allFontOptions/allTextPresets that ISN'T in the
  // built-in list must be a custom, admin-added one.
  const customThemes = computed(() => allThemes.value.filter((t) => !themes.some((b) => b.id === t.id)))
  const customFonts = computed(() => allFontOptions.value.filter((f) => !fontOptions.some((b) => b.id === f.id)))
  const customPresets = computed(() => allTextPresets.value.filter((p) => !builtInTextPresets.some((b) => b.id === p.id)))
  
  function slugify(text: string) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  
  const emptyThemeForm = () => ({ name: '', tagline: '', price: 0, headingFont: 'Great Vibes', bgFrom: '#04101f', bgVia: '#0b1c30', bgTo: '#142a45', accent: '#d4a017', ink: '#ffffff' })
  
  // --- Themes ---
  const fontSelectItems = computed(() => allFontOptions.value.map((f) => ({ label: f.label, value: f.id })))
  const colorFields: { key: 'bgFrom' | 'bgVia' | 'bgTo' | 'accent' | 'ink'; label: string }[] = [
    { key: 'bgFrom', label: 'Background start' },
    { key: 'bgVia', label: 'Background mid' },
    { key: 'bgTo', label: 'Background end' },
    { key: 'accent', label: 'Accent' },
    { key: 'ink', label: 'Text color' }
  ]
  const themeForm = ref(emptyThemeForm())
  const editingThemeId = ref<string | null>(null)
  const canAddTheme = computed(() => themeForm.value.name.trim().length > 0)
  const addingTheme = ref(false)
  
  function startEditTheme(theme: Theme) {
    editingThemeId.value = theme.id
    themeForm.value = {
      name: theme.name,
      tagline: theme.tagline,
      price: theme.price,
      headingFont: theme.headingFont,
      bgFrom: theme.palette.bgFrom,
      bgVia: theme.palette.bgVia,
      bgTo: theme.palette.bgTo,
      accent: theme.palette.accent,
      ink: theme.palette.ink
    }
  }
  function cancelEditTheme() {
    editingThemeId.value = null
    themeForm.value = emptyThemeForm()
  }
  
  async function submitTheme() {
    if (!canAddTheme.value) return
    addingTheme.value = true
    try {
      const id = editingThemeId.value || `custom-${slugify(themeForm.value.name)}` || `custom-${Date.now()}`
      const theme: Theme = {
        id,
        name: themeForm.value.name.trim(),
        tagline: themeForm.value.tagline.trim() || 'A custom theme',
        price: Number(themeForm.value.price) || 0,
        currency: 'RM',
        headingFont: themeForm.value.headingFont,
        palette: {
          bgFrom: themeForm.value.bgFrom,
          bgVia: themeForm.value.bgVia,
          bgTo: themeForm.value.bgTo,
          accent: themeForm.value.accent,
          accentSoft: hexToRgba(themeForm.value.accent, 0.18),
          ink: themeForm.value.ink,
          onAccent: themeForm.value.bgFrom
        }
      }
      await addCustomTheme(theme)
      toast.add({ title: editingThemeId.value ? `"${theme.name}" updated` : `"${theme.name}" added to the theme catalog`, color: 'success' })
      cancelEditTheme()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save theme', color: 'error' })
    } finally {
      addingTheme.value = false
    }
  }
  
  async function removeTheme(id: string) {
    removingId.value = id
    try {
      await removeCustomTheme(id)
      if (editingThemeId.value === id) cancelEditTheme()
      toast.add({ title: 'Theme removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove theme', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Fonts ---
  const emptyFontForm = () => ({ id: '', label: '', category: 'sans' as FontOption['category'] })
  const fontForm = ref(emptyFontForm())
  const editingFontId = ref<string | null>(null)
  const canAddFont = computed(() => fontForm.value.id.trim().length > 0)
  const addingFont = ref(false)
  
  function startEditFont(font: FontOption) {
    editingFontId.value = font.id
    fontForm.value = { id: font.id, label: font.label, category: font.category }
  }
  function cancelEditFont() {
    editingFontId.value = null
    fontForm.value = emptyFontForm()
  }
  
  async function submitFont() {
    if (!canAddFont.value) return
    addingFont.value = true
    try {
      const font: FontOption = {
        id: fontForm.value.id.trim(),
        label: fontForm.value.label.trim() || fontForm.value.id.trim(),
        category: fontForm.value.category
      }
      await addCustomFont(font)
      toast.add({ title: editingFontId.value ? `"${font.label}" updated` : `"${font.label}" added to the font catalog`, color: 'success' })
      cancelEditFont()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save font', color: 'error' })
    } finally {
      addingFont.value = false
    }
  }
  
  async function removeFont(id: string) {
    removingId.value = id
    try {
      await removeCustomFont(id)
      if (editingFontId.value === id) cancelEditFont()
      toast.add({ title: 'Font removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove font', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Text Presets ---
  const emptyPresetForm = () => ({ label: '', openingTitle: '', openingGreeting: '', openingActionText: '' })
  const presetForm = ref(emptyPresetForm())
  const editingPresetId = ref<string | null>(null)
  const canAddPreset = computed(() =>
    presetForm.value.label.trim() && presetForm.value.openingTitle.trim() && presetForm.value.openingGreeting.trim() && presetForm.value.openingActionText.trim()
  )
  const addingPreset = ref(false)
  
  function startEditPreset(preset: TextPreset) {
    editingPresetId.value = preset.id
    presetForm.value = {
      label: preset.label,
      openingTitle: preset.openingTitle,
      openingGreeting: preset.openingGreeting,
      openingActionText: preset.openingActionText
    }
  }
  function cancelEditPreset() {
    editingPresetId.value = null
    presetForm.value = emptyPresetForm()
  }
  
  async function submitPreset() {
    if (!canAddPreset.value) return
    addingPreset.value = true
    try {
      const preset: TextPreset = {
        id: editingPresetId.value || `custom-${slugify(presetForm.value.label)}` || `custom-${Date.now()}`,
        label: presetForm.value.label.trim(),
        openingTitle: presetForm.value.openingTitle.trim(),
        openingGreeting: presetForm.value.openingGreeting.trim(),
        openingActionText: presetForm.value.openingActionText.trim()
      }
      await addTextPreset(preset)
      toast.add({ title: editingPresetId.value ? `"${preset.label}" updated` : `"${preset.label}" preset added`, color: 'success' })
      cancelEditPreset()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save preset', color: 'error' })
    } finally {
      addingPreset.value = false
    }
  }
  
  async function removePreset(id: string) {
    removingId.value = id
    try {
      await removeTextPreset(id)
      if (editingPresetId.value === id) cancelEditPreset()
      toast.add({ title: 'Preset removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove preset', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Opening Styles ---
  const togglingStyle = ref('')
  function isStyleEnabled(value: string) {
    return !disabledOpeningStyles.value.includes(value)
  }
  async function toggleStyle(value: string, enabled: boolean) {
    togglingStyle.value = value
    try {
      await setOpeningStyleEnabled(value, enabled)
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not update that style', color: 'error' })
    } finally {
      togglingStyle.value = ''
    }
  }
  
  // Demo-only preview state - never a real couple's wedding. EnvelopeIntro
  // just needs enough of a WeddingContent shape to render; everything else
  // defaults sensibly since it's only ever read, never saved anywhere.
  const previewStyle = ref(openingStyleCatalog[0]?.value || 'classic')
  const previewOpened = ref(false)
  const previewContent = computed(() => ({
    brideName: 'Aisyah',
    groomName: 'Danial',
    openingStyle: previewStyle.value,
    openingBgUrl: '',
    openingTitle: "You're Invited",
    openingGreeting: 'Dear {guestName}',
    openingActionText: 'Tap to open'
  }) as WeddingContent)
  const previewStyleVars = computed(() => themeStyleVars('timeless-gold'))
  
  function setPreviewStyle(value: string) {
    previewStyle.value = value
    previewOpened.value = false
  }
  
  // Reference text shown in the "How to add a new one" panel below. Plain
  // strings rendered inside <pre> tags via {{ }} - Vue escapes these
  // automatically, so code like "<div v-if=...>" displays as literal text
  // instead of being parsed as real template markup.
  const showDevGuide = ref(false)
  const openingStyleSteps = [
    {
      title: '1. Register it in the shared catalog',
      file: 'app/composables/useThemes.ts',
      body: "Add one entry to openingStyleCatalog:",
      code: `export const openingStyleCatalog: OpeningStyle[] = [
    { label: 'Classic Envelope', value: 'classic', icon: 'i-heroicons-envelope' },
    // ...existing entries...
    { label: 'Confetti Burst', value: 'confetti-burst', icon: 'i-heroicons-sparkles' }, // <- new
  ]`
    },
    {
      title: '2. Add the background/animation markup',
      file: 'app/components/EnvelopeIntro.vue',
      body: "Find the v-if/v-else-if chain for the background layer (search for content.openingStyle === 'wax-seal') and add a new branch:",
      code: `<div v-else-if="content.openingStyle === 'confetti-burst'" class="absolute inset-0 z-0 confetti-burst-bg">
    <!-- your markup -->
  </div>`
    },
    {
      title: '3. Add the transition CSS',
      file: 'app/components/EnvelopeIntro.vue',
      body: "Inside <style scoped>. Copy the pattern from the Wax Seal implementation (search for wax-seal-shake, wax-crack-flash) - it shows how to sequence a multi-stage animation using CSS keyframes and transition-delay.",
      code: `.confetti-burst-leave-active {
    transition: opacity 0.4s ease, transform 0.6s ease;
  }`
    },
    {
      title: '4. Test it',
      file: null,
      body: 'Run the dev server, open Design Studio / Opening Design, pick the new style from the Cover Layout Style grid, and click the phone preview to open it. It will also now appear automatically in this Opening Styles toggle list above.',
      code: ''
    }
  ]
  const petalSteps = [
    {
      title: '1. Add the shape',
      file: 'app/components/PetalsBackground.vue',
      body: "Add a v-else-if branch for your styleName alongside the existing 'confetti' / 'hearts' / 'sparkles' ones. The falling motion (speed, drift, rotation) is already generic - you only supply the shape:",
      code: `<svg v-else-if="styleName === 'stars'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- your shape -->
  </svg>`
    },
    {
      title: '2. Add it to the picker',
      file: 'app/pages/dashboard/editor.vue',
      body: 'Add one entry to petalStyleOptions:',
      code: `const petalStyleOptions = [
    // ...existing entries...
    { label: 'Stars', value: 'stars', icon: 'i-heroicons-star' },
  ]`
    }
  ]
  
  // Reset any in-progress edit when switching sections via the sidebar.
  watch(() => props.section, () => {
    cancelEditTheme()
    cancelEditFont()
    cancelEditPreset()
  })
  </script>
  
  <style scoped>
  .catalog-card {
    border-radius: 1rem;
    padding: 1rem 1.1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  
  .catalog-card:hover {
    border-color: rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.035);
  }
  
  .form-card {
    border-radius: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  
  .field-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0.4rem;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2.5rem 1rem;
    border-radius: 1rem;
    border: 1px dashed rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.015);
  }
  
  .catalog-card-previewing {
    border-color: rgba(212, 160, 23, 0.4);
    background: rgba(212, 160, 23, 0.06);
  }
  
  .phone-bezel {
    position: relative;
    height: 640px;
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
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .dev-guide-card {
    border-radius: 1rem;
    border: 1px solid rgba(99, 102, 241, 0.2);
    background: rgba(99, 102, 241, 0.04);
    overflow: hidden;
  }
  
  .dev-guide-toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    transition: background 0.2s ease;
  }
  
  .dev-guide-toggle:hover {
    background: rgba(99, 102, 241, 0.06);
  }
  
  .code-block {
    margin-top: 0.6rem;
    padding: 0.85rem 1rem;
    border-radius: 0.65rem;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.75rem;
    line-height: 1.6;
    color: #d4e0ff;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
  }
  </style>