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
  openingStyle: string
  openingBgUrl: string
  openingTitle: string
  openingGreeting: string
  openingActionText: string
  innerGreeting: string
  innerIntro: string
  btnDetails: string
  btnRsvp: string
  rsvpTitle: string
  rsvpDeadlineText: string
  rsvpAttendQuestion: string
  rsvpAttendYes: string
  rsvpAttendNo: string
  rsvpGuestLabel: string
  rsvpSeatingLabel: string
  rsvpDietaryLabel: string
  rsvpWishesLabel: string
  innerTopIcon: string
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
    openingStyle: 'classic',
    openingBgUrl: '',
    openingTitle: "You're Invited",
    openingGreeting: 'Dear',
    openingActionText: 'Tap to open',
    innerGreeting: "You're Invited",
    innerIntro: 'To the wedding celebration of',
    btnDetails: 'View Details',
    btnRsvp: 'RSVP Now',
    rsvpTitle: 'RSVP',
    rsvpDeadlineText: 'Kindly respond by',
    rsvpAttendQuestion: 'Will you be attending?',
    rsvpAttendYes: 'Joyfully Accept',
    rsvpAttendNo: 'Regretfully Decline',
    rsvpGuestLabel: 'Number of guests attending',
    rsvpSeatingLabel: 'Do you require special seating? (e.g., wheelchair access)',
    rsvpDietaryLabel: 'Dietary restrictions (if any)',
    rsvpWishesLabel: 'Wishes & Blessings',
    innerTopIcon: 'none',
    customIconUrl: '',
    hideSystemText: false,
    namesLayout: 'horizontal',
    iconX: 50, iconY: 15,
    greetingX: 50, greetingY: 25,
    introX: 50, introY: 32,
    namesX: 50, namesY: 50,
    dateX: 50, dateY: 70,
    venueX: 50, venueY: 78
  }
}