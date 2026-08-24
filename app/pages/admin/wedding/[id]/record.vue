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
        <div class="flex-1 w-full lg:min-w-[360px] lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-6 order-2 lg:order-1">

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
                  Click Start and a small new window will pop up with just the live invite in it - nothing else. When your browser asks what to share, pick <strong class="text-gray-200">that new window</strong> (it'll be labeled with the wedding's page). Interact with it exactly like a guest would - tap to open the envelope, scroll through it - then come back here and click Stop.
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
        <div class="w-full lg:w-[560px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
            </p>
          </div>

          <!-- Smartphone Mockup Wrapper - matches the exact same bezel
               proportions as the Opening Design page's Live Preview (fixed
               height, capped width - not aspect-ratio-derived), so this
               looks identical rather than a differently-shaped phone. The
               recording itself crops to the iframe (frameEl below), not
               this outer bezel, so the dark border/notch decoration never
               ends up in the recorded video either way - the output video
               is scaled to a fixed 1080-wide HD target regardless of how
               big this renders on her screen (see OUTPUT_WIDTH below), so
               recording quality doesn't depend on this preview's size. -->
          <div class="phone-bezel w-full max-w-[390px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <iframe
              ref="frameEl"
              :key="previewReloadKey"
              :src="previewUrl"
              class="phone-screen"
              title="Live guest preview"
              @load="previewLoaded = true"
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
const frameEl = ref<HTMLIFrameElement | null>(null)
const previewLoaded = ref(false)

const previewUrl = computed(() => {
  if (!wedding.value) return 'about:blank'
  const base = `/w/${wedding.value.slug}${previewMode.value === 'vip' ? '/vip' : ''}`
  const name = previewGuestName.value.trim()
  return name ? `${base}?to=${encodeURIComponent(name)}` : base
})

function reloadPreview() {
  previewLoaded.value = false
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
let recordedMimeType = ''
let rafId = 0
let timerInterval: ReturnType<typeof setInterval> | null = null
let recordingPopup: Window | null = null

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

  // Kick off loading the video encoder now, in the background, instead of
  // only after Stop is clicked - it has to fetch a real encoder
  // (~25-30MB) from a CDN the first time, which is what "Loading video
  // encoder..." was waiting on after every single recording. Starting it
  // here lets that download happen while she's recording (which usually
  // takes longer than the download itself), so by the time she clicks
  // Stop, it's typically already loaded and that step is instant. It's
  // cached after the first successful load, so this is a no-op on every
  // recording after the first.
  getFfmpeg().catch(() => {
    // If it fails to preload, convertWebmToMp4 will just try again (and
    // surface the real error then) after Stop - nothing to do here.
  })

  // Previous approach: share this whole admin tab, then mathematically
  // crop out just the phone region (by element bounds, or a browser-level
  // CropTarget). That crop math depended on assumptions - which surface
  // got shared, whether the browser reports displaySurface at all, tab
  // coordinates matching viewport coordinates - that didn't hold on every
  // browser/OS, and kept recording the wrong region no matter what was
  // shared. New approach: open a separate, minimal popup window that
  // contains nothing but the live guest page - no dashboard, no sidebar,
  // no controls around it. Sharing THAT window is the mobile screen; there
  // is nothing else in it to crop out, so no crop math is needed at all.
  const popup = window.open(
    previewUrl.value,
    'wc_promo_recording',
    'width=440,height=956,menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes'
  )
  if (!popup) {
    recordingState.value = 'idle'
    errorMessage.value = "Your browser blocked the recording window from opening - allow pop-ups for this site and click Start Recording again."
    return
  }
  recordingPopup = popup

  // Let it actually finish loading the invite before asking what to share,
  // so the share picker shows the real page (not a blank window) and the
  // recording doesn't start on a placeholder background.
  await new Promise((resolve) => {
    const check = () => {
      if (popup.closed || popup.document?.readyState === 'complete') resolve(undefined)
      else setTimeout(check, 100)
    }
    check()
  })
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    // audio: true asks for the shared window/tab's own sound (e.g.
    // background music on the invite) to be captured along with the video.
    // Whether the browser actually offers/grants it depends on the OS and
    // which surface she shares - if it isn't available, recording still
    // proceeds silently rather than failing the take.
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: { ideal: 2560 }, height: { ideal: 1440 }, frameRate: { ideal: 30 } },
      audio: true
    })
  } catch (err: any) {
    popup.close()
    recordingPopup = null
    recordingState.value = 'idle'
    errorMessage.value = err?.name === 'NotAllowedError'
      ? "Recording wasn't started - you closed the share dialog or denied permission. Click Start Recording to try again."
      : `Couldn't start recording: ${err?.message || err}`
    return
  }

  sourceVideo = document.createElement('video')
  sourceVideo.muted = true
  sourceVideo.srcObject = displayStream
  await sourceVideo.play()
  if (sourceVideo.readyState < 2) {
    await new Promise<void>((resolve) => { sourceVideo!.onloadedmetadata = () => resolve() })
  }

  // Some browsers (Safari especially) ignore the location=no/toolbar=no
  // hints and still show a thin address-bar strip along the top of the
  // popup, which then ends up baked into the recording - and, since the
  // output height below is derived from the captured frame's own aspect
  // ratio, that extra strip also skewed the whole video to look like a
  // different, taller "screen" than the real phone content. Trim exactly
  // that strip off, measured live from the popup's own outer-vs-inner
  // window size (not a guessed constant, since chrome height varies by
  // browser/OS) - whatever's left is just the real invite, edge-to-edge.
  let crop = { x: 0, y: 0, w: sourceVideo.videoWidth, h: sourceVideo.videoHeight }
  try {
    if (!popup.closed) {
      const chromeHeightCss = Math.max(0, popup.outerHeight - popup.innerHeight)
      if (chromeHeightCss > 0) {
        const scaleY = sourceVideo.videoHeight / popup.outerHeight
        const chromeHeightPx = Math.round(chromeHeightCss * scaleY)
        crop = {
          x: 0,
          y: chromeHeightPx,
          w: sourceVideo.videoWidth,
          h: Math.max(2, sourceVideo.videoHeight - chromeHeightPx)
        }
      }
    }
  } catch {
    // If the popup's window metrics aren't readable for some reason, fall
    // back to recording the frame whole rather than failing the take.
  }

  // Output canvas fills edge-to-edge with the phone screen itself - fixed
  // width, height derived from the phone's own aspect ratio, no black bars
  // added around it.
  const OUTPUT_WIDTH = 1080
  const outputWidth = OUTPUT_WIDTH
  const outputHeight = Math.round(OUTPUT_WIDTH * (crop.h / crop.w))

  outputCanvas = document.createElement('canvas')
  outputCanvas.width = outputWidth
  outputCanvas.height = outputHeight
  const ctx = outputCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const drawFrame = () => {
    if (sourceVideo) ctx.drawImage(sourceVideo, crop.x, crop.y, crop.w, crop.h, 0, 0, outputCanvas!.width, outputCanvas!.height)
    rafId = requestAnimationFrame(drawFrame)
  }
  drawFrame()

  const canvasStream = outputCanvas.captureStream(30)
  // The canvas only ever carries video (drawImage doesn't touch audio), so
  // graft the shared window's own audio track onto it, when one came
  // through, into a single stream to actually record from.
  const audioTracks = displayStream.getAudioTracks()
  const recordingStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks])
  const hasAudio = audioTracks.length > 0

  // Capture H.264 directly when the browser supports it (still a webm
  // container) so the MP4 step below can be a lossless remux instead of a
  // second lossy re-encode stacked on top of VP9 - that double-compression
  // was the other half of "HD on the Mac, awful after upload": every
  // re-encode throws away more detail before the destination platform even
  // gets to do its own compression.
  const mimeCandidates = hasAudio
    ? ['video/webm;codecs=h264,opus', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm']
    : ['video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm']
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm'
  recordedMimeType = mimeType
  recordedChunks = []
  recorder = new MediaRecorder(recordingStream, { mimeType, videoBitsPerSecond: 14_000_000 })
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
  recordingPopup?.close()
  recordingPopup = null
  recordingState.value = 'converting'
  conversionLabel.value = 'Finishing recording...'
  conversionProgress.value = 0
  recorder?.stop()
}

async function handleRecordingStopped() {
  const webmBlob = new Blob(recordedChunks, { type: 'video/webm' })
  const isH264 = recordedMimeType.includes('h264')
  sourceVideo = null
  outputCanvas = null

  try {
    conversionLabel.value = 'Loading video encoder...'
    const mp4Blob = await convertWebmToMp4(webmBlob, isH264, (ratio) => {
      conversionLabel.value = isH264 ? 'Finalizing MP4...' : 'Converting to MP4...'
      conversionProgress.value = Math.min(1, Math.max(0, ratio))
    })
    downloadUrl.value = URL.createObjectURL(mp4Blob)
    downloadFilename.value = `${wedding.value?.slug || 'wedding'}-promo-${previewMode.value}.mp4`
    downloadIsFallback.value = false
  } catch (err) {
    // MP4 conversion is a nice-to-have on top of a recording that already
    // succeeded - if it fails for any reason (e.g. the CDN encoder
    // couldn't load), hand back the raw WebM rather than losing the take.
    // eslint-disable-next-line no-console
    console.error('MP4 conversion failed:', err)
    downloadUrl.value = URL.createObjectURL(webmBlob)
    downloadFilename.value = `${wedding.value?.slug || 'wedding'}-promo-${previewMode.value}.webm`
    downloadIsFallback.value = true
    const detail = err instanceof Error ? err.message : String(err)
    errorMessage.value = `Couldn't convert to MP4 (${detail}), so here's the recording as WebM instead - it plays in most browsers and video editors, just not natively on all phones/social apps.`
  }
  recordingState.value = 'ready'
}

// ffmpeg.wasm is loaded from a CDN at record time (not an npm dependency),
// so using this feature never requires a build/deploy step of its own -
// the single-threaded core is used deliberately since it works without the
// cross-origin-isolation headers this app doesn't set.
let ffmpegInstance: any = null
// The recording flow now calls getFfmpeg() twice - once to preload as soon
// as Start is clicked, once for real after Stop. Without caching the
// in-flight promise itself (not just the finished instance), that second
// call would see ffmpegInstance still null and kick off a whole second,
// completely separate CDN download + Worker load in parallel with the
// first - two competing loads that could contend with each other and
// never resolve, which is exactly what looked like "stuck on Loading video
// encoder... forever". Every caller now awaits the one shared load.
let ffmpegLoadPromise: Promise<any> | null = null
async function getFfmpeg() {
  if (ffmpegInstance) return ffmpegInstance
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = loadFfmpeg().catch((err) => {
      // A failed load shouldn't permanently wedge future attempts - clear
      // the cached promise so the next call (e.g. after Stop) tries fresh
      // instead of forever returning the same rejected promise.
      ffmpegLoadPromise = null
      throw err
    })
  }
  return ffmpegLoadPromise
}

async function loadFfmpeg() {
  const { FFmpeg } = await import(/* @vite-ignore */ 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js')
  const { toBlobURL } = await import(/* @vite-ignore */ 'https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js')
  const ffmpeg = new FFmpeg()
  const coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
  // @ffmpeg/ffmpeg internally runs the core in a background Worker, and by
  // default points that Worker straight at its own script on unpkg - but
  // Workers (unlike normal fetches) are blocked from loading cross-origin,
  // so the browser throws "Failed to construct 'Worker': ... cannot be
  // accessed from origin ..." the moment conversion starts, which is
  // exactly what silently fell back to WebM every time. Blobbing the
  // worker script itself (classWorkerURL), the same trick already used for
  // the core/wasm files below, makes it same-origin and fixes that.
  await ffmpeg.load({
    coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm'),
    classWorkerURL: await toBlobURL('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js', 'text/javascript')
  })
  ffmpegInstance = ffmpeg
  return ffmpeg
}

async function convertWebmToMp4(webmBlob: Blob, isH264: boolean, onProgress: (ratio: number) => void) {
  const ffmpeg = await getFfmpeg()
  const onProgressEvent = ({ progress }: { progress: number }) => onProgress(progress)
  ffmpeg.on('progress', onProgressEvent)
  try {
    const inputData = new Uint8Array(await webmBlob.arrayBuffer())
    await ffmpeg.writeFile('input.webm', inputData)
    // Audio (when the recording has any) always gets transcoded to AAC -
    // MP4 doesn't support the Opus codec MediaRecorder uses in the webm
    // source, so "-c:a copy" would fail even on the H.264 fast path.
    if (isH264) {
      // Video is already H.264 - just move it into an MP4 container with
      // no re-encode, so nothing further is lost.
      await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'output.mp4'])
    } else {
      // VP9 fallback path: re-encode with a quality target (CRF) instead
      // of the previous default-quality "fast" preset, and pin a
      // broadly-compatible profile/level so phones and social apps decode
      // it cleanly instead of re-encoding it themselves.
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'high',
        '-level', '4.2',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        'output.mp4'
      ])
    }
    const data = await ffmpeg.readFile('output.mp4')
    // Pass the Uint8Array itself, not .buffer - the view's underlying
    // ArrayBuffer can be larger than the actual file (WASM memory isn't
    // tightly sized to it), so .buffer risks trailing garbage bytes in
    // the resulting MP4.
    return new Blob([data], { type: 'video/mp4' })
  } finally {
    ffmpeg.off('progress', onProgressEvent)
  }
}

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  cancelAnimationFrame(rafId)
  displayStream?.getTracks().forEach((t) => t.stop())
  recordingPopup?.close()
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

/* Smartphone Bezel - exact same rule as the Opening Design page's Live
   Preview (fixed height, width capped by the max-w-[390px] class on the
   element, not derived from aspect-ratio). Using aspect-ratio here
   previously let the width get clamped by the column's max-width without
   the height following it back down, which is what made this bezel render
   narrower/more elongated than the Opening Design one instead of matching
   it. */
.phone-bezel {
  position: relative;
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
