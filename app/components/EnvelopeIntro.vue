<template>
  <Transition :name="transitionName">
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

      <!-- Classic Envelope Default Background -->
      <div v-else class="absolute inset-0 z-0 bg-gradient-to-br" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }"></div>

      <!-- Content Container (Fades out smoothly during door split) -->
      <div class="content-container relative z-20 w-full max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center animate-fade-up">
        
        <!-- Classic Envelope SVG -->
        <svg v-if="content.openingStyle === 'classic'" viewBox="0 0 200 140" class="envelope-svg mb-8" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="18" width="188" height="112" rx="8" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" />
          <path d="M10 22 L100 92 L190 22" fill="none" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
          <circle cx="100" cy="70" r="16" fill="var(--theme-accent, #d4a017)" stroke="var(--theme-accent-soft, #f3ddaa)" stroke-width="1.5" />
          <path d="M100 62 L104 70 L100 78 L96 70 Z" fill="var(--theme-bg-to, #3a2705)" />
        </svg>

        <!-- Typography -->
        <p class="font-heading text-5xl sm:text-6xl drop-shadow-lg leading-tight mb-4" :style="textStyleAccent">
          {{ content.openingTitle || "You're Invited" }}
        </p>

        <!-- Dynamic Guest Name Box -->
        <div v-if="guestName" class="mt-4 mb-6 p-4 border border-white/20 rounded-xl backdrop-blur-md min-w-[200px]" :style="guestBoxStyle">
          <p class="text-[0.65rem] uppercase tracking-[0.2em] opacity-80 mb-1" :style="textStyleBase">
            {{ content.openingGreeting || "Dear" }}
          </p>
          <p class="font-display font-semibold text-2xl tracking-wide" :style="textStyleBase">
            {{ guestName }}
          </p>
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
  if (props.content.openingStyle === 'custom-split') return 'split-door'
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

.envelope-svg {
  width: min(70vw, 260px);
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
  animation: envelope-bob 3.5s ease-in-out infinite;
}

@keyframes envelope-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 1. Standard Fade Animation */
.envelope-fade-leave-active {
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.envelope-fade-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

/* 2. Grand Split Door Animation */
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
  .envelope-svg {
    animation: none;
  }
}
</style>