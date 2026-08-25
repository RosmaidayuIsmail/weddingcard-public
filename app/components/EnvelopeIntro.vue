<template>
  <Transition :name="transitionName" :duration="transitionName === 'envelope-classic' ? 1500 : undefined">
    <div
      v-if="!opened"
      class="envelope-overlay"
      :class="overlayClass"
      role="button"
      tabindex="0"
      :aria-label="`Open the invitation for ${guestName ? guestName : 'you'}`"
      @click="open"
      @keydown.enter="open"
      @keydown.space.prevent="open"
    >
      <!-- FIXED: Perfect Image Slicing for Split Door -->
      <div v-if="content.openingStyle === 'custom-split' && content.openingBgUrl" class="absolute inset-0 z-0 flex">
        <!-- Left Door -->
        <div class="relative w-1/2 h-full overflow-hidden door-left z-10">
          <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover" />
          <div class="absolute inset-0 bg-black/40 border-r border-white/20 shadow-[5px_0_15px_rgba(0,0,0,0.4)]"></div>
        </div>
        <!-- Right Door -->
        <div class="relative w-1/2 h-full overflow-hidden door-right z-10">
          <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 right-0 w-[200%] h-full max-w-none object-cover" />
          <div class="absolute inset-0 bg-black/40 border-l border-white/20 shadow-[-5px_0_15px_rgba(0,0,0,0.4)]"></div>
        </div>
      </div>

      <!-- Custom Canva Background Image (Standard Fade). When openingHideText
           is on, the image is shown in full (object-contain, no crop) with
           no dark tint over it, since the couple's own design already
           carries its own typography and shouldn't be cropped or dimmed. -->
      <div
        v-else-if="content.openingStyle === 'custom' && content.openingBgUrl"
        class="absolute inset-0 z-0"
        :style="content.openingHideText ? { background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` } : {}"
      >
        <img
          :src="optimizedImageUrl(content.openingBgUrl, 1400)"
          alt="Cover Background"
          loading="eager"
          fetchpriority="high"
          :class="content.openingHideText ? 'w-full h-full object-contain' : 'w-full h-full object-cover'"
        />
        <div v-if="!content.openingHideText" class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Modern Dark: layered, slowly-drifting color palette (couple-
           selectable - see the palette swatches in Opening Design) with a
           faint grain texture and a thin frame for a more editorial, less
           "flat gradient" feel. -->
      <div v-else-if="content.openingStyle === 'modern-dark'" class="absolute inset-0 z-0 overflow-hidden modern-dark-bg" :style="modernDarkVars">
        <div class="md-blob md-blob-1"></div>
        <div class="md-blob md-blob-2"></div>
        <div class="md-blob md-blob-3"></div>
        <div class="md-grain"></div>
        <div class="md-frame"></div>
      </div>

      <!-- Minimal Light: same idea as Modern Dark but airy/pastel - a
           couple-selectable palette, softly drifting blobs, and a delicate
           dashed ring for a touch of polish beyond a flat gradient. -->
      <div v-else-if="content.openingStyle === 'minimal-light'" class="absolute inset-0 z-0 overflow-hidden minimal-light-bg" :style="minimalLightVars">
        <div class="ml-blob ml-blob-1"></div>
        <div class="ml-blob ml-blob-2"></div>
        <div class="ml-dot-ring"></div>
      </div>

      <!-- Wax Seal Card - same sliding double-door mechanic as Split Door, so
           it can show the uploaded cover picture sliced in half behind the
           seal. Falls back to an elegant gradient panel when no picture has
           been uploaded. The seal itself lives in the content container
           below so it doesn't fight the title/greeting box for space. -->
      <div v-else-if="content.openingStyle === 'wax-seal'" class="absolute inset-0 z-0 flex wax-seal-doors">
        <template v-if="content.openingBgUrl">
          <div class="relative w-1/2 h-full overflow-hidden door-left">
            <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover" />
            <div class="absolute inset-0 bg-black/45"></div>
          </div>
          <div class="relative w-1/2 h-full overflow-hidden door-right">
            <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 right-0 w-[200%] h-full max-w-none object-cover" />
            <div class="absolute inset-0 bg-black/45"></div>
          </div>
        </template>
        <template v-else>
          <div class="relative w-1/2 h-full door-left flex items-center justify-end pr-1" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from, #0d2a4a), var(--theme-bg-via, #142a45) 60%, var(--theme-bg-to, #04101f))` }">
            <div class="w-full h-[68%] rounded-l-2xl border-y-2 border-l-2" :style="{ borderColor: 'var(--theme-accent, #e3b04a)' }"></div>
          </div>
          <div class="relative w-1/2 h-full door-right flex items-center justify-start pl-1" :style="{ background: `linear-gradient(200deg, var(--theme-bg-from, #0d2a4a), var(--theme-bg-via, #142a45) 60%, var(--theme-bg-to, #04101f))` }">
            <div class="w-full h-[68%] rounded-r-2xl border-y-2 border-r-2" :style="{ borderColor: 'var(--theme-accent, #e3b04a)' }"></div>
          </div>
        </template>
      </div>

      <!-- Classic Envelope Default Background -->
      <div v-else-if="content.openingStyle === 'classic'" class="absolute inset-0 z-0 bg-gradient-to-br" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }"></div>

      <!-- Slide Up / Down / Left / Right: full-bleed picture background
           (optional) - the slide transition moves the whole overlay as one
           block, so the picture just travels off-screen along with it,
           same as Canva (Fade). Falls back to the default gradient. -->
      <div
        v-else-if="isSlideStyle && content.openingBgUrl"
        class="absolute inset-0 z-0"
        :style="content.openingHideText ? { background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` } : {}"
      >
        <img
          :src="optimizedImageUrl(content.openingBgUrl, 1400)"
          alt="Cover Background"
          loading="eager"
          fetchpriority="high"
          :class="content.openingHideText ? 'w-full h-full object-contain' : 'w-full h-full object-cover'"
        />
        <div v-if="!content.openingHideText" class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Confetti Burst Background -->
      <div v-else-if="content.openingStyle === 'confetti-burst'" class="absolute inset-0 z-0 confetti-burst-bg overflow-hidden" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }">
        <!-- Optional uploaded background image -->
        <img v-if="content.openingBgUrl" :src="optimizedImageUrl(content.openingBgUrl, 1400)" alt="Cover Background" loading="eager" fetchpriority="high" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />

        <!-- Ambient confetti - gently falls the whole time the envelope is
             closed, so the style actually shows confetti rather than a bare
             gradient (previously these had no CSS at all and were invisible). -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="confetti-particle cd-1" style="background:#f472b6; left:6%;"></div>
          <div class="confetti-particle cd-2" style="background:#60a5fa; left:16%;"></div>
          <div class="confetti-particle cd-3" style="background:#facc15; left:26%;"></div>
          <div class="confetti-particle cd-4" style="background:#4ade80; left:36%;"></div>
          <div class="confetti-particle cd-5" style="background:#c084fc; left:46%;"></div>
          <div class="confetti-particle cd-6" style="background:#f87171; left:56%;"></div>
          <div class="confetti-particle cd-7" style="background:#f472b6; left:66%;"></div>
          <div class="confetti-particle cd-8" style="background:#60a5fa; left:76%;"></div>
          <div class="confetti-particle cd-9" style="background:#facc15; left:86%;"></div>
          <div class="confetti-particle cd-10" style="background:#4ade80; left:94%;"></div>
          <div class="confetti-particle cd-11" style="background:#c084fc; left:50%;"></div>
          <div class="confetti-particle cd-12" style="background:#f87171; left:10%;"></div>
        </div>

        <!-- Burst particles - invisible until the tap, then fan outward from
             a center point like a party popper, layered on top of (not
             replacing) the falling particles above. -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="confetti-burst-particle" style="background:#f472b6; --bx:-90px; --by:-190px; --brot:480deg; --del:0s;"></div>
          <div class="confetti-burst-particle" style="background:#60a5fa; --bx:-55px; --by:-230px; --brot:-420deg; --del:0.03s;"></div>
          <div class="confetti-burst-particle" style="background:#facc15; --bx:-20px; --by:-250px; --brot:540deg; --del:0.01s;"></div>
          <div class="confetti-burst-particle" style="background:#4ade80; --bx:15px; --by:-250px; --brot:-500deg; --del:0.04s;"></div>
          <div class="confetti-burst-particle" style="background:#c084fc; --bx:50px; --by:-230px; --brot:460deg; --del:0.02s;"></div>
          <div class="confetti-burst-particle" style="background:#f87171; --bx:90px; --by:-190px; --brot:-540deg; --del:0.05s;"></div>
          <div class="confetti-burst-particle" style="background:#f472b6; --bx:-70px; --by:-140px; --brot:400deg; --del:0.06s;"></div>
          <div class="confetti-burst-particle" style="background:#60a5fa; --bx:-30px; --by:-170px; --brot:-460deg; --del:0.02s;"></div>
          <div class="confetti-burst-particle" style="background:#facc15; --bx:10px; --by:-180px; --brot:520deg; --del:0.07s;"></div>
          <div class="confetti-burst-particle" style="background:#4ade80; --bx:40px; --by:-160px; --brot:-480deg; --del:0.03s;"></div>
          <div class="confetti-burst-particle" style="background:#c084fc; --bx:70px; --by:-150px; --brot:440deg; --del:0.05s;"></div>
          <div class="confetti-burst-particle" style="background:#f87171; --bx:100px; --by:-130px; --brot:-400deg; --del:0.01s;"></div>
        </div>
      </div>

      <!-- Fallback Gradient Background (Slide styles without a picture, and
           anything else not covered above) -->
      <div v-else class="absolute inset-0 z-0 bg-gradient-to-br" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }"></div>

      <!-- Content Container (Fades out smoothly during door split) -->
      <div
        class="content-container relative z-20 w-full max-w-md mx-auto flex flex-col justify-center p-6 animate-fade-up"
        :class="contentAlignClass"
      >
        
        <!-- Classic Envelope: flap hinges open and a paper letter genuinely
             slides up and out of it, rather than just fading in place - see
             the classic-letter-emerge animation below. The seal sits lower
             on the flap, centered on its visible face, matching where a real
             envelope's clasp/seal reads as centered rather than up near the
             hinge. -->
        <div v-if="content.openingStyle === 'classic'" class="envelope-classic-wrap mb-8">
          <div class="envelope-inner-card">
            <UIcon name="i-heroicons-heart" class="envelope-letter-icon w-7 h-7" :style="textStyleAccent" />
            <div class="envelope-letter-lines"><span></span><span></span></div>
          </div>
          <svg viewBox="0 0 200 140" class="envelope-body-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="18" width="188" height="112" rx="8" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" />
            <path d="M10 92 L100 40 L190 92" fill="none" stroke="var(--theme-accent, #e3b04a)" stroke-width="1.5" opacity="0.35" />
          </svg>
          <svg viewBox="0 0 200 140" class="envelope-flap-svg" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18 L194 18 L100 92 Z" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" stroke-linejoin="round" />
            <circle cx="100" cy="72" r="14" fill="var(--theme-accent, #d4a017)" stroke="var(--theme-accent-soft, #f3ddaa)" stroke-width="1.5" />
            <path d="M100 65 L104 72 L100 79 L96 72 Z" fill="var(--theme-bg-to, #3a2705)" />
          </svg>
        </div>

        <!-- Wax Seal: a real pressed-wax blob (irregular border-radius, not a
             perfect circle) with the couple's initials engraved in it. It's
             split into three clipped, irregularly-shaped pieces along jagged
             cracks radiating from the center, so on open it genuinely cracks
             and scatters - a clean two-piece mirror split read too much like
             an egg splitting in half. -->
        <div v-if="content.openingStyle === 'wax-seal'" class="wax-seal mb-6">
          <div class="wax-seal-piece wax-seal-piece-1">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <div class="wax-seal-piece wax-seal-piece-2">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <div class="wax-seal-piece wax-seal-piece-3">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <svg class="wax-seal-crack" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M50,50 L46,30 L52,8" />
            <path d="M50,50 L68,62 L88,78 L100,75" />
            <path d="M50,50 L30,64 L12,85 L10,95" />
          </svg>
          <span class="wax-seal-initials">{{ sealInitials }}</span>
          <div class="wax-crumb" style="--cx:14px; --cy:-30px; --delay:0.12s;"></div>
          <div class="wax-crumb" style="--cx:-20px; --cy:-18px; --delay:0.15s;"></div>
          <div class="wax-crumb" style="--cx:24px; --cy:20px; --delay:0.1s;"></div>
          <div class="wax-crumb" style="--cx:-10px; --cy:28px; --delay:0.17s;"></div>
        </div>

        <!-- Typography (hidden entirely when openingHideText is on - see the
             custom/slide background blocks above for the matching
             object-contain + no-tint image treatment) -->
        <p v-if="!content.openingHideText" class="font-heading text-5xl sm:text-6xl leading-tight mb-4" :style="[textStyleAccent, titleShadow, titleStyle]">
          {{ content.openingTitle || "You're Invited" }}
        </p>

        <!-- Dynamic Guest Name - a gallery of actual set-off SHAPES, not
             one fixed box (see openingGuestNameBox in useWeddingTypes.ts
             for the full list and DashboardOpeningPanel.vue for the
             picker). 'none' (default) is plain text over the background,
             relying on the titleShadow drop-shadow above for legibility.
             'custom' uses the couple's own uploaded image as the backdrop
             instead of any built-in shape. -->
        <div
          v-if="guestName && !content.openingHideText"
          class="guest-name-box relative mt-4 mb-6 min-w-[200px] max-w-[300px] flex flex-col items-center gap-1.5"
          :class="[guestBoxClass, { 'guest-name-box-animated': content.openingGuestNameAnimate }]"
          :style="guestBoxStyle"
        >
          <div v-if="content.openingGuestNameBox === 'custom' && content.openingGuestNameBoxImageUrl" class="guest-name-box-custom-bg" :style="{ backgroundImage: `url(${content.openingGuestNameBoxImageUrl})` }"></div>
          <p v-if="greetingParts.before" class="relative text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="[textStyleBase, titleShadow, greetingStyle]">{{ greetingParts.before }}</p>
          <p
            class="relative font-display font-semibold text-2xl sm:text-3xl leading-tight"
            :style="[textStyleBase, titleShadow, guestNameStyle]"
          >{{ guestName }}</p>
          <p v-if="greetingParts.after" class="relative text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="[textStyleBase, titleShadow, greetingAfterStyle]">{{ greetingParts.after }}</p>
        </div>

        <button v-if="!content.openingHideText" class="mt-8 flex flex-col items-center gap-2 group focus:outline-none">
          <span class="text-sm tracking-[0.25em] uppercase font-bold transition-all group-hover:scale-105" :style="[textStyleBase, titleShadow, actionStyle]">
            {{ content.openingActionText || "Tap to open" }}
          </span>
          <UIcon name="i-heroicons-chevron-double-down" class="w-5 h-5 animate-bounce mt-1" :style="textStyleAccent" />
        </button>

      </div>

      <!-- Custom image + hidden text still needs SOME visible tap
           affordance, or a first-time guest may not realize the whole
           screen is tappable - a small pulsing dot pinned to the bottom of
           the whole screen (not the content container, which collapses to
           nothing when the text above it is hidden), subtle enough not to
           compete with the couple's own design. -->
      <div v-if="content.openingHideText" class="absolute inset-x-0 bottom-6 z-20 flex justify-center pointer-events-none">
        <span class="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.6)] animate-pulse"></span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { WeddingContent } from '~/composables/useWeddingTypes'

const props = withDefaults(defineProps<{ guestName?: string; content: WeddingContent }>(), { 
  guestName: '',
  content: () => ({} as WeddingContent)
})

const opened = defineModel<boolean>('opened', { default: false })
const emit = defineEmits<{ open: [] }>()

function open() {
  if (opened.value) return
  opened.value = true
  emit('open')
}

// Dynamically sets the transition animation based on the chosen style
const transitionName = computed(() => {
  if (props.content.openingStyle === 'confetti-burst') return 'confetti-burst'
  if (props.content.openingStyle === 'custom-split' || props.content.openingStyle === 'wax-seal') return 'split-door'
  if (props.content.openingStyle === 'classic') return 'envelope-classic'
  if (props.content.openingStyle === 'slide-up') return 'slide-up-open'
  if (props.content.openingStyle === 'slide-down') return 'slide-down-open'
  if (props.content.openingStyle === 'slide-left') return 'slide-left-open'
  if (props.content.openingStyle === 'slide-right') return 'slide-right-open'
  return 'envelope-fade'
})

const overlayClass = computed(() => {
  const textColor = props.content.openingStyle === 'minimal-light' ? 'text-slate-800' : 'text-white'
  // Style-specific hook so the leave-transition CSS can single out Wax Seal
  // from Split Door even though both share the 'split-door' transition name
  // - see the .style-wax-seal rules below for why they need different
  // timing.
  if (props.content.openingStyle === 'wax-seal') return `${textColor} style-wax-seal`
  return textColor
})

const isSlideStyle = computed(() =>
  ['slide-up', 'slide-down', 'slide-left', 'slide-right'].includes(props.content.openingStyle)
)

// Horizontal placement of the Main Title / guest-name box / action text -
// lets a couple with a custom background image shift the overlay text out
// of the way of their design's own focal point instead of always centering.
const contentAlignClass = computed(() => {
  if (props.content.openingTextAlign === 'left') return 'items-start text-left'
  if (props.content.openingTextAlign === 'right') return 'items-end text-right'
  return 'items-center text-center'
})

const textStyleAccent = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: props.content.customAccent || 'var(--theme-accent, #8a6d3b)' }
  return { color: props.content.customAccent || 'var(--theme-accent, #f3ddaa)' }
})

const textStyleBase = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: minimalLightPalette.value.ink || '#1e293b' }
  return { color: '#ffffff' }
})

const titleShadow = computed(() => {
  if (props.content.openingStyle === 'minimal-light') {
    return { textShadow: '0 2px 16px rgba(255,255,255,0.7), 0 2px 6px rgba(255,255,255,0.85)' }
  }
  return { textShadow: '0 2px 16px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.75), 0 1px 2px rgba(0,0,0,0.9)' }
})

// Builds a style-override object for one of the three customizable opening
// text elements. Only includes properties the user has actually set, so
// anything left blank naturally falls back to the element's normal styling.
function buildTextOverride(font: string, fontUrl: string, fontFamily: string, size: number, color: string, weight: string) {
  const style: Record<string, string> = {}
  if (fontFamily) style.fontFamily = fontFamily
  else if (font) style.fontFamily = `'${font}', cursive`
  if (color) style.color = color
  if (weight) style.fontWeight = weight
  if (size && size !== 100) style.fontSize = `calc(1em * ${size / 100})`
  return style
}

const titleStyle = computed(() =>
  buildTextOverride(
    props.content.openingTitleFont,
    props.content.openingTitleFontUrl,
    props.content.openingTitleFontFamily,
    props.content.openingTitleSize,
    props.content.openingTitleColor,
    props.content.openingTitleWeight
  )
)

const greetingStyle = computed(() =>
  buildTextOverride(
    props.content.openingGreetingFont,
    props.content.openingGreetingFontUrl,
    props.content.openingGreetingFontFamily,
    props.content.openingGreetingSize,
    props.content.openingGreetingColor,
    props.content.openingGreetingWeight
  )
)

// The guest's actual name and the "after name" greeting text (e.g.
// "sekeluarga") can each carry their own font/size/color/weight, independent
// of the "before name" greeting text above - three separately-styled parts
// of the same guest-name box.
const guestNameStyle = computed(() =>
  buildTextOverride(
    props.content.openingGuestNameFont,
    props.content.openingGuestNameFontUrl,
    props.content.openingGuestNameFontFamily,
    props.content.openingGuestNameSize,
    props.content.openingGuestNameColor,
    props.content.openingGuestNameWeight
  )
)

const greetingAfterStyle = computed(() =>
  buildTextOverride(
    props.content.openingGreetingAfterFont,
    props.content.openingGreetingAfterFontUrl,
    props.content.openingGreetingAfterFontFamily,
    props.content.openingGreetingAfterSize,
    props.content.openingGreetingAfterColor,
    props.content.openingGreetingAfterWeight
  )
)

const actionStyle = computed(() =>
  buildTextOverride(
    props.content.openingActionFont,
    props.content.openingActionFontUrl,
    props.content.openingActionFontFamily,
    props.content.openingActionSize,
    props.content.openingActionColor,
    props.content.openingActionWeight
  )
)

// Loads any custom Google Font stylesheets the user pasted in for these
// three elements, so the overrides above actually render in the chosen font.
useHead({
  link: computed(() => {
    const links: Array<Record<string, string>> = []
    const urls = [
      props.content.openingTitleFontUrl,
      props.content.openingGreetingFontUrl,
      props.content.openingGuestNameFontUrl,
      props.content.openingGreetingAfterFontUrl,
      props.content.openingActionFontUrl
    ]
    for (const url of urls) {
      if (url && !url.includes('fonts.google.com/specimen/')) {
        links.push({ rel: 'stylesheet', href: url })
      }
    }
    // This background is the very first thing a guest sees, so kick off the
    // download as early as possible (in <head>, before the img tag even
    // renders) rather than waiting on it to be discovered further down.
    if (props.content.openingBgUrl) {
      links.push({ rel: 'preload', as: 'image', href: optimizedImageUrl(props.content.openingBgUrl, 1400), fetchpriority: 'high' })
    }
    return links
  })
})

const sealInitials = computed(() => {
  const b = (props.content.brideName || '').trim().charAt(0).toUpperCase()
  const g = (props.content.groomName || '').trim().charAt(0).toUpperCase()
  if (!b && !g) return '❤'
  return `${b}${g ? ' & ' + g : ''}`
})

// Shared gradient for both wax-seal halves - kept in one place so the two
// clipped pieces always line up as a single, seamless blob when closed.
const waxBlobStyle = computed(() => ({
  background: `radial-gradient(circle at 30% 26%, var(--theme-accent-soft, #f7e3ab) 0%, var(--theme-accent, #d4a017) 55%, var(--theme-accent, #d4a017) 78%, rgba(0,0,0,0.4) 100%)`
}))

// Resolves the couple's chosen Modern Dark / Minimal Light palette id to its
// actual colors, falling back to each catalog's first entry (today's look)
// when nothing has been chosen yet.
const modernDarkPalette = computed(() =>
  modernDarkPaletteCatalog.find((p) => p.id === props.content.openingModernDarkPalette) || modernDarkPaletteCatalog[0]
)
const minimalLightPalette = computed(() =>
  minimalLightPaletteCatalog.find((p) => p.id === props.content.openingMinimalLightPalette) || minimalLightPaletteCatalog[0]
)

const modernDarkVars = computed(() => ({
  '--md-from': modernDarkPalette.value.bgFrom,
  '--md-via': modernDarkPalette.value.bgVia,
  '--md-to': modernDarkPalette.value.bgTo,
  '--md-blob1': modernDarkPalette.value.blobPrimary,
  '--md-blob2': modernDarkPalette.value.blobSecondary
}))

const minimalLightVars = computed(() => ({
  '--ml-from': minimalLightPalette.value.bgFrom,
  '--ml-via': minimalLightPalette.value.bgVia,
  '--ml-to': minimalLightPalette.value.bgTo,
  '--ml-blob1': minimalLightPalette.value.blobPrimary,
  '--ml-blob2': minimalLightPalette.value.blobSecondary
}))

const greetingParts = computed(() => {
  const raw = props.content.openingGreeting || 'Dear'
  if (raw.includes('{guestName}')) {
    const [before, after] = raw.split('{guestName}')
    return { before: before.trim(), after: after.trim() }
  }
  // Old-style plain prefix (e.g. saved as just "Menjemput") - render before the name, nothing after
  return { before: raw.trim(), after: '' }
})

// The gallery of guest-name set-off SHAPES - see openingGuestNameBox on
// WeddingContent for the full list. Earlier this was just a couple of
// border/background treatments on the same rectangle (a "boxed" and an
// "outline" variant were nearly indistinguishable) - real feedback was
// that these need to actually look like different shapes, so every option
// below has its own silhouette (dome arch, oval pill, hexagon, notched
// ribbon banner), not just a color/border tweak. guestBoxClass carries the
// static utility classes + shape class; guestBoxStyle carries whatever
// can't be a static class because it depends on the light/dark opening
// style or the couple's own accent color.
const guestBoxClass = computed(() => {
  const style = props.content.openingGuestNameBox
  if (style === 'arch') return 'guest-name-shape-arch px-7 pt-8 pb-5'
  if (style === 'pill') return 'guest-name-shape-pill px-9 py-5'
  if (style === 'hexagon') return 'guest-name-shape-hexagon px-10 py-6'
  if (style === 'ribbon') return 'guest-name-shape-ribbon px-9 py-5'
  if (style === 'custom') return 'guest-name-box-custom p-6'
  return ''
})
const guestBoxStyle = computed(() => {
  const style = props.content.openingGuestNameBox
  const isLight = props.content.openingStyle === 'minimal-light'
  if (style === 'arch' || style === 'pill') {
    return isLight
      ? { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(0, 0, 0, 0.1)' }
      : { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.28)' }
  }
  if (style === 'hexagon') {
    return { backgroundColor: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.1)' }
  }
  if (style === 'ribbon') {
    return { backgroundColor: props.content.customAccent || (isLight ? '#8a6d3b' : 'var(--theme-accent, #8a6d3b)') }
  }
  return {}
})
</script>

<style scoped>
/* Guest-name set-off SHAPES (see guestBoxClass/guestBoxStyle above). Each
   one is a real distinct silhouette, verified with both a short name and a
   long two-line name so none of the corner/edge cuts below ever crop into
   the text - only the background/border color comes from guestBoxStyle. */

/* Dome top + flat sides/bottom - the classic wedding-invite arch card. The
   border-radius shorthand splits horizontal/vertical radii (before/after
   the "/"): wide horizontal curve on top, shallow vertical rise, so it
   reads as a dome regardless of how many lines the name wraps to. */
.guest-name-shape-arch {
  border-radius: 50% 50% 6px 6px / 62% 62% 6px 6px;
  border: 1px solid transparent;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

/* Fully-rounded stadium/oval shape. */
.guest-name-shape-pill {
  border-radius: 999px;
  border: 1px solid transparent;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

/* Six-sided hexagon - corners cut deep enough (22%/78%) to clearly read as
   a hexagon rather than a rectangle with clipped corners; the generous
   horizontal padding on the class list above keeps text clear of the cut. */
.guest-name-shape-hexagon {
  clip-path: polygon(22% 0%, 78% 0%, 100% 50%, 78% 100%, 22% 100%, 0% 50%);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

/* Rectangle with a triangular notch cut INTO both ends (concave) - the
   classic banner/ribbon-tag silhouette, distinct from the hexagon's convex
   points. Solid accent-color fill (not the frosted-glass look the other
   shapes share) so it reads as a bold ribbon tag. */
.guest-name-shape-ribbon {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 36%, 90% 50%, 100% 64%, 100% 100%,
    0% 100%, 0% 64%, 10% 50%, 0% 36%
  );
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

/* Optional "unroll" reveal for the guest name (see openingGuestNameAnimate
   on WeddingContent, toggled in DashboardOpeningPanel.vue) - like a scroll
   or parchment opening to show the name, independent of which shape above
   is chosen. Uses clip-path rather than transform:scaleX so the text
   itself is never squashed mid-animation, only progressively uncovered
   from the center outward. Off by default - see the reduced-motion
   override further down, which shows the name instantly instead. */
.guest-name-box-animated {
  /* A steady ease-in-out, not the sharp ease-out used for the letter/seal
     animations elsewhere in this file - those are meant to feel like a
     snap, this is meant to read as a slow unroll, so the motion needs to
     stay visible across the full duration instead of front-loading into
     the first 150ms. */
  animation: guest-name-unroll 1.1s cubic-bezier(0.65, 0, 0.35, 1) both;
}
@keyframes guest-name-unroll {
  0% { clip-path: inset(0 50% 0 50%); opacity: 0; }
  45% { opacity: 1; }
  100% { clip-path: inset(0 0% 0 0%); opacity: 1; }
}

/* The couple's own uploaded backdrop image - sized as a fixed-ratio box so
   an arbitrary uploaded image (any aspect ratio) still reads as one
   deliberate frame rather than stretching oddly, with the greeting text
   laid on top (see the .guest-name-box-custom-bg z-order note in the
   template: it comes first in DOM, and every text line above it is
   `relative` too, so normal stacking order alone puts the text on top -
   no z-index needed). */
.guest-name-box-custom { position: relative; width: 260px; aspect-ratio: 1.6; justify-content: center; }
.guest-name-box-custom-bg {
  position: absolute;
  inset: 0;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.envelope-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

/* Classic Envelope: layered wrap - card behind, body behind flap, flap on top when closed */
.envelope-classic-wrap {
  position: relative;
  width: min(70vw, 260px);
  aspect-ratio: 200 / 140;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
  animation: envelope-bob 3.5s ease-in-out infinite;
}

@keyframes envelope-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* The emerging "letter" - cream paper (not envelope-colored) so it visibly
   reads as a separate piece of paper coming out of the envelope, rather
   than a same-color panel just fading in in place. Starts low/small (near
   the flap's tip, i.e. the envelope's real opening) and hidden, then
   classic-letter-emerge below carries it sliding up and out. */
.envelope-inner-card {
  position: absolute;
  left: 50%;
  top: 66%;
  width: 58%;
  height: 52%;
  transform: translate(-50%, -35%) scale(0.5) rotate(-2deg);
  border-radius: 0.4rem;
  border: 2px solid var(--theme-accent, #e3b04a);
  background: linear-gradient(165deg, #fffdf7, #f3ead9);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10%;
  padding: 12% 14%;
  opacity: 0;
  z-index: 4;
}

.envelope-letter-icon {
  /* Fixed size (the w-7 h-7 Tailwind classes on the element itself), not a
     percentage - a percentage width with height:auto on an icon component
     with no intrinsic aspect-ratio computes to 0 height, which is why this
     was invisible before: the card rendered but the heart on it never did. */
  color: var(--theme-accent, #e3b04a);
  opacity: 0.9;
  flex-shrink: 0;
}

.envelope-letter-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.envelope-letter-lines span {
  /* Fixed height, not a percentage - .envelope-letter-lines has no explicit
     height of its own (it's sized by its content), and a percentage height
     against an auto-height container resolves to 0 per the CSS spec. That
     made both "text lines" render as invisible 0px-tall bars, which is why
     the letter card looked completely blank instead of like a written note. */
  display: block;
  height: 6px;
  border-radius: 999px;
  background: rgba(20, 30, 45, 0.18);
}

.envelope-letter-lines span:nth-child(1) { width: 90%; }
.envelope-letter-lines span:nth-child(2) { width: 65%; }

.envelope-body-svg {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.envelope-flap-svg {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  transform-origin: 50% 13%;
}

/* Staged open sequence: flap hinges open first, then the card emerges and
   grows on top, then the whole body fades - each delay lets the previous
   step read clearly instead of everything happening at once. */
.envelope-classic-leave-active .envelope-classic-wrap {
  animation: none;
}
.envelope-classic-leave-active .envelope-flap-svg {
  transform: perspective(700px) rotateX(-165deg);
  transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1);
}
.envelope-classic-leave-active .envelope-inner-card {
  /* animation, not transition: "both" so it holds the 0% keyframe's
     opacity:0 for the full animation-delay before starting, instead of
     jumping to the last static opacity:1 declared here (a transition-based
     version popped the letter in early, before the flap had even opened). */
  animation: classic-letter-emerge 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}
@keyframes classic-letter-emerge {
  0%   { transform: translate(-50%, -35%) scale(0.5) rotate(-2deg); opacity: 0; }
  18%  { opacity: 1; }
  58%  { transform: translate(-50%, -122%) scale(1.18) rotate(3deg); opacity: 1; }
  100% { transform: translate(-50%, -158%) scale(1.32) rotate(-1deg); opacity: 1; }
}
.envelope-classic-leave-active .envelope-body-svg {
  opacity: 0;
  transition: opacity 0.4s ease 0.55s;
}
.envelope-classic-leave-active {
  transition: opacity 0.6s ease 0.9s;
}
.envelope-classic-leave-to {
  opacity: 0;
}

/* Wax Seal: a hand-pressed wax blob (irregular border-radius, not a plain
   circle) split into two clipped halves along a jagged seam so it can
   visibly crack apart on open, rather than just shrinking away. */
.wax-seal {
  position: relative;
  width: 104px;
  height: 104px;
  transform: rotate(-3deg);
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.5));
}

.wax-seal-piece {
  position: absolute;
  inset: 0;
}

/* Three pieces share the exact same jagged radial cracks (all meeting at
   the center), so together (closed state) they read as one unbroken seal -
   only on open do they separate along those cracks. A clean two-piece
   mirror split read too much like a cracked egg; three irregular,
   non-symmetric pieces read as genuinely broken wax. Coordinates match the
   .wax-seal-crack paths below 1:1. */
.wax-seal-piece-1 {
  clip-path: polygon(50% 0%, 100% 0%, 100% 50%, 100% 75%, 88% 78%, 68% 62%, 50% 50%, 46% 30%, 52% 8%);
}

.wax-seal-piece-2 {
  clip-path: polygon(100% 75%, 100% 100%, 50% 100%, 10% 95%, 12% 85%, 30% 64%, 50% 50%, 68% 62%, 88% 78%);
}

.wax-seal-piece-3 {
  clip-path: polygon(10% 95%, 0% 100%, 0% 50%, 0% 0%, 50% 0%, 52% 8%, 46% 30%, 50% 50%, 30% 64%, 12% 85%);
}

.wax-seal-blob {
  position: absolute;
  inset: 8%;
  border-radius: 42% 58% 63% 37% / 47% 41% 59% 53%;
  box-shadow:
    inset 0 3px 6px rgba(255, 255, 255, 0.35),
    inset 0 -8px 14px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.wax-seal-ring {
  position: absolute;
  inset: 24%;
  border-radius: 50%;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

/* Hairline crack across the seal - invisible at rest, flashed briefly the
   moment the seal "breaks" (see .wax-crack-flash below). */
.wax-seal-crack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  stroke: rgba(0, 0, 0, 0.6);
  stroke-width: 2.2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wax-seal-initials {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.55);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
}

/* Tiny wax crumbs that fly off at the moment the seal breaks, for a bit of
   extra brittleness/texture beyond the three pieces themselves. */
.wax-crumb {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--theme-accent, #d4a017);
  opacity: 0;
  left: 50%;
  top: 50%;
}

/* Open sequence: the seal is pressed (a quick squash, as if being cracked
   open) then shakes and cracks, then splits into three irregular pieces
   that fly apart in different directions/rotations and fade - along with a
   few crumbs - while the doors behind it (see .wax-seal-doors below) get a
   short beat before sliding open, so it reads as "the seal is pressed and
   breaks, then the doors swing open" rather than everything at once. */
.split-door-leave-active .wax-seal {
  animation: wax-seal-press-crack 0.36s ease;
}
.split-door-leave-active .wax-seal-crack {
  animation: wax-crack-flash 0.4s ease forwards;
}
.split-door-leave-active .wax-seal-piece-1 {
  transition: transform 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, opacity 0.32s ease 0.3s;
  transform: translate(20px, -22px) rotate(38deg);
  opacity: 0;
}
.split-door-leave-active .wax-seal-piece-2 {
  transition: transform 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.14s, opacity 0.32s ease 0.34s;
  transform: translate(-4px, 28px) rotate(-16deg);
  opacity: 0;
}
.split-door-leave-active .wax-seal-piece-3 {
  transition: transform 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s, opacity 0.32s ease 0.38s;
  transform: translate(-24px, -10px) rotate(-40deg);
  opacity: 0;
}
.split-door-leave-active .wax-seal-initials {
  transition: opacity 0.22s ease 0.08s;
  opacity: 0;
}
.split-door-leave-active .wax-crumb {
  /* animation-delay comes from each crumb's own inline style (--delay),
     staggered per-element in the template - nth-of-type isn't safe to use
     here since the wax-seal-piece divs above share the same tag name. */
  animation: wax-crumb-fly 0.55s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

/* Wax-seal doors specifically (not Split Door) wait for the seal to fully
   crack and scatter (press-crack finishes ~0.36s in, the flying pieces
   finish fading ~0.6-0.7s in) before they start sliding, so it reads as a
   real sequence - press, crack, shatter, THEN the doors swing open - rather
   than the doors already moving while the seal is still mid-break. */
.split-door-leave-active .wax-seal-doors .door-left,
.split-door-leave-active .wax-seal-doors .door-right {
  transition-delay: 0.55s;
}

@keyframes wax-seal-press-crack {
  0% { transform: rotate(-3deg) scale(1); }
  30% { transform: rotate(-3deg) scale(0.88); }
  55% { transform: rotate(-7deg) scale(1.08); }
  80% { transform: rotate(2deg) scale(0.98); }
  100% { transform: rotate(-3deg) scale(1); }
}

@keyframes wax-crack-flash {
  0% { opacity: 0; }
  20% { opacity: 1; }
  55% { opacity: 0.8; }
  100% { opacity: 0; }
}

@keyframes wax-crumb-fly {
  0% { opacity: 0; transform: translate(0, 0) scale(1); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--cx), var(--cy)) scale(0.4); }
}

/* 1. Standard Fade Animation */
.envelope-fade-leave-active {
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.envelope-fade-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

/* 3. Slide Open Animations (new, additive - each slides the whole cover
   off screen in its named direction, revealing the card underneath) */
.slide-up-open-leave-active,
.slide-down-open-leave-active,
.slide-left-open-leave-active,
.slide-right-open-leave-active {
  transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.5s ease;
}

.slide-up-open-leave-to {
  transform: translateY(-100%);
  opacity: 0.4;
}

.slide-down-open-leave-to {
  transform: translateY(100%);
  opacity: 0.4;
}

.slide-left-open-leave-to {
  transform: translateX(-100%);
  opacity: 0.4;
}

.slide-right-open-leave-to {
  transform: translateX(100%);
  opacity: 0.4;
}

/* 2. Grand Split Door Animation (also used by Wax Seal) */
.split-door-leave-active {
  transition: opacity 1.35s ease;
}
.split-door-leave-active .door-left {
  transform: translateX(-100%);
  transition: transform 1.2s cubic-bezier(0.65, 0, 0.15, 1);
}
.split-door-leave-active .door-right {
  transform: translateX(100%);
  transition: transform 1.2s cubic-bezier(0.65, 0, 0.15, 1);
}
.split-door-leave-active .content-container {
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 0.4s ease 0.45s, transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.split-door-leave-to {
  opacity: 0;
}

/* Wax Seal only (Split Door keeps the rules above - a full-bleed photo or
   solid door panel stays visually opaque as it slides, so it never showed
   this problem). Wax Seal's own base opacity used to start fading from the
   very first frame with no delay at all, which meant the title text and
   "Tap to open" button were only ever partially transparent - just see-
   through enough that the guest-detail page's own text, already fading in
   underneath, was visible AT THE SAME TIME. Two blocks of real text
   overlapping mid-transition is what actually read as "corrupted" rather
   than a controlled reveal. The fix mirrors Classic Envelope's already-
   working pattern: stay fully opaque (blocking whatever's behind
   completely) while the seal cracks and scatters, THEN dissolve everything
   - background, doors, title, button - together in one clean pass, so
   there's never a moment where both layers of text are legible at once. */
.split-door-leave-active.style-wax-seal {
  /* Vue only removes this element from the DOM once ITS OWN transition ends
     (child transitionend events don't count) - so this has to outlast the
     doors' full 0.55s-delay + 1.2s-duration slide (1.75s) below, or the
     doors would visibly snap away mid-slide instead of finishing. */
  transition: opacity 1.2s ease 0.6s;
}
.split-door-leave-active.style-wax-seal .content-container {
  transition: opacity 0.25s ease 0.6s, transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* --- Confetti Burst Background Animation --- */
/* ==========================================================================
   Confetti Burst: Multi-stage open animation
   1. Content pops and vanishes
   2. Background flashes and expands
   3. Entire overlay fades out
   ========================================================================== */

/* The main overlay transition - waits for the "pop" to finish before fading out */
.confetti-burst-leave-active {
  transition: opacity 0.7s ease 0.5s; 
}

/* Stage 1: The text and button "pop" towards the user, then shrink and fade */
.confetti-burst-leave-active .content-container {
  animation: content-pop-away 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Stage 2: The background flashes and expands outward */
.confetti-burst-leave-active .confetti-burst-bg {
  animation: burst-flash-expand 0.8s ease forwards;
}

/* Stage 3: The whole overlay disappears */
.confetti-burst-leave-to {
  opacity: 0;
}

/* Keyframes for the sequence */
@keyframes content-pop-away {
  0% { transform: scale(1); opacity: 1; }
  40% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.85); opacity: 0; }
}

@keyframes burst-flash-expand {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.05);
    filter: brightness(1.4); /* Flashes brighter */
  }
  100% {
    transform: scale(1.15);
    filter: brightness(1);
    opacity: 0;
  }
}

/* Ambient confetti - falls gently the whole time the envelope is closed
   (previously .confetti-particle had no base CSS at all, so nothing was
   ever visible despite the style's name). */
.confetti-particle {
  position: absolute;
  top: -8%;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  opacity: 0;
  animation: confetti-fall 3.6s linear infinite;
}
.confetti-particle:nth-child(3n) { border-radius: 50%; width: 9px; height: 9px; }
.confetti-particle:nth-child(4n) { width: 6px; height: 12px; }

@keyframes confetti-fall {
  0% { transform: translate3d(0, -10px, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 0.95; }
  88% { opacity: 0.85; }
  100% { transform: translate3d(0, 560px, 0) rotate(480deg); opacity: 0; }
}

.cd-1 { animation-delay: 0s; }
.cd-2 { animation-delay: 0.4s; }
.cd-3 { animation-delay: 0.9s; }
.cd-4 { animation-delay: 1.3s; }
.cd-5 { animation-delay: 1.7s; }
.cd-6 { animation-delay: 2.1s; }
.cd-7 { animation-delay: 0.2s; }
.cd-8 { animation-delay: 0.6s; }
.cd-9 { animation-delay: 1.1s; }
.cd-10 { animation-delay: 1.5s; }
.cd-11 { animation-delay: 1.9s; }
.cd-12 { animation-delay: 2.3s; }

/* Burst particles - invisible until the tap, then pop from a center point
   and fan outward, on top of (not replacing) the ambient particles above,
   so nothing "teleports" mid-fall when the burst starts. */
.confetti-burst-particle {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 7px;
  height: 13px;
  border-radius: 2px;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.6);
}
.confetti-burst-particle:nth-child(3n) { border-radius: 50%; width: 8px; height: 8px; }
.confetti-burst-leave-active .confetti-burst-particle {
  animation: confetti-pop 0.9s cubic-bezier(0.16, 1, 0.3, 1) var(--del, 0s) forwards;
}
@keyframes confetti-pop {
  0%   { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--bx), var(--by)) rotate(var(--brot)) scale(1); opacity: 0; }
}

/* Modern Dark: layered gradient + slowly-drifting blurred blobs (colors
   from the couple's chosen palette, set as CSS vars on the wrapper), a
   faint dot-grain texture, and a thin frame - previously just a flat
   two-blob gradient. */
.modern-dark-bg {
  background: linear-gradient(160deg, var(--md-from), var(--md-via) 55%, var(--md-to));
}
.modern-dark-bg .md-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  mix-blend-mode: screen;
  animation: md-drift 9s ease-in-out infinite;
}
.modern-dark-bg .md-blob-1 { width: 260px; height: 260px; top: -60px; left: -60px; background: var(--md-blob1); }
.modern-dark-bg .md-blob-2 { width: 320px; height: 320px; bottom: -100px; right: -80px; background: var(--md-blob2); animation-delay: -3s; }
.modern-dark-bg .md-blob-3 { width: 180px; height: 180px; top: 40%; right: 10%; background: var(--md-blob1); opacity: 0.5; animation-delay: -6s; }
@keyframes md-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(18px, -14px) scale(1.08); }
}
.modern-dark-bg .md-frame {
  position: absolute;
  inset: 22px;
  border: 1px solid rgba(227, 176, 74, 0.25);
  border-radius: 4px;
  pointer-events: none;
}
.modern-dark-bg .md-grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 3px 3px;
}

/* Minimal Light: same idea as Modern Dark but airy/pastel - a
   couple-selectable palette, softly drifting blobs, and a delicate dashed
   ring for a touch of polish beyond a flat gradient. */
.minimal-light-bg {
  background: linear-gradient(160deg, var(--ml-from), var(--ml-via) 55%, var(--ml-to));
}
.minimal-light-bg .ml-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  mix-blend-mode: multiply;
  opacity: 0.5;
  animation: ml-drift 10s ease-in-out infinite;
}
.minimal-light-bg .ml-blob-1 { width: 220px; height: 220px; top: 5%; left: -40px; background: var(--ml-blob1); }
.minimal-light-bg .ml-blob-2 { width: 260px; height: 260px; bottom: -60px; right: -60px; background: var(--ml-blob2); animation-delay: -5s; }
@keyframes ml-drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(14px, 10px); }
}
.minimal-light-bg .ml-dot-ring {
  position: absolute;
  inset: 20px;
  border-radius: 999px;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .envelope-classic-wrap {
    animation: none;
  }
  .envelope-classic-leave-active .envelope-flap-svg,
  .envelope-classic-leave-active .envelope-inner-card,
  .envelope-classic-leave-active .envelope-body-svg,
  .envelope-classic-leave-active {
    animation-duration: 0.2s;
    animation-delay: 0s;
    transition-duration: 0.2s;
    transition-delay: 0s;
  }

  .split-door-leave-active .wax-seal,
  .split-door-leave-active .wax-seal-crack {
    animation: none;
  }
  .split-door-leave-active .wax-seal-piece-1,
  .split-door-leave-active .wax-seal-piece-2,
  .split-door-leave-active .wax-seal-piece-3,
  .split-door-leave-active .wax-seal-initials,
  .split-door-leave-active .wax-crumb,
  .split-door-leave-active .content-container,
  .split-door-leave-active .door-left,
  .split-door-leave-active .door-right,
  .split-door-leave-active.style-wax-seal,
  .split-door-leave-active.style-wax-seal .content-container {
    animation-duration: 0.2s;
    animation-delay: 0s;
    transition-duration: 0.2s;
    transition-delay: 0s;
  }

  /* ADDED: Disable Confetti pop and flash */
  .confetti-burst-leave-active .content-container,
  .confetti-burst-leave-active .confetti-burst-bg,
  .confetti-burst-leave-active .confetti-burst-particle {
    animation: none;
    transition-duration: 0.2s;
    transition-delay: 0s;
  }
  .confetti-burst-leave-active {
    transition-duration: 0.2s;
    transition-delay: 0s;
  }
  .confetti-particle,
  .modern-dark-bg .md-blob,
  .minimal-light-bg .ml-blob {
    animation: none;
  }

  .guest-name-box-animated {
    animation: none;
    clip-path: none;
    opacity: 1;
  }
}
</style>