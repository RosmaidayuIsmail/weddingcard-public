export interface WeddingBank {
  name: string
  accountName: string
  accountNumber: string
  qrCodeUrl?: string
}

export interface WeddingContent {
  brideName: string
  groomName: string
  brideFullName: string
  brideParents: string
  groomFullName: string
  groomParents: string
  /** Individual portrait photos shown on the Family slide */
  bridePhotoUrl: string
  groomPhotoUrl: string
  story: string
  dateISO: string
  dateLabel: string
  timeLabel: string
  venueName: string
  venueAddress: string
  mapUrl: string
  rsvpDeadlineLabel: string
  hashtag: string
  enableGift: boolean
  enablePetals: boolean
  /** Which floating particle style to use: 'petals' | 'confetti' | 'hearts' | 'sparkles' */
  petalStyle: string
  bank: WeddingBank
  coverPhotoUrl: string
  audioSrc: string
  customAccent: string
  customBgFrom: string
  customBgTo: string
  fontFamily: string
  customFontUrl: string
  customFontFamily: string
  ornamentStyle: string
  /** CSS font-weight for body/description text (intro, story, addresses) - helps legibility on busy or low-contrast themes */
  textWeight: string
  /** Override color for the bride & groom names specifically - falls back to the theme's ink color when empty */
  nameColor: string
  /** Percentage scale for the bride & groom names, 50-200, default 100 */
  nameSize: number
  /** Monogram / logo emblem shown on the print card and details page */
  monogramEnabled: boolean
  monogramType: string // 'auto' | 'custom-text' | 'upload'
  monogramText: string // used when monogramType is 'custom-text'
  monogramImageUrl: string // used when monogramType is 'upload'
  monogramFont: string // curated font id, used unless monogramFontUrl is set
  monogramFontUrl: string // custom Google Font stylesheet URL
  monogramFontFamily: string // custom Google Font CSS family name
  openingStyle: string
  openingBgUrl: string
  openingTitle: string
  openingGreeting: string
  openingActionText: string
  /**
   * Per-element typography overrides for the opening/envelope screen's three
   * text elements. Each falls back to sensible defaults when empty, so
   * existing cards are unaffected until the user opts in.
   */
  openingTitleFont: string
  openingTitleFontUrl: string
  openingTitleFontFamily: string
  openingTitleSize: number
  openingTitleColor: string
  openingTitleWeight: string
  openingGreetingFont: string
  openingGreetingFontUrl: string
  openingGreetingFontFamily: string
  openingGreetingSize: number
  openingGreetingColor: string
  openingGreetingWeight: string
  openingActionFont: string
  openingActionFontUrl: string
  openingActionFontFamily: string
  openingActionSize: number
  openingActionColor: string
  openingActionWeight: string
  innerGreeting: string
  innerIntro: string
  btnDetails: string
  btnRsvp: string
  /** When false, the RSVP button/page are hidden - for invitation-only cards */
  rsvpEnabled: boolean
  /**
   * WhatsApp/copy-link share message template. Supports tokens:
   * {guestName} {brideName} {groomName} {date} {link}
   * {guestName} is only filled in when sharing a specific guest's
   * personalized link from the Guests page - it's empty on the general
   * share button on the invitation itself.
   */
  shareMessage: string
  rsvpTitle: string
  rsvpDeadlineText: string
  rsvpAttendQuestion: string
  rsvpAttendYes: string
  rsvpAttendNo: string
  rsvpGuestLabel: string
  rsvpSeatingLabel: string
  rsvpDietaryLabel: string
  rsvpWishesLabel: string
  /** Additional RSVP text - all translatable so a Malay (or any language) card can be fully localized */
  rsvpNameLabel: string
  rsvpNamePlaceholder: string
  rsvpDietaryPlaceholder: string
  rsvpWishesSubtitle: string
  rsvpWishesPlaceholder: string
  rsvpSummaryTitle: string
  rsvpSummaryNameLabel: string
  rsvpSummaryStatusLabel: string
  rsvpSummaryGuestsLabel: string
  rsvpSummarySpecialLabel: string
  rsvpSummaryDietaryLabel: string
  rsvpAttendingText: string
  rsvpNotAttendingText: string
  rsvpBackButton: string
  rsvpContinueButton: string
  rsvpConfirmButton: string
  rsvpSuccessYes: string
  rsvpSuccessNo: string
  rsvpStepAboutYou: string
  rsvpStepDetails: string
  rsvpStepWishes: string
  /** "Return to Invitation" button shown at the top of the RSVP page */
  rsvpReturnButton: string
  /** Sympathy message shown when a guest declines - supports the {name} token */
  rsvpDeclineMessage: string
  /** Thank-you screen title after a successful submission - supports the {name} token */
  rsvpThankYouTitle: string
  /** Thank-you screen intro sentence, shown before the attending/not-attending success text */
  rsvpThankYouIntro: string
  /** "Submit another response" button on the thank-you screen */
  rsvpSubmitAnotherButton: string
  /** Heading shown above the Wishes & Blessings wall on the thank-you screen */
  rsvpWishesWallTitle: string
  /** Message shown on the Wishes & Blessings wall when no one has left a wish yet */
  rsvpWishesEmptyText: string
  innerTopIcon: string
  /** Percentage scale for the icon, 50-200, default 100 */
  iconSize: number
  /** Independent icon setting for the Inner Card (details/story) page - see innerTopIcon for the Cover page's icon */
  detailsTopIcon: string
  detailsIconSize: number
  /** Optional line shown below the Cover page's icon, e.g. "Together with their families" */
  iconSubtitle: string
  customIconUrl: string
  hideSystemText: boolean
  
  // --- NEW: Independent Drag & Drop Positions & Layouts ---
  namesLayout: string // 'horizontal' | 'vertical'
  iconX: number
  iconY: number
  greetingX: number
  greetingY: number
  introX: number
  introY: number
  namesX: number
  namesY: number
  dateX: number
  dateY: number
  venueX: number
  venueY: number
}

export interface FlowItem {
  id: string
  time: string
  title: string
  description: string
}

export type WeddingPlan = 'free' | 'premium'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid'
export type WeddingStatus = 'draft' | 'published'

export interface WeddingDoc {
  id: string
  ownerUid: string
  slug: string
  themeId: string
  plan: WeddingPlan
  paymentStatus: PaymentStatus
  status: WeddingStatus
  content: WeddingContent
  flow: FlowItem[]
}

export interface GuestDoc {
  id: string
  name: string
  tier: 'vip' | 'general'
  phone: string
  attending: 'Yes' | 'No' | ''
  guestCount: number
  specialSeating: boolean
  dietary: string
  doa: string
  submittedAt: string
}

export function createDefaultContent(brideName = '', groomName = ''): WeddingContent {
  return {
    brideName,
    groomName,
    brideFullName: '',
    brideParents: '',
    groomFullName: '',
    groomParents: '',
    bridePhotoUrl: '',
    groomPhotoUrl: '',
    story: 'With humble hearts, we joyfully invite you to celebrate our wedding with us.',
    dateISO: '',
    dateLabel: '',
    timeLabel: '',
    venueName: '',
    venueAddress: '',
    mapUrl: '',
    rsvpDeadlineLabel: '',
    hashtag: '',
    enableGift: false,
    enablePetals: true,
    petalStyle: 'petals',
    bank: { name: '', accountName: '', accountNumber: '', qrCodeUrl: '' },
    coverPhotoUrl: '',
    audioSrc: '',
    customAccent: '',
    customBgFrom: '',
    customBgTo: '',
    fontFamily: '',
    customFontUrl: '',
    customFontFamily: '',
    ornamentStyle: 'none',
    textWeight: '300',
    nameColor: '',
    nameSize: 100,
    monogramEnabled: false,
    monogramType: 'auto',
    monogramText: '',
    monogramImageUrl: '',
    monogramFont: 'Cormorant Garamond',
    monogramFontUrl: '',
    monogramFontFamily: '',
    openingStyle: 'classic',
    openingBgUrl: '',
    openingTitle: "You're Invited",
    openingGreeting: 'Dear',
    openingActionText: 'Tap to open',
    openingTitleFont: '',
    openingTitleFontUrl: '',
    openingTitleFontFamily: '',
    openingTitleSize: 100,
    openingTitleColor: '',
    openingTitleWeight: '',
    openingGreetingFont: '',
    openingGreetingFontUrl: '',
    openingGreetingFontFamily: '',
    openingGreetingSize: 100,
    openingGreetingColor: '',
    openingGreetingWeight: '',
    openingActionFont: '',
    openingActionFontUrl: '',
    openingActionFontFamily: '',
    openingActionSize: 100,
    openingActionColor: '',
    openingActionWeight: '',
    innerGreeting: "You're Invited",
    innerIntro: 'To the wedding celebration of',
    btnDetails: 'View Details',
    btnRsvp: 'RSVP Now',
    rsvpEnabled: true,
    shareMessage: "You're invited to {brideName} & {groomName}'s wedding! {date}. RSVP here: {link}",
    rsvpTitle: 'RSVP',
    rsvpDeadlineText: 'Kindly respond by',
    rsvpAttendQuestion: 'Will you be attending?',
    rsvpAttendYes: 'Joyfully Accept',
    rsvpAttendNo: 'Regretfully Decline',
    rsvpGuestLabel: 'Number of guests attending',
    rsvpSeatingLabel: 'Do you require special seating? (e.g., wheelchair access)',
    rsvpDietaryLabel: 'Dietary restrictions (if any)',
    rsvpWishesLabel: 'Wishes & Blessings',
    rsvpNameLabel: 'Name(s)',
    rsvpNamePlaceholder: 'Type your full name',
    rsvpDietaryPlaceholder: 'e.g. Vegetarian, No Seafood',
    rsvpWishesSubtitle: 'Write your well wishes for the couple',
    rsvpWishesPlaceholder: 'May your marriage be blessed...',
    rsvpSummaryTitle: 'RSVP Summary',
    rsvpSummaryNameLabel: 'Name:',
    rsvpSummaryStatusLabel: 'Status:',
    rsvpSummaryGuestsLabel: 'Guests:',
    rsvpSummarySpecialLabel: 'Special:',
    rsvpSummaryDietaryLabel: 'Dietary:',
    rsvpAttendingText: 'Attending',
    rsvpNotAttendingText: 'Not Attending',
    rsvpBackButton: 'Back',
    rsvpContinueButton: 'Continue',
    rsvpConfirmButton: 'Confirm RSVP',
    rsvpSuccessYes: 'We are absolutely thrilled to celebrate with you.',
    rsvpSuccessNo: 'You will be dearly missed.',
    rsvpStepAboutYou: 'About You',
    rsvpStepDetails: 'Details',
    rsvpStepWishes: 'Wishes',
    rsvpReturnButton: 'Return to Invitation',
    rsvpDeclineMessage: "We'll miss you, {name}! Feel free to leave us a wish on the next step.",
    rsvpThankYouTitle: 'Thank you, {name}!',
    rsvpThankYouIntro: 'Your RSVP has been securely received.',
    rsvpSubmitAnotherButton: 'Submit another response',
    rsvpWishesWallTitle: 'Wishes & Blessings',
    rsvpWishesEmptyText: 'Be the first to leave a wish 💛',
    innerTopIcon: 'none',
    iconSize: 100,
    detailsTopIcon: 'none',
    detailsIconSize: 100,
    iconSubtitle: '',
    customIconUrl: '',
    hideSystemText: false,
    namesLayout: 'horizontal',
    iconX: 50, iconY: 10,
    greetingX: 50, greetingY: 20,
    introX: 50, introY: 30,
    namesX: 50, namesY: 50,
    dateX: 50, dateY: 68,
    venueX: 50, venueY: 78
  }
}

/**
 * Builds a "B & G" style monogram from initials when the couple hasn't
 * typed a custom monogram text of their own.
 */
export function autoMonogramText(brideName: string, groomName: string): string {
  const b = brideName.trim().charAt(0).toUpperCase()
  const g = groomName.trim().charAt(0).toUpperCase()
  if (!b && !g) return ''
  if (!b) return g
  if (!g) return b
  return `${b} & ${g}`
}

/**
 * Fills the {name} token used in RSVP guest-facing messages (the decline
 * sympathy line and the thank-you title) with the guest's own name.
 */
export function fillNameToken(template: string, name: string): string {
  return (template || '').replace(/\{name\}/g, name || 'friend')
}

export function buildShareMessage(
  template: string,
  tokens: { guestName?: string; brideName: string; groomName: string; date?: string; link: string }
): string {
  return template
    .replace(/\{guestName\}/g, tokens.guestName || '')
    .replace(/\{brideName\}/g, tokens.brideName || '')
    .replace(/\{groomName\}/g, tokens.groomName || '')
    .replace(/\{date\}/g, tokens.date || '')
    .replace(/\{link\}/g, tokens.link || '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}