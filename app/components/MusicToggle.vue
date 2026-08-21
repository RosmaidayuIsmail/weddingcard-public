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
// Set only when `src` is a YouTube/YouTube Music link - plays through
// YouTube's own hidden embedded player instead of a plain <audio> element,
// since YouTube doesn't expose (and doesn't allow extracting) a raw audio
// file URL. See useYoutubeAudio.ts for the link-parsing/API-loading logic.
let ytPlayer: any = null
let ytContainer: HTMLDivElement | null = null

function teardown() {
  audio?.pause()
  audio = null
  ytPlayer?.destroy?.()
  ytPlayer = null
  ytContainer?.remove()
  ytContainer = null
  playing.value = false
}

function setupAudioElement(src: string) {
  audio = new Audio(src)
  audio.loop = true
  audio.volume = 0.35
  audio.addEventListener('play', () => (playing.value = true))
  audio.addEventListener('pause', () => (playing.value = false))

  if (props.autoplay) {
    audio.play().catch(() => {
      // Autoplay was blocked \u2014 that's expected until the guest interacts with the page
    })
  }
}

async function setupYoutubePlayer(videoId: string) {
  await loadYoutubeIframeApi()
  if (!import.meta.client || !window.YT?.Player) return

  // Hidden off-screen player - only the audio is meant to reach guests,
  // the video track itself is never shown.
  ytContainer = document.createElement('div')
  ytContainer.style.position = 'fixed'
  ytContainer.style.width = '1px'
  ytContainer.style.height = '1px'
  ytContainer.style.opacity = '0'
  ytContainer.style.pointerEvents = 'none'
  document.body.appendChild(ytContainer)

  ytPlayer = new window.YT.Player(ytContainer, {
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      // The "loop" playerVar only actually loops when paired with a
      // playlist containing just this one video - a known YouTube quirk.
      loop: 1,
      playlist: videoId,
      playsinline: 1
    },
    events: {
      onReady: (event: any) => {
        event.target.setVolume(35)
        if (props.autoplay) event.target.playVideo()
      },
      onStateChange: (event: any) => {
        // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
        if (event.data === 1) playing.value = true
        else if (event.data === 2 || event.data === 0) playing.value = false
        if (event.data === 0) {
          // Fallback in case a browser doesn't honor the loop/playlist trick above.
          event.target.seekTo(0)
          event.target.playVideo()
        }
      },
      onError: () => {
        // e.g. the video's owner has disabled embedding elsewhere, or it's
        // private/deleted - fail silently, same as a broken direct audio URL.
        playing.value = false
      }
    }
  })
}

function setup() {
  if (!import.meta.client || !props.src) return
  const videoId = extractYoutubeVideoId(props.src)
  if (videoId) setupYoutubePlayer(videoId)
  else setupAudioElement(props.src)
}

onMounted(setup)

// The Design Studio / Opening Design editors bind :src to a live form field,
// so a couple pasting a new link should swap the player without needing to
// leave and re-enter the page.
watch(
  () => props.src,
  () => {
    teardown()
    setup()
  }
)

function toggle() {
  if (ytPlayer) {
    if (playing.value) ytPlayer.pauseVideo()
    else ytPlayer.playVideo()
    return
  }
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

onBeforeUnmount(teardown)

defineExpose({ play })
</script>
