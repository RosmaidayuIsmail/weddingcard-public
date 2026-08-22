<template>
  <div class="theme-surface text-white relative overflow-hidden" :style="styleVars">
    <CustomCodeBlock v-if="customCode.position === 'top'" class="relative z-20" />

    <div v-if="wedding.content.audioSrc && opened" class="fixed top-4 right-4 z-40">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <!-- Envelope gate: same tap-to-open ceremony as the classic layout. The
         tap is also the "user gesture" the browser needs to allow the music
         to autoplay, and it's the moment that kicks off the whole camera
         sequence below. -->
    <div class="relative overflow-hidden" :style="{ minHeight: '100dvh' }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />
    </div>

    <!-- The cinematic canvas: everything below lives on one wide "world" the
         camera pans and zooms across on its own timer - see runCamera().
         Nothing here responds to scrolling or taps; it plays itself. -->
    <div v-if="opened" class="cine-viewport" ref="viewportEl">
      <div class="cine-world" ref="worldEl" :style="{ width: worldWidthPx + 'px' }">
        <div class="cine-bg" :style="{ width: worldWidthPx + 'px' }"></div>

        <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" class="cine-petals" />

        <!-- STOP: cover -->
        <div class="cine-row cine-row-center">
          <div class="cine-stop" :ref="el => setStopRef('cover', el)">
            <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
            <h1 class="cine-names">
              {{ wedding.content.brideName }}<span class="cine-amp">&amp;</span>{{ wedding.content.groomName }}
            </h1>
            <p class="cine-date">{{ wedding.content.dateLabel }}</p>
          </div>
        </div>

        <!-- STOPS: VIP scenes - the couple's own narrative content, written
             and ordered from the admin's Full Scene Manager (see
             VipScenesPanel.vue). Rendered generically: an optional image,
             a title, and body text - whatever the couple wrote. -->
        <div
          v-for="(scene, sceneIndex) in vipScenes"
          :key="scene.id"
          class="cine-row"
          :class="rowAlignClass('vip-' + scene.id)"
        >
          <div class="cine-stop cine-card-stop" :ref="el => setStopRef('vip-' + scene.id, el)">
            <div class="cine-card">
              <img v-if="scene.imageUrl" :src="scene.imageUrl" alt="" class="cine-scene-img">
              <h3 v-if="scene.title">{{ scene.title }}</h3>
              <p v-if="scene.body" class="cine-story-text">{{ scene.body }}</p>
            </div>
          </div>
        </div>

        <!-- STOP: event details -->
        <div class="cine-row" :class="rowAlignClass('event')">
          <div class="cine-stop cine-card-stop" :ref="el => setStopRef('event', el)">
            <div class="cine-card">
              <h3>{{ wedding.content.detailsHeading || 'The Details' }}</h3>
              <p v-if="wedding.content.timeLabel">{{ wedding.content.timeLabel }}</p>
              <p v-if="wedding.content.venueName" class="cine-strong">{{ wedding.content.venueName }}</p>
              <p v-if="wedding.content.venueAddress" class="cine-dim">{{ wedding.content.venueAddress }}</p>
              <div class="cine-countdown" v-if="wedding.content.dateISO">
                <div class="cine-cell"><b>{{ countdown.days }}</b><span>Days</span></div>
                <div class="cine-cell"><b>{{ countdown.hours }}</b><span>Hrs</span></div>
                <div class="cine-cell"><b>{{ countdown.minutes }}</b><span>Min</span></div>
              </div>
              <div class="cine-cal">
                <AddToCalendarButton
                  :bride-name="wedding.content.brideName"
                  :groom-name="wedding.content.groomName"
                  :date-iso="wedding.content.dateISO"
                  :venue-name="wedding.content.venueName"
                  :venue-address="wedding.content.venueAddress"
                  :rsvp-deadline-label="wedding.content.rsvpDeadlineLabel"
                  :label="wedding.content.calendarButtonLabel"
                  class="rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- STOP: location / QR -->
        <div v-if="wedding.content.mapUrl" class="cine-row" :class="rowAlignClass('location')">
          <div class="cine-stop cine-card-stop" :ref="el => setStopRef('location', el)">
            <div class="cine-card">
              <h3>{{ wedding.content.locationHeading || 'Find Us' }}</h3>
              <p>{{ wedding.content.locationSubtitle || 'Scan to open in Maps' }}</p>
              <div class="cine-qr"><img :src="qrCodeUrl" alt="QR code linking to the venue" loading="lazy"></div>
              <UButton :to="wedding.content.mapUrl" target="_blank" external icon="i-heroicons-map-pin" color="primary" class="rounded-full mt-3">
                {{ wedding.content.locationMapsButtonLabel || 'Google Maps' }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- STOP: gift -->
        <div v-if="hasGift" class="cine-row" :class="rowAlignClass('gift')">
          <div class="cine-stop cine-card-stop" :ref="el => setStopRef('gift', el)">
            <div class="cine-card">
              <h3>A Gift of Love</h3>
              <GiftCard :banks="[wedding.content.bank, wedding.content.bank2]" />
            </div>
          </div>
        </div>

        <!-- STOP: flow -->
        <div v-if="wedding.flow?.length" class="cine-row" :class="rowAlignClass('flow')">
          <div class="cine-stop cine-card-stop" :ref="el => setStopRef('flow', el)">
            <div class="cine-card">
              <h3>{{ wedding.content.eventFlowHeading || 'Event Flow' }}</h3>
              <FlowTimeline :items="wedding.flow" />
            </div>
          </div>
        </div>

        <!-- STOP: closing / RSVP - camera pulls back and settles here. Extra
             top padding (vs. the other rows) keeps the previous stop's card
             from peeking into frame once the camera zooms out for this
             finale shot. -->
        <div class="cine-row cine-row-center cine-row-finale">
          <div class="cine-stop" :ref="el => setStopRef('closing', el)">
            <div class="cine-eyebrow">Join Our Celebration</div>
            <h2 class="cine-subnames" style="font-size:2rem;">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</h2>
            <UButton v-if="wedding.content.rsvpEnabled !== false" :to="rsvpLink" size="xl" color="primary" class="cine-cta">
              {{ wedding.content.btnRsvp || 'RSVP Now' }}
            </UButton>
            <div class="mt-5 opacity-85"><ShareButtons :bride-name="wedding.content.brideName" :groom-name="wedding.content.groomName" :date-label="wedding.content.dateLabel" :share-message="wedding.content.shareMessage" /></div>
          </div>
        </div>

        <CustomCodeBlock v-if="customCode.position !== 'top'" class="cine-row cine-row-center" />
      </div>

      <div class="cine-hud">
        <span v-for="(s, i) in stopOrder" :key="s" class="cine-dot" :class="{ on: i === currentIndex }"></span>
      </div>
      <button v-if="currentIndex < stopOrder.length - 1" type="button" class="cine-skip" @click="skipToEnd">Skip to RSVP &rarr;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// The VIP "cinematic" layout: after the envelope opens, an automatic camera
// pans and zooms across one wide canvas of the wedding's own content on a
// timer - no scrolling, no taps required from the guest. See runCamera().
//
// Every stop's screen position is MEASURED from the real rendered DOM after
// mount (not hardcoded), so the sequence adapts automatically to however
// much content a given wedding actually has (a long "story" paragraph gets
// a longer hold; a wedding with no gift info just skips that stop).
import type { WeddingDoc } from '~/composables/useWeddingTypes'

const props = withDefaults(defineProps<{
  wedding: WeddingDoc
  guestName?: string
  rsvpLink: string
}>(), {
  guestName: ''
})

const { themeStyleVars, customCode } = useThemes()

const styleVars = computed(() =>
  themeStyleVars(
    props.wedding.themeId,
    {
      bgFrom: props.wedding.content.customBgFrom,
      bgTo: props.wedding.content.customBgTo,
      accent: props.wedding.content.customAccent
    },
    props.wedding.content.customFontFamily || props.wedding.content.fontFamily,
    props.wedding.content.textWeight
  )
)

const opened = ref(false)

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(props.wedding.content.mapUrl ?? '')}&size=200x200`
)

const hasGift = computed(() => {
  const content = props.wedding.content
  return !!(content.enableGift && (
    content.bank?.accountNumber || content.bank?.qrCodeUrl ||
    content.bank2?.accountNumber || content.bank2?.qrCodeUrl
  ))
})

// Simple static countdown snapshot for the event-details stop - the full
// live-ticking CountdownTimer isn't needed here since the camera only
// lingers on this stop for a few seconds.
const countdown = computed(() => {
  const target = props.wedding.content.dateISO ? new Date(props.wedding.content.dateISO).getTime() : NaN
  const diff = Math.max(0, target - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return { days: pad(days), hours: pad(hours), minutes: pad(minutes) }
})

// The couple's own admin-authored scenes (see VipScenesPanel.vue), rendered
// generically between the automatic cover and the automatic data-bound
// stops (event/location/gift/flow/closing) below.
const vipScenes = computed(() => props.wedding.vipScenes || [])

// ---- alternating left/right pan pattern + zoom scale for the middle stops ----
// cover and closing are always centered (bookends); everything between
// alternates so the camera visibly travels left/right, not just down. Built
// once (at setup) from the wedding's actual scene list, so the admin's VIP
// scenes and the fixed data-bound scenes continue the same left-right
// rhythm as one unbroken sequence, however many scenes the couple wrote.
const alignByKey: Record<string, 'left' | 'right' | 'center'> = { cover: 'center', closing: 'center' }
const scaleByKey: Record<string, number> = { cover: 1.0, closing: 0.88 }
const MIDDLE_ORDER: Array<{ key: string; scale: number }> = [
  ...vipScenes.value.map((scene, i) => ({ key: `vip-${scene.id}`, scale: i % 2 === 0 ? 1.15 : 1.05 })),
  { key: 'event', scale: 1.18 },
  { key: 'location', scale: 1.3 },
  { key: 'gift', scale: 1.12 },
  { key: 'flow', scale: 1.08 }
]
let sideToggle = 0
MIDDLE_ORDER.forEach(({ key, scale }) => {
  alignByKey[key] = sideToggle % 2 === 0 ? 'right' : 'left'
  scaleByKey[key] = scale
  sideToggle++
})
function rowAlignClass(key: string) {
  return 'cine-row-' + (alignByKey[key] || 'center')
}

// ---- camera engine ----
const viewportEl = ref<HTMLElement | null>(null)
const worldEl = ref<HTMLElement | null>(null)
const worldWidthPx = ref(600)
const stopRefs: Record<string, HTMLElement> = {}
function setStopRef(key: string, el: Element | null) {
  if (el) stopRefs[key] = el as HTMLElement
}

const stopOrder = ref<string[]>([])
const currentIndex = ref(0)
let stops: Array<{ x: number; y: number; scale: number; hold: number }> = []
let timer: ReturnType<typeof setTimeout> | null = null
const TRANSITION_MS = 1700

function measureStops() {
  if (!worldEl.value) return
  const worldRect = worldEl.value.getBoundingClientRect()
  const order = Object.keys(stopRefs).filter((k) => stopRefs[k])
  // Preserve document order (the order the stops actually render in), not
  // object-insertion order, since v-if can skip keys.
  order.sort((a, b) => {
    const ra = stopRefs[a].getBoundingClientRect()
    const rb = stopRefs[b].getBoundingClientRect()
    return ra.top - rb.top
  })
  stopOrder.value = order
  stops = order.map((key) => {
    const el = stopRefs[key]
    const r = el.getBoundingClientRect()
    const x = r.left - worldRect.left + r.width / 2
    const y = r.top - worldRect.top + r.height / 2
    const textLen = (el.textContent || '').trim().length
    const hold = Math.min(5200, Math.max(2200, textLen * 30))
    return { x, y, scale: scaleByKey[key] ?? 1.1, hold }
  })
}

function applyCamera(i: number, instant: boolean) {
  const s = stops[i]
  const vp = viewportEl.value
  if (!s || !vp || !worldEl.value) return
  const vw = vp.clientWidth
  const vh = vp.clientHeight
  const tx = vw / 2 - s.x * s.scale
  const ty = vh / 2 - s.y * s.scale
  const world = worldEl.value
  if (instant) {
    world.style.transition = 'none'
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${s.scale})`
    void world.offsetHeight
    world.style.transition = ''
  } else {
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${s.scale})`
  }
  currentIndex.value = i
}

function runCamera(i: number, instant?: boolean) {
  if (timer) clearTimeout(timer)
  applyCamera(i, !!instant)
  if (i >= stops.length - 1) return
  timer = setTimeout(() => runCamera(i + 1), TRANSITION_MS + stops[i].hold)
}

function skipToEnd() {
  runCamera(stops.length - 1, true)
}

let resizeRaf = 0
function onResize() {
  if (!worldEl.value || !viewportEl.value) return
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    worldWidthPx.value = Math.round(viewportEl.value!.clientWidth * 1.6)
    nextTick(() => {
      measureStops()
      applyCamera(Math.min(currentIndex.value, stops.length - 1), true)
    })
  })
}

const reduceMotion = ref(false)

watch(opened, async (value) => {
  if (!value) return
  await nextTick()
  if (!viewportEl.value) return
  worldWidthPx.value = Math.round(viewportEl.value.clientWidth * 1.6)
  await nextTick()
  measureStops()
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) {
    runCamera(stops.length - 1, true)
  } else {
    runCamera(0, true)
  }
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.cine-viewport {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
}

.cine-world {
  /* absolute (not relative/static) so this very tall canvas is removed from
     normal flow and never inflates .cine-viewport's own height - otherwise
     the "camera window" isn't a fixed-size window at all, and every camera
     calculation below is wrong (verified against a standalone harness). */
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  transition: transform 1.7s cubic-bezier(.65, 0, .35, 1);
  will-change: transform;
}

.cine-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100%;
  min-height: 4000px;
  background:
    radial-gradient(600px 500px at 30% 4%, rgba(227, 176, 74, .14), transparent 60%),
    radial-gradient(700px 600px at 70% 22%, rgba(201, 120, 150, .10), transparent 60%),
    radial-gradient(700px 600px at 30% 45%, rgba(120, 140, 180, .08), transparent 60%),
    linear-gradient(175deg, var(--theme-bg-from, #2a1245), var(--theme-bg-via, #1c0f2e) 45%, var(--theme-bg-to, #150a20) 100%);
  z-index: 0;
}

.cine-petals { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

.cine-row {
  position: relative;
  z-index: 2;
  display: flex;
  padding: 90px 24px;
}
.cine-row-center { justify-content: center; }
.cine-row-left { justify-content: flex-start; }
.cine-row-right { justify-content: flex-end; }
.cine-row-finale { padding-top: 220px; padding-bottom: 140px; }

.cine-stop { max-width: 320px; text-align: center; }
.cine-card-stop { width: 300px; }

.cine-eyebrow { font-size: .66rem; letter-spacing: .32em; text-transform: uppercase; color: var(--theme-accent); margin-bottom: 10px; }
.cine-names { font-family: var(--theme-heading-font, serif); font-style: italic; font-weight: 500; font-size: 2.6rem; line-height: 1.05; margin: 0 0 10px; color: var(--theme-ink, #f7ecf3); }
.cine-amp { color: var(--theme-accent); font-size: .6em; margin: 0 .12em; }
.cine-date { font-size: .82rem; color: rgba(247, 236, 243, .7); letter-spacing: .06em; }

.cine-subnames { font-family: var(--theme-heading-font, serif); font-weight: 500; font-size: 1.7rem; margin: 4px 0; color: var(--theme-ink, #f7ecf3); }
.cine-mono { margin-top: 10px; font-size: 1.4rem; color: var(--theme-accent); }
.cine-mono-img { width: 44px; height: 44px; object-fit: contain; margin: 0 auto; }

.cine-photo-pair { display: flex; justify-content: center; gap: 12px; margin-bottom: 14px; }
.cine-photo { width: 108px; height: 108px; border-radius: 50%; object-fit: cover; border: 2px solid var(--theme-accent); box-shadow: 0 14px 30px -10px rgba(0,0,0,.6); }
.cine-medallion { width: 130px; height: 130px; border-radius: 50%; margin: 0 auto 14px; border: 2px solid var(--theme-accent); background: linear-gradient(150deg, rgba(227,176,74,.35), rgba(0,0,0,.2)); }

.cine-scene-img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 14px; display: block; }

.cine-card { background: rgba(20, 10, 24, .55); backdrop-filter: blur(8px); border: 1px solid rgba(227,176,74,.3); border-radius: 18px; padding: 22px 24px; }
.cine-card h3 { font-family: var(--theme-heading-font, serif); font-weight: 500; font-size: 1.4rem; margin: 0 0 10px; color: var(--theme-ink, #f7ecf3); }
.cine-card p { font-size: .84rem; line-height: 1.7; color: rgba(247,236,243,.72); margin: 4px 0; }
.cine-story-text { white-space: pre-line; }
.cine-label { font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--theme-accent); margin-bottom: 2px; }
.cine-strong { font-weight: 600; color: var(--theme-ink, #f7ecf3); }
.cine-dim { color: rgba(247,236,243,.6); }
.cine-hr { height: 1px; background: rgba(255,255,255,.12); margin: 14px 0; }

.cine-countdown { display: flex; justify-content: center; gap: 8px; margin: 14px 0 4px; }
.cine-cell { background: rgba(255,255,255,.06); border: 1px solid rgba(227,176,74,.3); border-radius: 10px; padding: 8px 4px; width: 56px; }
.cine-cell b { display: block; font-size: 1.1rem; font-variant-numeric: tabular-nums; color: var(--theme-accent); }
.cine-cell span { font-size: .52rem; letter-spacing: .08em; text-transform: uppercase; color: rgba(247,236,243,.6); }
.cine-cal { margin-top: 12px; }

.cine-qr { width: 96px; height: 96px; margin: 12px auto 0; background: #fff; border-radius: 12px; padding: 8px; }
.cine-qr img { width: 100%; height: 100%; }

.cine-cta { margin-top: 6px; border-radius: 999px; font-weight: 600; box-shadow: 0 0 0 0 rgba(227,176,74,.5); animation: cine-glow 2.4s ease-in-out infinite; }
@keyframes cine-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(227,176,74,.45); } 50% { box-shadow: 0 0 0 14px rgba(227,176,74,0); } }

.cine-hud { position: absolute; left: 0; right: 0; bottom: 18px; z-index: 20; display: flex; justify-content: center; gap: 6px; pointer-events: none; }
.cine-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(247,236,243,.25); transition: background .3s ease, transform .3s ease; }
.cine-dot.on { background: var(--theme-accent); transform: scale(1.3); }

.cine-skip {
  position: absolute; top: 16px; right: 16px; z-index: 20;
  background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.2);
  color: rgba(247,236,243,.8); font-size: .68rem; letter-spacing: .04em;
  padding: 8px 14px; border-radius: 999px; cursor: pointer;
}
.cine-skip:hover { color: #fff; border-color: rgba(255,255,255,.4); }

@media (prefers-reduced-motion: reduce) {
  .cine-world { transition: none !important; }
}
</style>
