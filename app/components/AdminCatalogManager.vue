<template>
    <div class="space-y-8">
      <div class="flex gap-2">
        <button v-for="s in sections" :key="s.id" type="button" class="section-btn" :class="{ 'section-btn-active': section === s.id }" @click="section = s.id">
          {{ s.label }}
        </button>
      </div>
  
      <!-- THEMES -->
      <div v-if="section === 'themes'" class="space-y-6">
        <div>
          <h2 class="font-display text-lg mb-1">Custom themes</h2>
          <p class="text-sm text-white/50 mb-4">These appear alongside the built-in themes in every couple's Design Studio theme picker.</p>
  
          <div v-if="customThemes.length === 0" class="text-sm text-white/40 py-4">No custom themes added yet.</div>
          <div v-else class="grid sm:grid-cols-2 gap-3">
            <div v-for="theme in customThemes" :key="theme.id" class="catalog-card">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg shrink-0 border border-white/10" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})` }"></div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium truncate">{{ theme.name }}</p>
                  <p class="text-xs text-white/40 truncate">{{ theme.id }} &middot; {{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }}</p>
                </div>
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === theme.id" @click="removeTheme(theme.id)" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
          <p class="text-sm font-semibold">Add a new theme</p>
          <div class="grid sm:grid-cols-2 gap-3">
            <UInput v-model="themeForm.name" placeholder="Theme name" />
            <UInput v-model="themeForm.tagline" placeholder="Short tagline" />
            <UInput v-model.number="themeForm.price" type="number" min="0" placeholder="Price (RM, 0 = free)" />
            <USelect v-model="themeForm.headingFont" :items="fontSelectItems" placeholder="Heading font" />
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div v-for="field in colorFields" :key="field.key">
              <label class="text-xs text-white/50 block mb-1">{{ field.label }}</label>
              <div class="flex items-center gap-2">
                <input v-model="themeForm[field.key]" type="color" class="w-8 h-8 rounded border border-white/20 bg-transparent shrink-0" />
                <UInput v-model="themeForm[field.key]" size="sm" class="w-full" />
              </div>
            </div>
          </div>
          <UButton color="primary" icon="i-heroicons-plus" :loading="addingTheme" :disabled="!canAddTheme" @click="submitTheme">
            Add theme
          </UButton>
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
      <div v-if="section === 'fonts'" class="space-y-6">
        <div>
          <h2 class="font-display text-lg mb-1">Custom fonts</h2>
          <p class="text-sm text-white/50 mb-4">Added fonts appear in every font picker (names, titles, monograms). Use the exact Google Fonts family name as the ID so it can be loaded.</p>
  
          <div v-if="customFonts.length === 0" class="text-sm text-white/40 py-4">No custom fonts added yet.</div>
          <div v-else class="space-y-2">
            <div v-for="font in customFonts" :key="font.id" class="catalog-card flex items-center justify-between">
              <div>
                <p class="font-medium">{{ font.label }}</p>
                <p class="text-xs text-white/40">{{ font.id }} &middot; {{ font.category }}</p>
              </div>
              <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === font.id" @click="removeFont(font.id)" />
            </div>
          </div>
        </div>
  
        <div class="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
          <p class="text-sm font-semibold">Add a new font</p>
          <div class="grid sm:grid-cols-3 gap-3">
            <UInput v-model="fontForm.id" placeholder="Google Font family name (e.g. Montserrat)" class="sm:col-span-2" />
            <USelect v-model="fontForm.category" :items="['script', 'serif', 'sans']" placeholder="Category" />
          </div>
          <UInput v-model="fontForm.label" placeholder="Display label (e.g. Montserrat (modern sans))" />
          <p class="text-xs text-white/40">Loaded automatically via Google Fonts - make sure the family name is published there.</p>
          <UButton color="primary" icon="i-heroicons-plus" :loading="addingFont" :disabled="!canAddFont" @click="submitFont">
            Add font
          </UButton>
        </div>
  
        <details class="text-sm text-white/40">
          <summary class="cursor-pointer hover:text-white/60">Built-in fonts ({{ fontOptions.length }}, not editable here)</summary>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="font in fontOptions" :key="font.id" class="px-2.5 py-1 rounded-full bg-white/[0.03] text-xs">{{ font.label }}</span>
          </div>
        </details>
      </div>
  
      <!-- TEXT PRESETS -->
      <div v-if="section === 'presets'" class="space-y-6">
        <div>
          <h2 class="font-display text-lg mb-1">Text presets</h2>
          <p class="text-sm text-white/50 mb-4">One-click Opening Design text presets, shown as buttons on every couple's Opening Design page. Use <code class="text-gold-300">{guestName}</code> as a placeholder in the greeting.</p>
  
          <div v-if="customPresets.length === 0" class="text-sm text-white/40 py-4">No custom presets added yet.</div>
          <div v-else class="space-y-2">
            <div v-for="preset in customPresets" :key="preset.id" class="catalog-card">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium">{{ preset.label }}</p>
                  <p class="text-xs text-white/40 mt-1">Title: "{{ preset.openingTitle }}"</p>
                  <p class="text-xs text-white/40">Greeting: "{{ preset.openingGreeting }}"</p>
                  <p class="text-xs text-white/40">Action: "{{ preset.openingActionText }}"</p>
                </div>
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === preset.id" @click="removePreset(preset.id)" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
          <p class="text-sm font-semibold">Add a new preset</p>
          <UInput v-model="presetForm.label" placeholder="Preset name (e.g. Indonesian)" />
          <UInput v-model="presetForm.openingTitle" placeholder="Opening title (e.g. Walimatul Urus)" />
          <UInput v-model="presetForm.openingGreeting" placeholder="Greeting - use {guestName} as a placeholder" />
          <UInput v-model="presetForm.openingActionText" placeholder="Action text (e.g. Tap to open)" />
          <UButton color="primary" icon="i-heroicons-plus" :loading="addingPreset" :disabled="!canAddPreset" @click="submitPreset">
            Add preset
          </UButton>
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
    themes, fontOptions, builtInTextPresets: builtIns,
    allThemes, allFontOptions, allTextPresets,
    addCustomTheme, removeCustomTheme, addCustomFont, removeCustomFont, addTextPreset, removeTextPreset
  } = useThemes()
  const builtInTextPresets = builtIns
  
  const sections = [
    { id: 'themes' as const, label: 'Themes' },
    { id: 'fonts' as const, label: 'Fonts' },
    { id: 'presets' as const, label: 'Text Presets' }
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
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.2s ease;
  }
  
  .section-btn:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
  }
  
  .section-btn-active {
    color: #1f1400;
    background: #d4a017;
    border-color: #d4a017;
  }
  
  .catalog-card {
    border-radius: 0.85rem;
    padding: 0.9rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  </style>