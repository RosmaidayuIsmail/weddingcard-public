<template>
  <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">

    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" style="color: #e3b04a;" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading Studio...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-video-camera" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">Couldn't find that wedding.</p>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
      <!-- Header -->
      <div class="mb-6 shrink-0 pt-4 lg:pt-0">
        <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
          Promo Video
        </h1>
        <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
          <UIcon name="i-heroicons-video-camera" class="w-4 h-4" style="color: #e3b04a;" />
          Record the real, live mobile invite as an HD MP4 you can use for marketing.
        </p>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">

        <!-- Left Column: Controls -->
        <div class="flex-1 w-full lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-6 order-2 lg:order-1">

          <div class="space-y-6 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div>
              <h3 class="text-sm font-semibold text-white mb-3">What to record</h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="p-3 rounded-lg border text-sm font-medium transition-colors"
                  :class="previewMode === 'classic' ? 'border-gold-400 bg-gold-400/10 text-gold-200' : 'border-gray-700 text-gray-300 hover:border-gray-600'"
                  :disabled="recordingState !== 'idle'"
                  @click="previewMode = 'classic'"
                >
                  Classic Invite
                </button>
                <button
                  v-if="wedding.vipEnabled"
                  type="button"
                  class="p-3 rounded-lg border text-sm font-medium transition-colors"
                  :class="previewMode === 'vip' ? 'border-gold-400 bg-gold-400/10 text-gold-200' : 'border-gray-700 text-gray-300 hover:border-gray-600'"
                  :disabled="recordingState !== 'idle'"
                  @click="previewMode = 'vip'"
                >
                  VIP Cinematic
                </button>
              </div>
            </div>

            <UFormField label="Guest name shown in the preview">
              <UInput v-model="previewGuestName" placeholder="e.g. Ahmad &amp; Family" size="lg" class="w-full" :disabled="recordingState !== 'idle'" />
              <template #help><span class="text-xs text-gray-500">This is just for the recording - it doesn't send or affect any real guest.</span></template>
            </UFormField>

            <UButton variant="soft" color="gray" size="sm" icon="i-heroicons-arrow-path" :disabled="recordingState !== 'idle'" @click="reloadPreview">
              Reset preview
            </UButton>

            <div class="pt-6 border-t border-gray-800 space-y-4">
              <h3 class="text-sm font-semibold text-white">Record</h3>

              <div v-if="recordingState === 'idle'" class="space-y-3">
                <p class="text-xs text-gray-400 leading-relaxed">
                  Click Start, then when your browser asks what to share, choose <strong class="text-gray-200">This Tab</strong> (Chrome/Edge) or <strong class="text-gray-200">this browser window</strong> (Safari/Firefox) - sharing a different tab, window, or your whole screen will crop the video incorrectly. Keep this tab visible while recording, and interact with the phone preview on the right exactly like a guest would - tap to open the envelope, scroll through it. Click Stop when you're done.
                </p>
                <UButton size="lg" color="primary" icon="i-heroicons-video-camera" class="w-full font-semibold" @click="startRecording">
                  Start Recording
                </UButton>
              </div>

              <div v-else-if="recordingState === 'requesting'" class="flex items-center gap-3 text-sm text-gray-400">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" /> Waiting for you to choose what to share...
              </div>

              <div v-else-if="recordingState === 'recording'" class="space-y-3">
                <div class="flex items-center gap-2 text-sm font-medium text-red-400">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  Recording - {{ formattedElapsed }}
                </div>
                <UButton size="lg" color="error" variant="soft" icon="i-heroicons-stop" class="w-full font-semibold" @click="stopRecording">
                  Stop Recording
                </UButton>
              </div>

              <div v-else-if="recordingState === 'converting'" class="space-y-3">
                <div class="flex items-center gap-2 text-sm text-gray-300">
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" /> {{ conversionLabel }}
                </div>
                <div class="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div class="h-full bg-gold-400 transition-all duration-300" :style="{ width: `${Math.round(conversionProgress * 100)}%` }"></div>
                </div>
              </div>

              <div v-else-if="recordingState === 'ready'" class="space-y-4">
                <div class="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Ready to download
                </div>
                <video v-if="downloadUrl" :src="downloadUrl" controls class="w-full rounded-lg border border-gray-700 max-h-64" />
                <div class="flex flex-wrap gap-2">
                  <UButton size="lg" color="primary" icon="i-heroicons-arrow-down-tray" class="font-semibold" :href="downloadUrl" :download="downloadFilename" tag="a">
                    Download {{ downloadIsFallback ? 'WebM' : 'MP4' }}
                  </UButton>
                  <UButton size="lg" variant="soft" color="gray" icon="i-heroicons-video-camera" @click="resetToIdle">
                    Record Again
                  </UButton>
                </div>
              </div>

              <p v-if="errorMessage" class="text-xs" :class="recordingState === 'ready' ? 'text-amber-400' : 'text-red-400'">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Mobile Preview (the real guest-facing page) -->
        <div class="w-full lg:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
            </p>
          </div>

          <!-- Smartphone Mockup Wrapper - this is the exact region that gets
               cropped out of the screen-share and recorded, so its size here
               (390x844, roughly iPhone-sized) is also the output video's
               resolution before HD upscaling from the capture. -->
          <div ref="frameEl" class="phone-bezel shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <iframe
              :key="previewReloadKey"
              :src="previewUrl"
              class="phone-screen"
              title="Live guest preview"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
const { wedding, loading } = useMyWedding(weddingId)

const previewMode = ref<'classic' | 'vip'>('classic')
const previewGuestName = ref('Ahmad & Family')
const previewReloadKey = ref(0)
const frameEl = ref<HTMLElement | null>(null)

const previewUrl = computed(() => {
  if (!wedding.value) return 'about:blank'
  const base = `/w/${wedding.value.slug}${previewMode.value === 'vip' ? '/vip' : ''}`
  const name = previewGuestName.value.trim()
  return name ? `${base}?to=${encodeURIComponent(name)}` : base
})

function reloadPreview() {
  previewReloadKey.value++
}

// --- Recording -------------------------------------------------------
// One-click screen-recording of the phone preview above, entirely in the
// browser: capture "this tab" via getDisplayMedia, redraw just the phone
// frame's region onto an offscreen canvas every frame (so the output is
// cropped to exactly the phone, not the whole dashboard), record that
// canvas with MediaRecorder, then transcode the result from WebM to MP4
// with ffmpeg.wasm (loaded from a CDN at record time - not a build
// dependency) so the download works natively on phones and social apps
// that don't like WebM.

type RecordingState = 'idle' | 'requesting' | 'recording' | 'converting' | 'ready'
const recordingState = ref<RecordingState>('idle')
const elapsedSeconds = ref(0)
const conversionProgress = ref(0)
const conversionLabel = ref('Converting to MP4...')
const errorMessage = ref('')
const downloadUrl = ref('')
const downloadFilename = ref('')
const downloadIsFallback = ref(false)

const formattedElapsed = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

let displayStream: MediaStream | null = null
let sourceVideo: HTMLVideoElement | null = null
let outputCanvas: HTMLCanvasElement | null = null
let recorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let rafId = 0
let timerInterval: ReturnType<typeof setInterval> | null = null

function resetToIdle() {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
  downloadUrl.value = ''
  downloadFilename.value = ''
  downloadIsFallback.value = false
  errorMessage.value = ''
  conversionProgress.value = 0
  recordingState.value = 'idle'
  reloadPreview()
}

async function startRecording() {
  errorMessage.value = ''
  recordingState.value = 'requesting'

  try {
    // preferCurrentTab/selfBrowserSurface are Chrome-only hints that
    // streamline the share picker toward "this tab" - harmless no-ops on
    // browsers that don't recognize them.
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
        width: { ideal: 2560 },
        height: { ideal: 1440 },
        frameRate: { ideal: 30 }
      } as MediaTrackConstraints,
      audio: false,
      // @ts-expect-error Chrome-only extensions to getDisplayMedia, not in the lib.dom types yet
      preferCurrentTab: true,
      selfBrowserSurface: 'include'
    })
  } catch (err: any) {
    recordingState.value = 'idle'
    errorMessage.value = err?.name === 'NotAllowedError'
      ? "Recording wasn't started - you closed the share dialog or denied permission. Click Start Recording to try again."
      : `Couldn't start recording: ${err?.message || err}`
    return
  }

  if (!frameEl.value) {
    recordingState.value = 'idle'
    errorMessage.value = 'Preview frame not ready - try again in a moment.'
    displayStream.getTracks().forEach((t) => t.stop())
    return
  }

  // If she picked something other than "This Tab" in the share dialog -
  // her whole screen, a different window, another tab - there is no
  // reliable way to know where the phone frame even is inside that
  // capture, and guessing produced exactly the "recording my full screen"
  // bug this replaces. Fail loud with a fixable instruction instead of
  // silently recording the wrong thing.
  const track = displayStream.getVideoTracks()[0]
  const settings = track.getSettings() as MediaTrackSettings & { displaySurface?: string }
  if (settings.displaySurface && settings.displaySurface !== 'browser') {
    displayStream.getTracks().forEach((t) => t.stop())
    recordingState.value = 'idle'
    errorMessage.value = "That shared your whole screen or a different window, not this tab, so it can't be cropped to just the phone. Click Start Recording again and choose \"This Tab\" (Chrome/Edge) or \"this browser window\" (Safari/Firefox) in the share dialog."
    return
  }

  // Chrome 125+: Region Capture crops the stream itself to exactly this
  // element's rendered area, at the browser level - no coordinate math to
  // get wrong. Falls back to a manual crop (below) on browsers that don't
  // support it yet.
  const CropTargetCtor = (window as any).CropTarget
  if (CropTargetCtor && typeof track.cropTo === 'function') {
    try {
      const cropTarget = await CropTargetCtor.fromElement(frameEl.value)
      await track.cropTo(cropTarget)
    } catch {
      // Element wasn't croppable for some reason - manual crop below still
      // works since we've already confirmed this is a same-tab capture.
    }
  }

  sourceVideo = document.createElement('video')
  sourceVideo.muted = true
  sourceVideo.srcObject = displayStream
  await sourceVideo.play()
  if (sourceVideo.readyState < 2) {
    await new Promise<void>((resolve) => { sourceVideo!.onloadedmetadata = () => resolve() })
  }

  const nativelyCropped = !!(CropTargetCtor && typeof track.cropTo === 'function')
  let crop: { x: number; y: number; w: number; h: number }
  if (nativelyCropped) {
    // The video's own frames are already just the phone region - draw them
    // through as-is.
    crop = { x: 0, y: 0, w: sourceVideo.videoWidth, h: sourceVideo.videoHeight }
  } else {
    // Manual fallback: ratio between the captured tab's actual pixel size
    // and this page's CSS viewport size - safe now that displaySurface is
    // confirmed to be 'browser' (this tab), so the two coordinate spaces
    // actually correspond.
    const scaleX = sourceVideo.videoWidth / window.innerWidth
    const scaleY = sourceVideo.videoHeight / window.innerHeight
    const rect = frameEl.value.getBoundingClientRect()
    crop = {
      x: Math.max(0, Math.round(rect.left * scaleX)),
      y: Math.max(0, Math.round(rect.top * scaleY)),
      w: Math.max(2, Math.round(Math.min(sourceVideo.videoWidth - rect.left * scaleX, rect.width * scaleX))),
      h: Math.max(2, Math.round(Math.min(sourceVideo.videoHeight - rect.top * scaleY, rect.height * scaleY)))
    }
  }

  outputCanvas = document.createElement('canvas')
  outputCanvas.width = crop.w
  outputCanvas.height = crop.h
  const ctx = outputCanvas.getContext('2d')!

  const drawFrame = () => {
    if (sourceVideo) ctx.drawImage(sourceVideo, crop.x, crop.y, crop.w, crop.h, 0, 0, outputCanvas!.width, outputCanvas!.height)
    rafId = requestAnimationFrame(drawFrame)
  }
  drawFrame()

  const canvasStream = outputCanvas.captureStream(30)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  recordedChunks = []
  recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 8_000_000 })
  recorder.ondataavailable = (e) => { if (e.data.size) recordedChunks.push(e.data) }
  recorder.onstop = handleRecordingStopped
  recorder.start()

  // If she stops sharing via the browser's own "Stop sharing" pill instead
  // of our button, treat that exactly like clicking Stop.
  displayStream.getVideoTracks()[0].addEventListener('ended', () => {
    if (recordingState.value === 'recording') stopRecording()
  })

  recordingState.value = 'recording'
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => { elapsedSeconds.value++ }, 1000)
}

function stopRecording() {
  if (recordingState.value !== 'recording') return
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  cancelAnimationFrame(rafId)
  displayStream?.getTracks().forEach((t) => t.stop())
  recordingState.value = 'converting'
  conversionLabel.value = 'Finishing recording...'
  conversionProgress.value = 0
  recorder?.stop()
}

async function handleRecordingStopped() {
  const webmBlob = new Blob(recordedChunks, { type: 'video/webm' })
  sourceVideo = null
  outputCanvas = null

  try {
    conversionLabel.value = 'Loading video encoder...'
    const mp4Blob = await convertWebmToMp4(webmBlob, (ratio) => {
      conversionLabel.value = 'Converting to MP4...'
      conversionProgress.value = Math.min(1, Math.max(0, ratio))
    })
    downloadUrl.value = URL.createObjectURL(mp4Blob)
    downloadFilename.value = `${wedding.value?.slug || 'wedding'}-promo-${previewMode.value}.mp4`
    downloadIsFallback.value = false
  } catch (err) {
    // MP4 conversion is a nice-to-have on top of a recording that already
    // succeeded - if it fails for any reason (e.g. the CDN encoder
    // couldn't load), hand back the raw WebM rather than losing the take.
    downloadUrl.value = URL.createObjectURL(webmBlob)
    downloadFilename.value = `${wedding.value?.slug || 'wedding'}-promo-${previewMode.value}.webm`
    downloadIsFallback.value = true
    errorMessage.value = "Couldn't convert to MP4, so here's the recording as WebM instead - it plays in most browsers and video editors, just not natively on all phones/social apps. Try again for an MP4."
  }
  recordingState.value = 'ready'
}

// ffmpeg.wasm is loaded from a CDN at record time (not an npm dependency),
// so using this feature never requires a build/deploy step of its own -
// the single-threaded core is used deliberately since it works without the
// cross-origin-isolation headers this app doesn't set.
let ffmpegInstance: any = null
async function getFfmpeg() {
  if (ffmpegInstance) return ffmpegInstance
  const { FFmpeg } = await import(/* @vite-ignore */ 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js')
  const { toBlobURL } = await import(/* @vite-ignore */ 'https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js')
  const ffmpeg = new FFmpeg()
  const coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm')
  })
  ffmpegInstance = ffmpeg
  return ffmpeg
}

async function convertWebmToMp4(webmBlob: Blob, onProgress: (ratio: number) => void) {
  const ffmpeg = await getFfmpeg()
  const onProgressEvent = ({ progress }: { progress: number }) => onProgress(progress)
  ffmpeg.on('progress', onProgressEvent)
  try {
    const inputData = new Uint8Array(await webmBlob.arrayBuffer())
    await ffmpeg.writeFile('input.webm', inputData)
    await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-movflags', '+faststart', 'output.mp4'])
    const data = await ffmpeg.readFile('output.mp4')
    return new Blob([data.buffer], { type: 'video/mp4' })
  } finally {
    ffmpeg.off('progress', onProgressEvent)
  }
}

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  cancelAnimationFrame(rafId)
  displayStream?.getTracks().forEach((t) => t.stop())
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
})
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.75rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

/* Smartphone Bezel - same look as the Opening Design live preview */
.phone-bezel {
  position: relative;
  width: 100%;
  max-width: 390px;
  height: 844px;
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: translateZ(0);
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
  box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.05);
}

.phone-screen {
  width: 100%;
  height: 100%;
  border: 0;
  background: #04101f;
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
  border-radius: 10px;
}
</style>
