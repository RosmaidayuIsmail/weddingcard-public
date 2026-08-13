export interface ThemePalette {
  bgFrom: string
  bgVia: string
  bgTo: string
  accent: string
  accentSoft: string
  ink: string
  onAccent: string
}

export interface StarterFlowItem {
  time: string
  title: string
  description: string
}

// The "shared template" every NEW wedding starts from - not any existing
// couple's own data. Admin changes here only affect weddings created AFTER
// the change; nothing already-created is touched.
export interface StarterDefaults {
  story: string
  enablePetals: boolean
  petalStyle: string
  ornamentStyle: string
  textWeight: string
  btnDetails: string
  btnRsvp: string
  flow: StarterFlowItem[]
}

export const defaultStarterDefaults: StarterDefaults = {
  story: 'With humble hearts, we joyfully invite you to celebrate our wedding with us.',
  enablePetals: true,
  petalStyle: 'petals',
  ornamentStyle: 'none',
  textWeight: '300',
  btnDetails: 'View Details',
  btnRsvp: 'RSVP Now',
  flow: []
}

export interface Theme {
  id: string
  name: string
  tagline: string
  price: number
  currency: 'RM'
  headingFont: string
  palette: ThemePalette
}

export interface FontOption {
  id: string
  label: string
  category: 'script' | 'serif' | 'sans'
}

export const fontOptions: FontOption[] = [
  { id: 'Great Vibes', label: 'Great Vibes (elegant script)', category: 'script' },
  { id: 'Dancing Script', label: 'Dancing Script (flowing script)', category: 'script' },
  { id: 'Allura', label: 'Allura (delicate script)', category: 'script' },
  { id: 'Parisienne', label: 'Parisienne (romantic script)', category: 'script' },
  { id: 'Tangerine', label: 'Tangerine (fine calligraphy)', category: 'script' },
  { id: 'Playfair Display', label: 'Playfair Display (classic serif)', category: 'serif' },
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond (refined serif)', category: 'serif' },
  { id: 'Cinzel', label: 'Cinzel (engraved serif)', category: 'serif' },
  { id: 'Marcellus', label: 'Marcellus (modern serif)', category: 'serif' },
  { id: 'Amiri', label: 'Amiri (traditional serif)', category: 'serif' },
  { id: 'Poppins', label: 'Poppins (clean sans-serif)', category: 'sans' }
]

export const DEFAULT_FONT = 'Great Vibes'

export const themes: Theme[] = [
  {
    id: 'timeless-gold',
    name: 'Timeless Gold',
    tagline: 'Midnight navy with champagne gold — the original',
    price: 0,
    currency: 'RM',
    headingFont: 'Great Vibes',
    palette: {
      bgFrom: '#04101f',
      bgVia: '#0b1c30',
      bgTo: '#142a45',
      accent: '#d4a017',
      accentSoft: 'rgba(212, 160, 23, 0.18)',
      ink: '#ffffff',
      onAccent: '#1f1400'
    }
  },
  {
    id: 'ivory-minimalist',
    name: 'Ivory Minimalist',
    tagline: 'Clean cream and charcoal for a modern, understated look',
    price: 0,
    currency: 'RM',
    headingFont: 'Marcellus',
    palette: {
      bgFrom: '#faf6ee',
      bgVia: '#f2ead9',
      bgTo: '#e8dcc4',
      accent: '#8a6d3b',
      accentSoft: 'rgba(138, 109, 59, 0.14)',
      ink: '#2a2420',
      onAccent: '#faf6ee'
    }
  },
  {
    id: 'nusantara-elegance',
    name: 'Nusantara Elegance',
    tagline: 'Deep emerald and rich bronze inspired by traditional heritage',
    price: 0,
    currency: 'RM',
    headingFont: 'Amiri',
    palette: {
      bgFrom: '#061a14',
      bgVia: '#0d2b22',
      bgTo: '#133d31',
      accent: '#cd7f32',
      accentSoft: 'rgba(205, 127, 50, 0.18)',
      ink: '#fdfbf7',
      onAccent: '#061a14'
    }
  },
  {
    id: 'blush-botanical',
    name: 'Blush Botanical',
    tagline: 'Soft blush and sage for a romantic, floral feel',
    price: 29,
    currency: 'RM',
    headingFont: 'Parisienne',
    palette: {
      bgFrom: '#3c2a30',
      bgVia: '#55343b',
      bgTo: '#6b4550',
      accent: '#e8b4bc',
      accentSoft: 'rgba(232, 180, 188, 0.18)',
      ink: '#fbeff1',
      onAccent: '#3c1620'
    }
  },
  {
    id: 'velvet-romance',
    name: 'Velvet Romance',
    tagline: 'Deep burgundy and rose gold for a striking, intimate mood',
    price: 29,
    currency: 'RM',
    headingFont: 'Playfair Display',
    palette: {
      bgFrom: '#1f040a',
      bgVia: '#330814',
      bgTo: '#4a0b1d',
      accent: '#b76e79',
      accentSoft: 'rgba(183, 110, 121, 0.18)',
      ink: '#fff0f3',
      onAccent: '#1f040a'
    }
  },
  {
    id: 'royal-emerald',
    name: 'Royal Emerald',
    tagline: 'Deep emerald and gold for a luxurious statement',
    price: 49,
    currency: 'RM',
    headingFont: 'Cinzel',
    palette: {
      bgFrom: '#04140f',
      bgVia: '#0a2b1f',
      bgTo: '#123d2c',
      accent: '#c9a227',
      accentSoft: 'rgba(201, 162, 39, 0.18)',
      ink: '#f2f7f2',
      onAccent: '#0a2b1f'
    }
  },
  {
    id: 'lavender-dusk',
    name: 'Lavender Dusk',
    tagline: 'Deep plum and soft lilac for a dreamy, romantic evening',
    price: 29,
    currency: 'RM',
    headingFont: 'Allura',
    palette: {
      bgFrom: '#170a29',
      bgVia: '#2b1350',
      bgTo: '#3d1e6b',
      accent: '#c9a7eb',
      accentSoft: 'rgba(201, 167, 235, 0.18)',
      ink: '#f6f0fb',
      onAccent: '#170a29'
    }
  },
  {
    id: 'sky-serenade',
    name: 'Sky Serenade',
    tagline: 'Soft powder blue and cream for a light, airy feel',
    price: 0,
    currency: 'RM',
    headingFont: 'Cormorant Garamond',
    palette: {
      bgFrom: '#eef5fb',
      bgVia: '#dbe9f5',
      bgTo: '#c5daeb',
      accent: '#3b7ba3',
      accentSoft: 'rgba(59, 123, 163, 0.14)',
      ink: '#1e3a4c',
      onAccent: '#eef5fb'
    }
  }
]

export const DEFAULT_THEME_ID = 'timeless-gold'

export interface ColorOverrides {
  bgFrom?: string
  bgTo?: string
  accent?: string
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return `rgba(212, 160, 23, ${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface TextPreset {
  id: string
  label: string
  openingTitle: string
  openingGreeting: string
  openingActionText: string
}

// The two presets that already existed as hardcoded buttons on the Opening
// Design page - kept as permanent built-ins alongside anything admins add.
export const builtInTextPresets: TextPreset[] = [
  { id: 'en', label: 'English', openingTitle: "You're Invited", openingGreeting: 'Dear {guestName}', openingActionText: 'Tap to open' },
  { id: 'ms', label: 'Bahasa Melayu', openingTitle: 'Walimatul Urus', openingGreeting: 'Menjemput {guestName} sekeluarga', openingActionText: 'Klik untuk buka' }
]

interface PlatformCatalog {
  themes: Theme[]
  fonts: FontOption[]
  textPresets: TextPreset[]
  disabledOpeningStyles: string[]
  starterDefaults: StarterDefaults
}

export interface OpeningStyle {
  value: string
  label: string
  icon: string
}

// The full set of opening-style animations that exist in code (each one is
// real CSS/animation logic in EnvelopeIntro.vue, not just data) - admins
// can't invent new ones here, but they CAN choose which of these couples
// are allowed to pick from. Kept here as the one shared source of truth so
// the admin toggle list and the dashboard's picker can never drift apart.
export const openingStyleCatalog: OpeningStyle[] = [
  { label: 'Classic Envelope', value: 'classic', icon: 'i-heroicons-envelope' },
  { label: 'Wax Seal', value: 'wax-seal', icon: 'i-heroicons-check-badge' },
  { label: 'Modern Dark', value: 'modern-dark', icon: 'i-heroicons-moon' },
  { label: 'Minimal Light', value: 'minimal-light', icon: 'i-heroicons-sun' },
  { label: 'Canva (Fade)', value: 'custom', icon: 'i-heroicons-photo' },
  { label: 'Canva (Split Door)', value: 'custom-split', icon: 'i-heroicons-arrows-right-left' },
  { label: 'Slide Up', value: 'slide-up', icon: 'i-heroicons-arrow-up' },
  { label: 'Slide Down', value: 'slide-down', icon: 'i-heroicons-arrow-down' },
  { label: 'Slide Left', value: 'slide-left', icon: 'i-heroicons-arrow-left' },
  { label: 'Slide Right', value: 'slide-right', icon: 'i-heroicons-arrow-right' },
  { label: 'Confetti Burst', value: 'confetti-burst', icon: 'i-heroicons-sparkles' },
]

export function useThemes() {
  const { db, isConfigured } = useFirebase()

  // Shared across every component that calls useThemes() in this session,
  // so the catalog is only fetched from Firestore once, not once per call.
  const customThemes = useState<Theme[]>('catalog-themes', () => [])
  const customFonts = useState<FontOption[]>('catalog-fonts', () => [])
  const customTextPresets = useState<TextPreset[]>('catalog-text-presets', () => [])
  const disabledOpeningStyles = useState<string[]>('catalog-disabled-opening-styles', () => [])
  const starterDefaults = useState<StarterDefaults>('catalog-starter-defaults', () => ({ ...defaultStarterDefaults }))
  const catalogFetched = useState('catalog-fetched', () => false)

  async function ensureCatalogLoaded() {
    if (catalogFetched.value || !isConfigured || !db) return
    catalogFetched.value = true
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snap = await getDoc(doc(db, 'platformCatalog', 'catalog'))
      if (snap.exists()) {
        const data = snap.data() as Partial<PlatformCatalog>
        customThemes.value = Array.isArray(data.themes) ? data.themes : []
        customFonts.value = Array.isArray(data.fonts) ? data.fonts : []
        customTextPresets.value = Array.isArray(data.textPresets) ? data.textPresets : []
        disabledOpeningStyles.value = Array.isArray(data.disabledOpeningStyles) ? data.disabledOpeningStyles : []
        starterDefaults.value = data.starterDefaults ? { ...defaultStarterDefaults, ...data.starterDefaults } : { ...defaultStarterDefaults }
      }
    } catch (error) {
      // Non-fatal: the app still works fine with just the built-in catalog.
      console.error('Could not load platform catalog', error)
    }
  }

  if (import.meta.client) ensureCatalogLoaded()

  async function saveCatalogField<K extends keyof PlatformCatalog>(field: K, value: PlatformCatalog[K]) {
    if (!db) throw new Error('Firebase is not configured')
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'platformCatalog', 'catalog'), { [field]: value }, { merge: true })
  }

  // Add AND edit both go through this one function: since it replaces any
  // existing entry with the same id before adding the new version, calling
  // it again with an existing id (and changed fields) is how an edit works.
  async function addCustomTheme(theme: Theme) {
    const next = [...customThemes.value.filter((t) => t.id !== theme.id), theme]
    await saveCatalogField('themes', next)
    customThemes.value = next
  }
  async function removeCustomTheme(themeId: string) {
    const next = customThemes.value.filter((t) => t.id !== themeId)
    await saveCatalogField('themes', next)
    customThemes.value = next
  }

  async function addCustomFont(font: FontOption) {
    const next = [...customFonts.value.filter((f) => f.id !== font.id), font]
    await saveCatalogField('fonts', next)
    customFonts.value = next
  }
  async function removeCustomFont(fontId: string) {
    const next = customFonts.value.filter((f) => f.id !== fontId)
    await saveCatalogField('fonts', next)
    customFonts.value = next
  }

  async function addTextPreset(preset: TextPreset) {
    const next = [...customTextPresets.value.filter((p) => p.id !== preset.id), preset]
    await saveCatalogField('textPresets', next)
    customTextPresets.value = next
  }
  async function removeTextPreset(presetId: string) {
    const next = customTextPresets.value.filter((p) => p.id !== presetId)
    await saveCatalogField('textPresets', next)
    customTextPresets.value = next
  }

  async function setOpeningStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledOpeningStyles.value.filter((v) => v !== styleValue)
      : [...disabledOpeningStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledOpeningStyles', next)
    disabledOpeningStyles.value = next
  }

  async function saveStarterDefaults(next: StarterDefaults) {
    await saveCatalogField('starterDefaults', next)
    starterDefaults.value = next
  }

  // What couples should actually see in the Opening Design picker - the
  // built-in catalog minus whatever admin has turned off.
  const enabledOpeningStyles = computed(() => openingStyleCatalog.filter((s) => !disabledOpeningStyles.value.includes(s.value)))

  // The full, "what should actually render" lists - built-ins plus whatever
  // admins have added. Every existing call site that destructures the plain
  // `themes`/`fontOptions` arrays keeps working unchanged (those stay static
  // exports below); anything that should reflect admin additions uses these.
  const allThemes = computed(() => [...themes, ...customThemes.value])
  const allFontOptions = computed(() => [...fontOptions, ...customFonts.value])
  const allTextPresets = computed(() => [...builtInTextPresets, ...customTextPresets.value])

  function getTheme(themeId: string | undefined | null): Theme {
    return allThemes.value.find((theme) => theme.id === themeId) ?? themes.find((theme) => theme.id === DEFAULT_THEME_ID)!
  }

  function themeStyleVars(themeId: string | undefined | null, overrides?: ColorOverrides, fontFamily?: string, textWeight?: string) {
    const theme = getTheme(themeId)
    const bgFrom = overrides?.bgFrom || theme.palette.bgFrom
    const bgTo = overrides?.bgTo || theme.palette.bgTo
    const accent = overrides?.accent || theme.palette.accent

    // If the font string contains a comma or quote, it's a custom Google Font (e.g. "'Roboto', sans-serif")
    const isCustomFont = fontFamily && (fontFamily.includes(',') || fontFamily.includes("'") || fontFamily.includes('"'))
    const finalFont = isCustomFont ? fontFamily : `"${fontFamily || theme.headingFont}"`

    return {
      '--theme-bg-from': bgFrom,
      '--theme-bg-via': overrides?.bgFrom || overrides?.bgTo ? bgFrom : theme.palette.bgVia,
      '--theme-bg-to': bgTo,
      '--theme-accent': accent,
      '--theme-accent-soft': overrides?.accent ? hexToRgba(accent, 0.18) : theme.palette.accentSoft,
      '--theme-ink': theme.palette.ink,
      '--theme-on-accent': theme.palette.onAccent,
      '--theme-heading-font': finalFont,
      '--theme-text-weight': textWeight || '300'
    }
  }

  return {
    themes,
    fontOptions,
    builtInTextPresets,
    ensureCatalogLoaded,
    openingStyleCatalog,
    disabledOpeningStyles,
    enabledOpeningStyles,
    starterDefaults,
    saveStarterDefaults,
    allThemes,
    allFontOptions,
    allTextPresets,
    getTheme,
    themeStyleVars,
    addCustomTheme,
    removeCustomTheme,
    addCustomFont,
    removeCustomFont,
    addTextPreset,
    removeTextPreset,
    setOpeningStyleEnabled
  }
}