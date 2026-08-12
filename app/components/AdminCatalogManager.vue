<template>
    <div class="space-y-8">
      <div class="flex gap-2 flex-wrap">
        <button v-for="s in sections" :key="s.id" type="button" class="section-btn" :class="{ 'section-btn-active': section === s.id }" @click="section = s.id">
          <UIcon :name="s.icon" class="w-4 h-4" /> {{ s.label }}
        </button>
      </div>
  
      <!-- THEMES -->
      <div v-if="section === 'themes'" class="space-y-6 animate-fade-up">
        <div>
          <h2 class="font-display text-xl font-semibold text-gold-100">Custom themes</h2>
          <p class="text-sm text-white/50 mt-1 mb-4">These appear alongside the built-in themes in every couple's Design Studio theme picker.</p>
  
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
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity" :loading="removingId === theme.id" @click="removeTheme(theme.id)" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon name="i-heroicons-plus" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">Add a new theme</p>
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
            <UButton color="primary" icon="i-heroicons-plus" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingTheme" :disabled="!canAddTheme" @click="submitTheme">
              Add theme
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
          <h2 class="font-display text-xl font-semibold text-gold-100">Custom fonts</h2>
          <p class="text-sm text-white/50 mt-1 mb-4">Added fonts appear in every font picker (names, titles, monograms). Use the exact Google Fonts family name as the ID so it can be loaded.</p>
  
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
              <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity" :loading="removingId === font.id" @click="removeFont(font.id)" />
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon name="i-heroicons-plus" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">Add a new font</p>
          </div>
  
          <div class="grid sm:grid-cols-3 gap-4 mt-4">
            <div class="sm:col-span-2">
              <label class="field-label">Google Font family name</label>
              <UInput v-model="fontForm.id" placeholder="e.g. Montserrat" size="lg" class="w-full" />
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
            <UButton color="primary" icon="i-heroicons-plus" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingFont" :disabled="!canAddFont" @click="submitFont">
              Add font
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
  
      <!-- TEXT PRESETS -->
      <div v-if="section === 'presets'" class="space-y-6 animate-fade-up">
        <div>
          <h2 class="font-display text-xl font-semibold text-gold-100">Text presets</h2>
          <p class="text-sm text-white/50 mt-1 mb-4">One-click Opening Design text presets, shown as buttons on every couple's Opening Design page. Use <code class="text-gold-300 bg-white/5 px-1.5 py-0.5 rounded">{guestName}</code> as a placeholder in the greeting.</p>
  
          <div v-if="customPresets.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-pencil-square" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
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
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" :loading="removingId === preset.id" @click="removePreset(preset.id)" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon name="i-heroicons-plus" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">Add a new preset</p>
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
            <UButton color="primary" icon="i-heroicons-plus" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingPreset" :disabled="!canAddPreset" @click="submitPreset">
              Add preset
            </UButton>
            <p v-if="!canAddPreset" class="text-xs text-white/30">Fill in all four fields to enable this button.</p>
          </div>
        </div>
  
        <details class="text-sm text-white/40">
          <summary class="cursor-pointer hover:text-white/60">Built-in presets ({{ builtInTextPresets.length }}, not editable here)</summary>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="p in builtInTextPresets" :key="p.id" class="px-2.5 py-1 rounded-full bg-white/[0.03] text-xs">{{ p.label }}</span>
          </div>
        </details>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Theme, FontOption, TextPreset } from '~/composables/useThemes'
  
  const toast = useToast()
  const {
    themes, fontOptions, builtInTextPresets,
    allThemes, allFontOptions, allTextPresets,
    addCustomTheme, removeCustomTheme, addCustomFont, removeCustomFont, addTextPreset, removeTextPreset
  } = useThemes()
  
  const sections = [
    { id: 'themes' as const, label: 'Themes', icon: 'i-heroicons-swatch' },
    { id: 'fonts' as const, label: 'Fonts', icon: 'i-heroicons-language' },
    { id: 'presets' as const, label: 'Text Presets', icon: 'i-heroicons-pencil-square' }
  ]
  const section = ref<'themes' | 'fonts' | 'presets'>('themes')
  
  const removingId = ref('')
  
  // Anything in allThemes/allFontOptions/allTextPresets that ISN'T in the
  // built-in list must be a custom, admin-added one.
  const customThemes = computed(() => allThemes.value.filter((t) => !themes.some((b) => b.id === t.id)))
  const customFonts = computed(() => allFontOptions.value.filter((f) => !fontOptions.some((b) => b.id === f.id)))
  const customPresets = computed(() => allTextPresets.value.filter((p) => !builtInTextPresets.some((b) => b.id === p.id)))
  
  function slugify(text: string) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  
  // --- Themes ---
  const fontSelectItems = computed(() => allFontOptions.value.map((f) => ({ label: f.label, value: f.id })))
  const colorFields: { key: 'bgFrom' | 'bgVia' | 'bgTo' | 'accent' | 'ink'; label: string }[] = [
    { key: 'bgFrom', label: 'Background start' },
    { key: 'bgVia', label: 'Background mid' },
    { key: 'bgTo', label: 'Background end' },
    { key: 'accent', label: 'Accent' },
    { key: 'ink', label: 'Text color' }
  ]
  const themeForm = ref({
    name: '',
    tagline: '',
    price: 0,
    headingFont: 'Great Vibes',
    bgFrom: '#04101f',
    bgVia: '#0b1c30',
    bgTo: '#142a45',
    accent: '#d4a017',
    ink: '#ffffff'
  })
  const canAddTheme = computed(() => themeForm.value.name.trim().length > 0)
  const addingTheme = ref(false)
  
  async function submitTheme() {
    if (!canAddTheme.value) return
    addingTheme.value = true
    try {
      const id = `custom-${slugify(themeForm.value.name)}` || `custom-${Date.now()}`
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
      toast.add({ title: `"${theme.name}" added to the theme catalog`, color: 'success' })
      themeForm.value = { name: '', tagline: '', price: 0, headingFont: 'Great Vibes', bgFrom: '#04101f', bgVia: '#0b1c30', bgTo: '#142a45', accent: '#d4a017', ink: '#ffffff' }
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not add theme', color: 'error' })
    } finally {
      addingTheme.value = false
    }
  }
  
  async function removeTheme(id: string) {
    removingId.value = id
    try {
      await removeCustomTheme(id)
      toast.add({ title: 'Theme removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove theme', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Fonts ---
  const fontForm = ref({ id: '', label: '', category: 'sans' as FontOption['category'] })
  const canAddFont = computed(() => fontForm.value.id.trim().length > 0)
  const addingFont = ref(false)
  
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
      toast.add({ title: `"${font.label}" added to the font catalog`, color: 'success' })
      fontForm.value = { id: '', label: '', category: 'sans' }
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not add font', color: 'error' })
    } finally {
      addingFont.value = false
    }
  }
  
  async function removeFont(id: string) {
    removingId.value = id
    try {
      await removeCustomFont(id)
      toast.add({ title: 'Font removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove font', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Text Presets ---
  const presetForm = ref({ label: '', openingTitle: '', openingGreeting: '', openingActionText: '' })
  const canAddPreset = computed(() =>
    presetForm.value.label.trim() && presetForm.value.openingTitle.trim() && presetForm.value.openingGreeting.trim() && presetForm.value.openingActionText.trim()
  )
  const addingPreset = ref(false)
  
  async function submitPreset() {
    if (!canAddPreset.value) return
    addingPreset.value = true
    try {
      const preset: TextPreset = {
        id: `custom-${slugify(presetForm.value.label)}` || `custom-${Date.now()}`,
        label: presetForm.value.label.trim(),
        openingTitle: presetForm.value.openingTitle.trim(),
        openingGreeting: presetForm.value.openingGreeting.trim(),
        openingActionText: presetForm.value.openingActionText.trim()
      }
      await addTextPreset(preset)
      toast.add({ title: `"${preset.label}" preset added`, color: 'success' })
      presetForm.value = { label: '', openingTitle: '', openingGreeting: '', openingActionText: '' }
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not add preset', color: 'error' })
    } finally {
      addingPreset.value = false
    }
  }
  
  async function removePreset(id: string) {
    removingId.value = id
    try {
      await removeTextPreset(id)
      toast.add({ title: 'Preset removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove preset', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  </script>
  
  <style scoped>
  .section-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.1rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .section-btn:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  .section-btn-active {
    color: #1f1400;
    background: linear-gradient(135deg, #f3ddaa, #d4a017);
    border-color: #d4a017;
    box-shadow: 0 4px 14px -4px rgba(212, 160, 23, 0.4);
  }
  
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
    transform: translateY(-1px);
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