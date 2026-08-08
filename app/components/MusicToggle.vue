<template>
  <UButton
    :icon="playing ? 'i-heroicons-speaker-wave' : 'i-heroicons-speaker-x-mark'"
    color="neutral"
    variant="soft"
    size="sm"
    class="rounded-full backdrop-blur bg-white/10 hover:bg-white/20 ring-1 ring-gold-300/40"
    :aria-pressed="playing"
    :aria-label="playing ? 'Pause background music' : 'Play background music'"
    @click="toggle"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ src?: string; autoplay?: boolean }>(), {
  src: '/audio/bgm.mp3',
  autoplay: false
})

const playing = ref(false)
let audio: HTMLAudioElement | null = null

onMounted(() => {
  if (!import.meta.client) return
  audio = new Audio(props.src)
  audio.loop = true
  audio.volume = 0.35
  audio.addEventListener('play', () => (playing.value = true))
  audio.addEventListener('pause', () => (playing.value = false))

  if (props.autoplay) {
    audio.play().catch(() => {
      // Autoplay was blocked \u2014 that's expected until the guest interacts with the page
    })
  }
})

function toggle() {
  if (!audio) return
  if (playing.value) {
    audio.pause()
  } else {
    audio.play().catch(() => {
      // No audio file at /public/audio/bgm.mp3 yet, or playback was blocked
    })
  }
}

function play() {
  if (!playing.value) toggle()
}

onBeforeUnmount(() => {
  audio?.pause()
  audio = null
})

defineExpose({ play })
</script>
