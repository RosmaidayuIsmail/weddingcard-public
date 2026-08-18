import type { WeddingContent } from './useWeddingTypes'

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

export const rsvpTextFields = [
  { key: 'rsvpTitle', label: 'RSVP page title' }, { key: 'rsvpDeadlineText', label: 'Deadline prefix' }, { key: 'rsvpAttendQuestion', label: 'Attendance question' }, { key: 'rsvpAttendYes', label: 'Attending option' }, { key: 'rsvpAttendNo', label: 'Not attending option' }, { key: 'rsvpNameLabel', label: 'Name label' }, { key: 'rsvpNamePlaceholder', label: 'Name placeholder' }, { key: 'rsvpGuestLabel', label: 'Guest count label' }, { key: 'rsvpSeatingLabel', label: 'Special seating question' }, { key: 'rsvpDietaryLabel', label: 'Dietary label' }, { key: 'rsvpDietaryPlaceholder', label: 'Dietary placeholder' }, { key: 'rsvpWishesLabel', label: 'Wishes label' }, { key: 'rsvpWishesSubtitle', label: 'Wishes subtitle' }, { key: 'rsvpWishesPlaceholder', label: 'Wishes placeholder' }, { key: 'rsvpStepAboutYou', label: 'Step 1 label' }, { key: 'rsvpStepDetails', label: 'Step 2 label' }, { key: 'rsvpStepWishes', label: 'Step 3 label' }, { key: 'rsvpSummaryTitle', label: 'Summary title' }, { key: 'rsvpSummaryNameLabel', label: 'Summary name label' }, { key: 'rsvpSummaryStatusLabel', label: 'Summary status label' }, { key: 'rsvpSummaryGuestsLabel', label: 'Summary guests label' }, { key: 'rsvpSummarySpecialLabel', label: 'Summary special-needs label' }, { key: 'rsvpSummaryDietaryLabel', label: 'Summary dietary label' }, { key: 'rsvpAttendingText', label: 'Attending status text' }, { key: 'rsvpNotAttendingText', label: 'Not attending status text' }, { key: 'rsvpBackButton', label: 'Back button' }, { key: 'rsvpContinueButton', label: 'Continue button' }, { key: 'rsvpConfirmButton', label: 'Confirm button' }, { key: 'rsvpSuccessYes', label: 'Attending success text' }, { key: 'rsvpSuccessNo', label: 'Not-attending success text' }, { key: 'rsvpReturnButton', label: 'Return to invitation button' }, { key: 'rsvpDeclineMessage', label: 'Decline sympathy message ({name} token)' }, { key: 'rsvpThankYouTitle', label: 'Thank-you title ({name} token)' }, { key: 'rsvpThankYouIntro', label: 'Thank-you intro sentence' }, { key: 'rsvpSubmitAnotherButton', label: 'Submit another response button' }, { key: 'rsvpWishesWallTitle', label: 'Wishes wall heading' }, { key: 'rsvpWishesEmptyText', label: 'Wishes wall empty text' }
] as const satisfies ReadonlyArray<{ key: keyof WeddingContent, label: string }>
export type RsvpTextKey = (typeof rsvpTextFields)[number]['key']
export interface RsvpPreset { id: string; label: string; texts: Partial<Pick<WeddingContent, RsvpTextKey>> }
export const builtInRsvpPresets: RsvpPreset[] = [
  {
    id: 'en',
    label: 'English',
    texts: {
      rsvpTitle: 'RSVP', rsvpDeadlineText: 'Kindly respond by', rsvpAttendQuestion: 'Will you be attending?', rsvpAttendYes: 'Joyfully Accept', rsvpAttendNo: 'Regretfully Decline',
      rsvpNameLabel: 'Name(s)', rsvpNamePlaceholder: 'Type your full name',
      rsvpGuestLabel: 'Number of guests attending', rsvpSeatingLabel: 'Do you require special seating? (e.g., wheelchair access)',
      rsvpDietaryLabel: 'Dietary restrictions (if any)', rsvpDietaryPlaceholder: 'e.g. Vegetarian, No Seafood',
      rsvpWishesLabel: 'Wishes & Blessings', rsvpWishesSubtitle: 'Write your well wishes for the couple', rsvpWishesPlaceholder: 'May your marriage be blessed...',
      rsvpStepAboutYou: 'About You', rsvpStepDetails: 'Details', rsvpStepWishes: 'Wishes',
      rsvpSummaryTitle: 'RSVP Summary', rsvpSummaryNameLabel: 'Name:', rsvpSummaryStatusLabel: 'Status:', rsvpSummaryGuestsLabel: 'Guests:', rsvpSummarySpecialLabel: 'Special:', rsvpSummaryDietaryLabel: 'Dietary:',
      rsvpAttendingText: 'Attending', rsvpNotAttendingText: 'Not Attending',
      rsvpBackButton: 'Back', rsvpContinueButton: 'Continue', rsvpConfirmButton: 'Confirm RSVP',
      rsvpSuccessYes: 'We are absolutely thrilled to celebrate with you.', rsvpSuccessNo: 'You will be dearly missed.',
      rsvpReturnButton: 'Return to Invitation',
      rsvpDeclineMessage: "We'll miss you, {name}! Feel free to leave us a wish on the next step.",
      rsvpThankYouTitle: 'Thank you, {name}!', rsvpThankYouIntro: 'Your RSVP has been securely received.',
      rsvpSubmitAnotherButton: 'Submit another response',
      rsvpWishesWallTitle: 'Wishes & Blessings', rsvpWishesEmptyText: 'Be the first to leave a wish 💛'
    }
  },
  {
    id: 'ms',
    label: 'Bahasa Melayu',
    texts: {
      rsvpTitle: 'RSVP / Pengesahan', rsvpDeadlineText: 'Sila sahkan kehadiran sebelum', rsvpAttendQuestion: 'Adakah anda akan hadir?', rsvpAttendYes: 'Ya, Akan Hadir', rsvpAttendNo: 'Maaf, Tidak Dapat Hadir',
      rsvpNameLabel: 'Nama', rsvpNamePlaceholder: 'Taip nama penuh anda',
      rsvpGuestLabel: 'Jumlah tetamu yang akan hadir', rsvpSeatingLabel: 'Adakah anda memerlukan tempat duduk khas? (cth: akses kerusi roda)',
      rsvpDietaryLabel: 'Sekatan pemakanan (jika ada)', rsvpDietaryPlaceholder: 'cth. Vegetarian, Tiada Makanan Laut',
      rsvpWishesLabel: 'Ucapan & Doa Restu', rsvpWishesSubtitle: 'Tuliskan ucapan dan doa restu anda untuk pengantin', rsvpWishesPlaceholder: 'Semoga perkahwinan anda diberkati...',
      rsvpStepAboutYou: 'Maklumat Anda', rsvpStepDetails: 'Butiran', rsvpStepWishes: 'Ucapan',
      rsvpSummaryTitle: 'Ringkasan RSVP', rsvpSummaryNameLabel: 'Nama:', rsvpSummaryStatusLabel: 'Status:', rsvpSummaryGuestsLabel: 'Tetamu:', rsvpSummarySpecialLabel: 'Khas:', rsvpSummaryDietaryLabel: 'Pemakanan:',
      rsvpAttendingText: 'Akan Hadir', rsvpNotAttendingText: 'Tidak Hadir',
      rsvpBackButton: 'Kembali', rsvpContinueButton: 'Seterusnya', rsvpConfirmButton: 'Sahkan RSVP',
      rsvpSuccessYes: 'Kami amat teruja untuk meraikan bersama anda.', rsvpSuccessNo: 'Kehadiran anda amat dirindui.',
      rsvpReturnButton: 'Kembali ke Jemputan',
      rsvpDeclineMessage: 'Kehadiran anda amat dirindui, {name}! Jangan lupa tinggalkan ucapan di langkah seterusnya.',
      rsvpThankYouTitle: 'Terima kasih, {name}!', rsvpThankYouIntro: 'RSVP anda telah berjaya diterima.',
      rsvpSubmitAnotherButton: 'Hantar respons lain',
      rsvpWishesWallTitle: 'Ucapan & Doa Restu', rsvpWishesEmptyText: 'Jadilah yang pertama tinggalkan ucapan 💛'
    }
  }
]

/** Platform controls for the couple dashboard. Routes and permissions stay
 * in source code; admin changes only labels and availability. */
export interface DashboardNavSetting {
  id: 'overview' | 'opening' | 'editor' | 'rsvp' | 'guests' | 'flow' | 'billing'
  label: string
  enabled: boolean
}

export interface DashboardSettings {
  navItems: DashboardNavSetting[]
  overviewEyebrow: string
  overviewTitle: string
  createCardTitle: string
  createCardDescription: string
}

export const defaultDashboardSettings: DashboardSettings = {
  navItems: [
    { id: 'overview', label: 'Overview', enabled: true },
    { id: 'opening', label: 'Opening Design', enabled: true },
    { id: 'editor', label: 'Design Studio', enabled: true },
    { id: 'rsvp', label: 'RSVP Editor', enabled: true },
    { id: 'guests', label: 'Guest List', enabled: true },
    { id: 'flow', label: 'Day Flow', enabled: true },
    { id: 'billing', label: 'Billing & Plans', enabled: true }
  ],
  overviewEyebrow: 'Dashboard Overview',
  overviewTitle: 'Dashboard Overview',
  createCardTitle: "Let's create your card",
  createCardDescription: 'You can change everything except your link name later.'
}

// The two presets that already existed as hardcoded buttons on the Opening
// Design page - kept as permanent built-ins alongside anything admins add.
export const builtInTextPresets: TextPreset[] = [
  { id: 'en', label: 'English', openingTitle: "You're Invited", openingGreeting: 'Dear {guestName}', openingActionText: 'Tap to open' },
  { id: 'ms', label: 'Bahasa Melayu', openingTitle: 'Walimatul Urus', openingGreeting: 'Menjemput {guestName} sekeluarga', openingActionText: 'Klik untuk buka' }
]

// Global Day Flow "quick start" templates - the two that already existed as
// hardcoded buttons on the Day Flow page, kept as permanent built-ins
// alongside anything admins add. Same pattern as builtInTextPresets above.
export interface FlowPreset {
  id: string
  label: string
  items: StarterFlowItem[]
}

export const builtInDayFlowPresets: FlowPreset[] = [
  {
    id: 'traditional-nikah-sanding',
    label: 'Traditional Nikah & Sanding',
    items: [
      { time: '10:00 AM', title: 'Ketibaan Tetamu', description: 'Para tetamu mula hadir.' },
      { time: '10:30 AM', title: 'Ketibaan Pengantin', description: 'Pengantin tiba berserta rombongan.' },
      { time: '11:00 AM', title: 'Majlis Akad Nikah', description: 'Upacara akad nikah bermula.' },
      { time: '1:00 PM', title: 'Jamuan Makan', description: 'Hidangan utama disajikan.' },
      { time: '2:00 PM', title: 'Sesi Bergambar', description: 'Bersama keluarga dan rakan-rakan.' }
    ]
  },
  {
    id: 'modern-evening-reception',
    label: 'Modern Evening Reception',
    items: [
      { time: '6:30 PM', title: 'Guest Arrival', description: 'Welcome drinks and mingling.' },
      { time: '7:30 PM', title: 'Grand Entrance', description: 'The couple arrives.' },
      { time: '8:00 PM', title: 'Dinner Served', description: 'Enjoy the feast.' },
      { time: '9:00 PM', title: 'Speeches & Toasts', description: 'Words from family and friends.' },
      { time: '9:30 PM', title: 'Cake Cutting', description: 'Followed by the first dance.' }
    ]
  }
]

/** Platform controls for the Day Flow page. Mirrors DashboardSettings'
 * label-only pattern - the page and its behaviour stay in source code. */
export interface DayFlowSettings {
  pageTitle: string
  pageDescription: string
}

export const defaultDayFlowSettings: DayFlowSettings = {
  pageTitle: 'Wedding Day Flow',
  pageDescription: 'Lay out your ceremony and reception run-of-show.'
}

/** Platform controls for the Guest List page - labels and which optional
 * columns are shown. The underlying guest data model is unchanged. */
export interface GuestListSettings {
  pageTitle: string
  pageDescription: string
  vipLabel: string
  generalLabel: string
  showSpecialSeating: boolean
  showDietary: boolean
}

export const defaultGuestListSettings: GuestListSettings = {
  pageTitle: 'Guest List',
  pageDescription: 'Manage invitations, RSVPs, and dietary requirements.',
  vipLabel: 'VIP',
  generalLabel: 'General',
  showSpecialSeating: true,
  showDietary: true
}

/**
 * Admin-authored CSS/HTML/JS injected onto every live wedding page.
 *
 * SAFETY DESIGN: this is rendered inside a sandboxed <iframe> (see
 * CustomCodeBlock.vue) with `sandbox="allow-scripts"` and NO
 * `allow-same-origin`. That combination means any script here runs in a
 * throwaway, opaque-origin document: it CANNOT read this site's cookies,
 * Firebase session, localStorage, or reach into the parent page's DOM (no
 * couples' data, no other visitors' data, no way to deface the rest of the
 * app). It CAN still run animations, fetch its own external resources, and
 * render arbitrary markup - full creative freedom, contained blast radius.
 * A broken or malicious paste can only break the sandboxed box itself.
 */
export interface CustomCode {
  enabled: boolean
  position: 'top' | 'bottom'
  css: string
  html: string
}

export const defaultCustomCode: CustomCode = {
  enabled: false,
  position: 'bottom',
  css: '',
  html: ''
}

interface PlatformCatalog {
  themes: Theme[]
  fonts: FontOption[]
  textPresets: TextPreset[]
  disabledOpeningStyles: string[]
  disabledOrnamentStyles: string[]
  disabledPetalStyles: string[]
  disabledTopIcons: string[]
  starterDefaults: StarterDefaults
  dashboardSettings: DashboardSettings
  rsvpPresets: RsvpPreset[]
  dayFlowPresets: FlowPreset[]
  dayFlowSettings: DayFlowSettings
  guestListSettings: GuestListSettings
  customCode: CustomCode
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

// Same "toggle, don't author" pattern as openingStyleCatalog: each of these
// is real CSS/markup in CardOrnament.vue, PetalsBackground.vue, or the
// Cover/Inner icon template branches - admin controls which of these every
// couple is allowed to pick from in their own Design Studio.
export const ornamentStyleCatalog: OpeningStyle[] = [
  { label: 'None', value: 'none', icon: 'i-heroicons-no-symbol' },
  { label: 'Botanical Corners', value: 'botanical-corners', icon: 'i-heroicons-sparkles' },
  { label: 'Floral Wreath', value: 'floral-wreath', icon: 'i-heroicons-globe-alt' },
  { label: 'Minimal Arch', value: 'minimal-arch', icon: 'i-heroicons-stop' },
  { label: 'Art Deco', value: 'geometric-deco', icon: 'i-heroicons-viewfinder-circle' }
]

export const petalStyleCatalog: OpeningStyle[] = [
  { label: 'Petals', value: 'petals', icon: 'i-heroicons-sparkles' },
  { label: 'Confetti', value: 'confetti', icon: 'i-heroicons-squares-2x2' },
  { label: 'Hearts', value: 'hearts', icon: 'i-heroicons-heart' },
  { label: 'Sparkle', value: 'sparkles', icon: 'i-heroicons-star' },
  { label: 'Stars', value: 'stars', icon: 'i-heroicons-star' }
]

export const topIconCatalog: OpeningStyle[] = [
  { label: 'None', value: 'none', icon: 'i-heroicons-no-symbol' },
  { label: 'Bismillah (﷽)', value: 'bismillah', icon: 'i-heroicons-language' },
  { label: 'Interlocking Rings', value: 'rings', icon: 'i-heroicons-lifebuoy' },
  { label: 'Heart', value: 'heart', icon: 'i-heroicons-heart' },
  { label: 'Custom Upload', value: 'custom', icon: 'i-heroicons-arrow-up-tray' }
]

export function useThemes() {
  const { db, isConfigured } = useFirebase()

  // Shared across every component that calls useThemes() in this session,
  // so the catalog is only fetched from Firestore once, not once per call.
  const customThemes = useState<Theme[]>('catalog-themes', () => [])
  const customFonts = useState<FontOption[]>('catalog-fonts', () => [])
  const customTextPresets = useState<TextPreset[]>('catalog-text-presets', () => [])
  const disabledOpeningStyles = useState<string[]>('catalog-disabled-opening-styles', () => [])
  const disabledOrnamentStyles = useState<string[]>('catalog-disabled-ornament-styles', () => [])
  const disabledPetalStyles = useState<string[]>('catalog-disabled-petal-styles', () => [])
  const disabledTopIcons = useState<string[]>('catalog-disabled-top-icons', () => [])
  const starterDefaults = useState<StarterDefaults>('catalog-starter-defaults', () => ({ ...defaultStarterDefaults }))
  const dashboardSettings = useState<DashboardSettings>('catalog-dashboard-settings', () => structuredClone(defaultDashboardSettings))
  const customRsvpPresets = useState<RsvpPreset[]>('catalog-rsvp-presets', () => [])
  const customDayFlowPresets = useState<FlowPreset[]>('catalog-day-flow-presets', () => [])
  const dayFlowSettings = useState<DayFlowSettings>('catalog-day-flow-settings', () => structuredClone(defaultDayFlowSettings))
  const guestListSettings = useState<GuestListSettings>('catalog-guest-list-settings', () => structuredClone(defaultGuestListSettings))
  const customCode = useState<CustomCode>('catalog-custom-code', () => structuredClone(defaultCustomCode))
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
        disabledOrnamentStyles.value = Array.isArray(data.disabledOrnamentStyles) ? data.disabledOrnamentStyles : []
        disabledPetalStyles.value = Array.isArray(data.disabledPetalStyles) ? data.disabledPetalStyles : []
        disabledTopIcons.value = Array.isArray(data.disabledTopIcons) ? data.disabledTopIcons : []
        starterDefaults.value = data.starterDefaults ? { ...defaultStarterDefaults, ...data.starterDefaults } : { ...defaultStarterDefaults }
        if (data.dashboardSettings) {
          const savedItems = Array.isArray(data.dashboardSettings.navItems) ? data.dashboardSettings.navItems : []
          dashboardSettings.value = {
            ...defaultDashboardSettings,
            ...data.dashboardSettings,
            navItems: defaultDashboardSettings.navItems.map((defaultItem) => {
              const saved = savedItems.find((item) => item?.id === defaultItem.id)
              return { ...defaultItem, ...(saved || {}) }
            })
          }
        }
        customRsvpPresets.value = Array.isArray(data.rsvpPresets) ? data.rsvpPresets : []
        customDayFlowPresets.value = Array.isArray(data.dayFlowPresets) ? data.dayFlowPresets : []
        dayFlowSettings.value = data.dayFlowSettings ? { ...defaultDayFlowSettings, ...data.dayFlowSettings } : { ...defaultDayFlowSettings }
        guestListSettings.value = data.guestListSettings ? { ...defaultGuestListSettings, ...data.guestListSettings } : { ...defaultGuestListSettings }
        customCode.value = data.customCode ? { ...defaultCustomCode, ...data.customCode } : { ...defaultCustomCode }
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

  async function setOrnamentStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledOrnamentStyles.value.filter((v) => v !== styleValue)
      : [...disabledOrnamentStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledOrnamentStyles', next)
    disabledOrnamentStyles.value = next
  }

  async function setPetalStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledPetalStyles.value.filter((v) => v !== styleValue)
      : [...disabledPetalStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledPetalStyles', next)
    disabledPetalStyles.value = next
  }

  async function setTopIconEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledTopIcons.value.filter((v) => v !== styleValue)
      : [...disabledTopIcons.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledTopIcons', next)
    disabledTopIcons.value = next
  }

  async function addDayFlowPreset(preset: FlowPreset) {
    const next = [...customDayFlowPresets.value.filter((p) => p.id !== preset.id), preset]
    await saveCatalogField('dayFlowPresets', next)
    customDayFlowPresets.value = next
  }
  async function removeDayFlowPreset(id: string) {
    const next = customDayFlowPresets.value.filter((p) => p.id !== id)
    await saveCatalogField('dayFlowPresets', next)
    customDayFlowPresets.value = next
  }
  async function saveDayFlowSettings(next: DayFlowSettings) {
    await saveCatalogField('dayFlowSettings', next)
    dayFlowSettings.value = next
  }
  async function saveGuestListSettings(next: GuestListSettings) {
    await saveCatalogField('guestListSettings', next)
    guestListSettings.value = next
  }
  async function saveCustomCode(next: CustomCode) {
    await saveCatalogField('customCode', next)
    customCode.value = next
  }

  async function saveStarterDefaults(next: StarterDefaults) {
    await saveCatalogField('starterDefaults', next)
    starterDefaults.value = next
  }

  async function saveDashboardSettings(next: DashboardSettings) {
    await saveCatalogField('dashboardSettings', next)
    dashboardSettings.value = next
  }
  async function addRsvpPreset(preset: RsvpPreset) {
    const next = [...customRsvpPresets.value.filter((item) => item.id !== preset.id), preset]
    await saveCatalogField('rsvpPresets', next)
    customRsvpPresets.value = next
  }
  async function removeRsvpPreset(id: string) {
    const next = customRsvpPresets.value.filter((item) => item.id !== id)
    await saveCatalogField('rsvpPresets', next)
    customRsvpPresets.value = next
  }

  // What couples should actually see in the Opening Design picker - the
  // built-in catalog minus whatever admin has turned off.
  const enabledOpeningStyles = computed(() => openingStyleCatalog.filter((s) => !disabledOpeningStyles.value.includes(s.value)))
  const enabledOrnamentStyles = computed(() => ornamentStyleCatalog.filter((s) => !disabledOrnamentStyles.value.includes(s.value)))
  const enabledPetalStyles = computed(() => petalStyleCatalog.filter((s) => !disabledPetalStyles.value.includes(s.value)))
  const enabledTopIcons = computed(() => topIconCatalog.filter((s) => !disabledTopIcons.value.includes(s.value)))
  const allDayFlowPresets = computed(() => [...builtInDayFlowPresets, ...customDayFlowPresets.value])

  // The full, "what should actually render" lists - built-ins plus whatever
  // admins have added. Every existing call site that destructures the plain
  // `themes`/`fontOptions` arrays keeps working unchanged (those stay static
  // exports below); anything that should reflect admin additions uses these.
  const allThemes = computed(() => [...themes, ...customThemes.value])
  const allFontOptions = computed(() => [...fontOptions, ...customFonts.value])
  const allTextPresets = computed(() => [...builtInTextPresets, ...customTextPresets.value])
  const allRsvpPresets = computed(() => [...builtInRsvpPresets, ...customRsvpPresets.value])

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
    builtInRsvpPresets,
    rsvpTextFields,
    ensureCatalogLoaded,
    openingStyleCatalog,
    disabledOpeningStyles,
    enabledOpeningStyles,
    starterDefaults,
    saveStarterDefaults,
    dashboardSettings,
    saveDashboardSettings,
    allThemes,
    allFontOptions,
    allTextPresets,
    allRsvpPresets,
    getTheme,
    themeStyleVars,
    addCustomTheme,
    removeCustomTheme,
    addCustomFont,
    removeCustomFont,
    addTextPreset,
    removeTextPreset,
    addRsvpPreset,
    removeRsvpPreset,
    setOpeningStyleEnabled,
    ornamentStyleCatalog,
    petalStyleCatalog,
    topIconCatalog,
    disabledOrnamentStyles,
    disabledPetalStyles,
    disabledTopIcons,
    enabledOrnamentStyles,
    enabledPetalStyles,
    enabledTopIcons,
    setOrnamentStyleEnabled,
    setPetalStyleEnabled,
    setTopIconEnabled,
    builtInDayFlowPresets,
    allDayFlowPresets,
    addDayFlowPreset,
    removeDayFlowPreset,
    dayFlowSettings,
    saveDayFlowSettings,
    guestListSettings,
    saveGuestListSettings,
    customCode,
    saveCustomCode
  }
}
