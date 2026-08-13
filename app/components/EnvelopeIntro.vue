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
          <img :src="content.openingBgUrl" class="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover" />
          <div class="absolute inset-0 bg-black/40 border-r border-white/20 shadow-[5px_0_15px_rgba(0,0,0,0.4)]"></div>
        </div>
        <!-- Right Door -->
        <div class="relative w-1/2 h-full overflow-hidden door-right z-10">
          <img :src="content.openingBgUrl" class="absolute top-0 right-0 w-[200%] h-full max-w-none object-cover" />
          <div class="absolute inset-0 bg-black/40 border-l border-white/20 shadow-[-5px_0_15px_rgba(0,0,0,0.4)]"></div>
        </div>
      </div>

      <!-- Custom Canva Background Image (Standard Fade) -->
      <div v-else-if="content.openingStyle === 'custom' && content.openingBgUrl" class="absolute inset-0 z-0">
        <img :src="content.openingBgUrl" alt="Cover Background" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Modern Dark Floral Gradient -->
      <div v-else-if="content.openingStyle === 'modern-dark'" class="absolute inset-0 z-0 bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#020c1b]">
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#1d4ed8] rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#e3b04a] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
      </div>

      <!-- Restored Minimal Light Gradient -->
      <div v-else-if="content.openingStyle === 'minimal-light'" class="absolute inset-0 z-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]">
         <div class="absolute top-10 left-10 w-48 h-48 bg-[#93c5fd] rounded-full mix-blend-multiply filter blur-[60px] opacity-40"></div>
      </div>

      <!-- Wax Seal Card - same sliding double-door mechanic as Split Door, so
           it can show the uploaded cover picture sliced in half behind the
           seal. Falls back to an elegant gradient panel when no picture has
           been uploaded. The seal itself lives in the content container
           below so it doesn't fight the title/greeting box for space. -->
      <div v-else-if="content.openingStyle === 'wax-seal'" class="absolute inset-0 z-0 flex wax-seal-doors">
        <template v-if="content.openingBgUrl">
          <div class="relative w-1/2 h-full overflow-hidden door-left">
            <img :src="content.openingBgUrl" class="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover" />
            <div class="absolute inset-0 bg-black/45"></div>
          </div>
          <div class="relative w-1/2 h-full overflow-hidden door-right">
            <img :src="content.openingBgUrl" class="absolute top-0 right-0 w-[200%] h-full max-w-none object-cover" />
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
      <div v-else-if="isSlideStyle && content.openingBgUrl" class="absolute inset-0 z-0">
        <img :src="content.openingBgUrl" alt="Cover Background" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Confetti Burst Background -->
      <div v-else-if="content.openingStyle === 'confetti-burst'" class="absolute inset-0 z-0 confetti-burst-bg overflow-hidden" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }">
        <!-- Optional uploaded background image -->
        <img v-if="content.openingBgUrl" :src="content.openingBgUrl" alt="Cover Background" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        
        <!-- Animated Confetti Particles -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="confetti-particle bg-pink-400 left-[10%] animate-delay-100"></div>
          <div class="confetti-particle bg-blue-400 left-[25%] animate-delay-300"></div>
          <div class="confetti-particle bg-yellow-400 left-[40%] animate-delay-500"></div>
          <div class="confetti-particle bg-green-400 left-[55%] animate-delay-200"></div>
          <div class="confetti-particle bg-purple-400 left-[70%] animate-delay-600"></div>
          <div class="confetti-particle bg-red-400 left-[85%] animate-delay-400"></div>
        </div>
      </div>

      <!-- Fallback Gradient Background (Slide styles without a picture, and
           anything else not covered above) -->
      <div v-else class="absolute inset-0 z-0 bg-gradient-to-br" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }"></div>

      <!-- Content Container (Fades out smoothly during door split) -->
      <div class="content-container relative z-20 w-full max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center animate-fade-up">
        
        <!-- Classic Envelope: flap hinges open, revealing a card that emerges and grows -->
        <div v-if="content.openingStyle === 'classic'" class="envelope-classic-wrap mb-8">
          <div class="envelope-inner-card" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from, #0d2a4a), var(--theme-bg-to, #04101f))`, borderColor: 'var(--theme-accent, #e3b04a)' }">
            <UIcon name="i-heroicons-heart" class="w-6 h-6" :style="textStyleAccent" />
          </div>
          <svg viewBox="0 0 200 140" class="envelope-body-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="18" width="188" height="112" rx="8" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" />
            <path d="M10 92 L100 40 L190 92" fill="none" stroke="var(--theme-accent, #e3b04a)" stroke-width="1.5" opacity="0.35" />
          </svg>
          <svg viewBox="0 0 200 140" class="envelope-flap-svg" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18 L194 18 L100 92 Z" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" stroke-linejoin="round" />
            <circle cx="100" cy="52" r="13" fill="var(--theme-accent, #d4a017)" stroke="var(--theme-accent-soft, #f3ddaa)" stroke-width="1.5" />
            <path d="M100 45 L104 52 L100 59 L96 52 Z" fill="var(--theme-bg-to, #3a2705)" />
          </svg>
        </div>

        <!-- Wax Seal: a real pressed-wax blob (irregular border-radius, not a
             perfect circle) with the couple's initials engraved in it. It's
             split into two clipped halves along a jagged seam so that on
             open it visibly cracks and the two pieces fly apart, instead of
             just shrinking away like a generic badge. -->
        <div v-if="content.openingStyle === 'wax-seal'" class="wax-seal mb-6">
          <div class="wax-seal-piece wax-seal-piece-left">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <div class="wax-seal-piece wax-seal-piece-right">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <svg class="wax-seal-crack" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M50,1 L42,14 L58,27 L38,40 L60,53 L40,67 L58,81 L50,99" />
          </svg>
          <span class="wax-seal-initials">{{ sealInitials }}</span>
        </div>

        <!-- Typography -->
        <p class="font-heading text-5xl sm:text-6xl leading-tight mb-4" :style="[textStyleAccent, titleShadow, titleStyle]">
          {{ content.openingTitle || "You're Invited" }}
        </p>

        <!-- Dynamic Guest Name Box -->
        <div v-if="guestName" class="mt-4 mb-6 p-5 border border-white/20 rounded-xl backdrop-blur-md min-w-[200px] max-w-[300px] flex flex-col items-center gap-1.5" :style="guestBoxStyle">
          <p v-if="greetingParts.before" class="text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="[textStyleBase, titleShadow, greetingStyle]">{{ greetingParts.before }}</p>
          <p class="font-display font-semibold text-2xl sm:text-3xl leading-tight" :style="[textStyleBase, titleShadow, greetingStyle]">{{ guestName }}</p>
          <p v-if="greetingParts.after" class="text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="[textStyleBase, titleShadow, greetingStyle]">{{ greetingParts.after }}</p>
        </div>

        <button class="mt-8 flex flex-col items-center gap-2 group focus:outline-none">
          <span class="text-sm tracking-[0.25em] uppercase font-bold transition-all group-hover:scale-105" :style="[textStyleBase, titleShadow, actionStyle]">
            {{ content.openingActionText || "Tap to open" }}
          </span>
          <UIcon name="i-heroicons-chevron-double-down" class="w-5 h-5 animate-bounce mt-1" :style="textStyleAccent" />
        </button>

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
  if (props.content.openingStyle === 'minimal-light') return 'text-slate-800'
  return 'text-white'
})

const isSlideStyle = computed(() =>
  ['slide-up', 'slide-down', 'slide-left', 'slide-right'].includes(props.content.openingStyle)
)

const textStyleAccent = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: props.content.customAccent || 'var(--theme-accent, #8a6d3b)' }
  return { color: props.content.customAccent || 'var(--theme-accent, #f3ddaa)' }
})

const textStyleBase = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: '#1e293b' }
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
    const links: Array<{ rel: string; href: string }> = []
    const urls = [props.content.openingTitleFontUrl, props.content.openingGreetingFontUrl, props.content.openingActionFontUrl]
    for (const url of urls) {
      if (url && !url.includes('fonts.google.com/specimen/')) {
        links.push({ rel: 'stylesheet', href: url })
      }
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

const greetingParts = computed(() => {
  const raw = props.content.openingGreeting || 'Dear'
  if (raw.includes('{guestName}')) {
    const [before, after] = raw.split('{guestName}')
    return { before: before.trim(), after: after.trim() }
  }
  // Old-style plain prefix (e.g. saved as just "Menjemput") - render before the name, nothing after
  return { before: raw.trim(), after: '' }
})

const guestBoxStyle = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(0, 0, 0, 0.1)' }
  return { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)' }
})
</script>

<style scoped>
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

.envelope-inner-card {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 62%;
  height: 60%;
  transform: translate(-50%, -50%) scale(0.9);
  border-radius: 0.5rem;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  z-index: 4;
}

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
  opacity: 1;
  transform: translate(-50%, -70%) scale(1.4);
  transition: opacity 0.5s ease 0.3s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
}
.envelope-classic-leave-active .envelope-body-svg {
  opacity: 0;
  transition: opacity 0.4s ease 0.5s;
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

/* Both halves share the exact same jagged boundary, so together (closed
   state) they read as one unbroken seal - only on open do they separate
   along it. Coordinates match the .wax-seal-crack path below 1:1. */
.wax-seal-piece-left {
  clip-path: polygon(0% 0%, 50% 0%, 42% 14%, 58% 27%, 38% 40%, 60% 53%, 40% 67%, 58% 81%, 50% 100%, 0% 100%);
}

.wax-seal-piece-right {
  clip-path: polygon(100% 0%, 50% 0%, 42% 14%, 58% 27%, 38% 40%, 60% 53%, 40% 67%, 58% 81%, 50% 100%, 100% 100%);
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

/* Open sequence: the seal shakes and cracks first, then splits into two
   pieces that fly apart in opposite directions and fade, while the doors
   behind it (see .wax-seal-doors below) get a short beat before sliding
   open - so it reads as "the seal breaks, then the doors swing open"
   rather than everything happening at once. */
.split-door-leave-active .wax-seal {
  animation: wax-seal-shake 0.28s ease;
}
.split-door-leave-active .wax-seal-crack {
  animation: wax-crack-flash 0.4s ease forwards;
}
.split-door-leave-active .wax-seal-piece-left {
  transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s, opacity 0.3s ease 0.28s;
  transform: translate(-22px, -14px) rotate(-24deg);
  opacity: 0;
}
.split-door-leave-active .wax-seal-piece-right {
  transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.11s, opacity 0.3s ease 0.31s;
  transform: translate(22px, 12px) rotate(20deg);
  opacity: 0;
}
.split-door-leave-active .wax-seal-initials {
  transition: opacity 0.25s ease 0.1s;
  opacity: 0;
}

/* Wax-seal doors specifically (not Split Door) wait a beat for the seal to
   crack before they start sliding, and the title/guest box/button hold
   steady until the seal has finished breaking apart instead of fading out
   underneath it. */
.split-door-leave-active .wax-seal-doors .door-left,
.split-door-leave-active .wax-seal-doors .door-right {
  transition-delay: 0.12s;
}

@keyframes wax-seal-shake {
  0% { transform: rotate(-3deg) scale(1); }
  35% { transform: rotate(-6deg) scale(1.06); }
  70% { transform: rotate(1deg) scale(0.97); }
  100% { transform: rotate(-3deg) scale(1); }
}

@keyframes wax-crack-flash {
  0% { opacity: 0; }
  25% { opacity: 1; }
  60% { opacity: 0.75; }
  100% { opacity: 0; }
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

@media (prefers-reduced-motion: reduce) {
  .envelope-classic-wrap {
    animation: none;
  }
  .envelope-classic-leave-active .envelope-flap-svg,
  .envelope-classic-leave-active .envelope-inner-card,
  .envelope-classic-leave-active .envelope-body-svg,
  .envelope-classic-leave-active {
    transition-duration: 0.2s;
    transition-delay: 0s;
  }

  .split-door-leave-active .wax-seal,
  .split-door-leave-active .wax-seal-crack {
    animation: none;
  }
  .split-door-leave-active .wax-seal-piece-left,
  .split-door-leave-active .wax-seal-piece-right,
  .split-door-leave-active .wax-seal-initials,
  .split-door-leave-active .content-container,
  .split-door-leave-active .door-left,
  .split-door-leave-active .door-right {
    transition-duration: 0.2s;
    transition-delay: 0s;
  }

  /* ADDED: Disable Confetti pop and flash */
  .confetti-burst-leave-active .content-container,
  .confetti-burst-leave-active .confetti-burst-bg {
    animation: none;
    transition-duration: 0.2s;
    transition-delay: 0s;
  }
  .confetti-burst-leave-active {
    transition-duration: 0.2s;
    transition-delay: 0s;
  }
}
</style>