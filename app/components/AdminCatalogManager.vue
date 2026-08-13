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
  
        <div class="space-y-2">
          <div v-for="style in openingStyleCatalog" :key="style.value" class="catalog-card flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg" :class="isStyleEnabled(style.value) ? 'bg-gold-400/10' : 'bg-white/5'">
                <UIcon :name="style.icon" class="w-4 h-4" :style="{ color: isStyleEnabled(style.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
              </div>
              <p class="font-medium" :class="isStyleEnabled(style.value) ? 'text-white' : 'text-white/40'">{{ style.label }}</p>
            </div>
            <USwitch :model-value="isStyleEnabled(style.value)" :loading="togglingStyle === style.value" @update:model-value="(v: boolean) => toggleStyle(style.value, v)" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Theme, FontOption, TextPreset } from '~/composables/useThemes'
  
  const props = defineProps<{ section: 'themes' | 'fonts' | 'presets' | 'opening-styles' }>()
  
  const toast = useToast()
  const {
    themes, fontOptions, builtInTextPresets,
    openingStyleCatalog, disabledOpeningStyles,
    allThemes, allFontOptions, allTextPresets,
    addCustomTheme, removeCustomTheme, addCustomFont, removeCustomFont, addTextPreset, removeTextPreset,
    setOpeningStyleEnabled
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
  </style>