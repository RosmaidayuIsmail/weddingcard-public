export interface ThemePalette {
  bgFrom: string
  bgVia: string
  bgTo: string
  accent: string
  accentSoft: string
  ink: string
  onAccent: string
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

export function useThemes() {
  function getTheme(themeId: string | undefined | null): Theme {
    return themes.find((theme) => theme.id === themeId) ?? themes.find((theme) => theme.id === DEFAULT_THEME_ID)!
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

  return { themes, fontOptions, getTheme, themeStyleVars }
}