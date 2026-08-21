/**
 * A single, page-independent background-music player shared across an
 * entire wedding site visit (Opening -> Details -> RSVP).
 *
 * Previously each page mounted its own <audio>/YouTube player inside
 * MusicToggle.vue, and destroyed it in onBeforeUnmount - so the music cut
 * out and restarted from zero every time a guest navigated to another page.
 * The actual player now lives here, at module scope, completely outside
 * any single component's lifecycle, so it just keeps running as the guest
 * moves between pages. MusicToggle.vue (mounted fresh on every page) is
 * just a thin remote control: it calls ensurePlaying() on mount, which is a
 * no-op if the singleton is already set up for this wedding's track, and
 * otherwise starts it.
 *
 * This state is intentionally module-level (not inside the exported
 * function) so every component that calls useBackgroundMusic() shares the
 * exact same player and `playing` state for the lifetime of the browser
 * tab - a full page reload naturally resets it, which is correct (the
 * guest would see the envelope intro again from scratch anyway).
 */

const currentSrc = ref<string | null>(null)
const playing = ref(false)

let audio: HTMLAudioElement | null = null
let ytPlayer: any = null
let ytContainer: HTMLDivElement | null = null

function teardownPlayer() {
  audio?.pause()
  audio = null
  ytPlayer?.destroy?.()
  ytPlayer = null
  ytContainer?.remove()
  ytContainer = null
}

function startAudioElement(src: string, autoplay: boolean) {
  audio = new Audio(src)
  audio.loop = true
  audio.volume = 0.35
  audio.addEventListener('play', () => (playing.value = true))
  audio.addEventListener('pause', () => (playing.value = false))

  if (autoplay) {
    audio.play().catch(() => {
      // Autoplay was blocked - expected until the guest actually interacts with the page.
    })
  }
}

async function startYoutubePlayer(videoId: string, autoplay: boolean) {
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
      // "loop" only actually loops when paired with a playlist containing
      // just this one video - a known YouTube IFrame API quirk.
      loop: 1,
      playlist: videoId,
      playsinline: 1
    },
    events: {
      onReady: (event: any) => {
        event.target.setVolume(35)
        if (autoplay) event.target.playVideo()
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

/**
 * Makes sure the singleton is playing `src`. If it's already set up for
 * this exact src - the common case, since every page of the same wedding
 * passes the same wedding.content.audioSrc - this is a no-op that leaves
 * whatever's currently playing/paused exactly as it is, so navigating
 * between pages never interrupts or force-restarts the track, and never
 * overrides a guest who's deliberately paused it. Only tears down and
 * rebuilds the player when the src genuinely changes.
 */
function ensurePlaying(src: string | undefined | null, autoplay = false) {
  if (!import.meta.client) return
  const next = src || null
  if (next === currentSrc.value && (audio || ytPlayer)) return

  teardownPlayer()
  currentSrc.value = next
  playing.value = false
  if (!next) return

  const videoId = extractYoutubeVideoId(next)
  if (videoId) startYoutubePlayer(videoId, autoplay)
  else startAudioElement(next, autoplay)
}

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
      // Blocked or no track loaded yet.
    })
  }
}

export function useBackgroundMusic() {
  return { playing, ensurePlaying, toggle }
}
