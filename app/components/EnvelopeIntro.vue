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

      <!-- Wax Seal Card (new style) - a solid two-panel card with a seal at the
           center seam; reuses the same split-open mechanic as Canva Split Door -->
      <div v-else-if="content.openingStyle === 'wax-seal'" class="absolute inset-0 z-0 flex" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from, #0d2a4a), var(--theme-bg-via, #142a45) 60%, var(--theme-bg-to, #04101f))` }">
        <div class="relative w-1/2 h-full door-left flex items-center justify-end pr-1">
          <div class="w-full h-[68%] rounded-l-2xl border-y-2 border-l-2" :style="{ borderColor: 'var(--theme-accent, #e3b04a)' }"></div>
        </div>
        <div class="relative w-1/2 h-full door-right flex items-center justify-start pl-1">
          <div class="w-full h-[68%] rounded-r-2xl border-y-2 border-r-2" :style="{ borderColor: 'var(--theme-accent, #e3b04a)' }"></div>
        </div>
        <div class="wax-seal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div class="wax-seal-circle" :style="{ background: `radial-gradient(circle at 35% 30%, var(--theme-accent-soft, #f3ddaa), var(--theme-accent, #d4a017))` }">
            <UIcon name="i-heroicons-heart" class="w-6 h-6" style="color: rgba(0,0,0,0.45);" />
          </div>
        </div>
      </div>

      <!-- Classic Envelope Default Background -->
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

        <!-- Typography -->
        <p class="font-heading text-5xl sm:text-6xl drop-shadow-lg leading-tight mb-4" :style="textStyleAccent">
          {{ content.openingTitle || "You're Invited" }}
        </p>

        <!-- Dynamic Guest Name Box -->
        <div v-if="guestName" class="mt-4 mb-6 p-5 border border-white/20 rounded-xl backdrop-blur-md min-w-[200px] max-w-[300px] flex flex-col items-center gap-1.5" :style="guestBoxStyle">
          <p v-if="greetingParts.before" class="text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="textStyleBase">{{ greetingParts.before }}</p>
          <p class="font-display font-semibold text-2xl sm:text-3xl leading-tight" :style="textStyleBase">{{ guestName }}</p>
          <p v-if="greetingParts.after" class="text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="textStyleBase">{{ greetingParts.after }}</p>
        </div>

        <button class="mt-8 flex flex-col items-center gap-2 group focus:outline-none">
          <span class="text-sm tracking-[0.25em] uppercase font-bold transition-all group-hover:scale-105" :style="textStyleBase">
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
  if (props.content.openingStyle === 'custom-split' || props.content.openingStyle === 'wax-seal') return 'split-door'
  if (props.content.openingStyle === 'classic') return 'envelope-classic'
  return 'envelope-fade'
})

const overlayClass = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return 'text-slate-800'
  return 'text-white'
})

const textStyleAccent = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: props.content.customAccent || 'var(--theme-accent, #8a6d3b)' }
  return { color: props.content.customAccent || 'var(--theme-accent, #f3ddaa)' }
})

const textStyleBase = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: '#1e293b' }
  return { color: '#ffffff' }
})

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

/* Wax Seal */
.wax-seal-circle {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.split-door-leave-active .wax-seal {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.3) rotate(25deg);
  transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 1. Standard Fade Animation */
.envelope-fade-leave-active {
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.envelope-fade-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

/* 2. Grand Split Door Animation (also used by Wax Seal) */
.split-door-leave-active {
  transition: opacity 1.2s ease;
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
  transform: scale(1.1);
  transition: opacity 0.3s ease, transform 0.8s ease-out;
}
.split-door-leave-to {
  opacity: 0;
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
}
</style>