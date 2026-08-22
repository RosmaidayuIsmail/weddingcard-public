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
    <div class="envelope-shell" :class="{ 'envelope-shell-collapsed': envelopeCollapsed }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />
    </div>

    <!-- The cinematic canvas: everything below lives on one wide "world" the
         camera pans and zooms across on its own timer - see runCamera().
         Nothing here responds to scrolling or taps; it plays itself. -->
    <div v-if="opened" class="cine-viewport" ref="viewportEl">
      <!-- A photo of the couple's own venue, fixed to the viewport (not
           panned like the world below) so it reads as a constant backdrop
           behind every scene - see vipBackgroundImageUrl on WeddingDoc and
           the "Background Photo" upload on the Wedding Details page.
           Falls back to nothing (just the gradient below) when unset. -->
      <div v-if="wedding.vipBackgroundImageUrl" class="cine-photo-backdrop" :style="{ backgroundImage: `url(${wedding.vipBackgroundImageUrl})` }"></div>

      <!-- Soft smoke/mist wipe that puffs across the screen at the start of
           each camera move (see puffMist() below) - a stand-in for the
           mist-transition look in the reference video, independent of any
           couple's chosen theme colors so it reads the same everywhere. -->
      <div class="cine-mist" ref="mistEl"></div>

      <div class="cine-world" ref="worldEl" :style="{ width: worldWidthPx + 'px' }">
        <div class="cine-bg" :class="{ 'cine-bg-scrim': !!wedding.vipBackgroundImageUrl }" :style="{ width: worldWidthPx + 'px' }"></div>

        <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" class="cine-petals" />

        <!-- STOP: cover -->
        <div class="cine-row cine-row-center">
          <div class="cine-stop" :class="stopClass('cover')" :ref="el => setStopRef('cover', el)">
            <!-- Template 1's ornamental-arch cover: only appears once the
                 couple has uploaded a picture of themselves together (see
                 the Couple Illustration panel on the Wedding Details page).
                 Purely additive - every wedding without one keeps today's
                 plain text frame below, unchanged. -->
            <div v-if="wedding.content.coupleIllustrationUrl" class="cine-arch">
              <svg class="cine-arch-corner cine-arch-corner-tl" viewBox="0 0 90 90" aria-hidden="true">
                <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
                <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
                <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
                <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
                <path d="M40,10 C41,13 43,15 46,16 C43,17 41,19 40,22 C39,19 37,17 34,16 C37,15 39,13 40,10 Z" fill="var(--theme-ink, #f7ecf3)" opacity="0.6"/>
              </svg>
              <svg class="cine-arch-corner cine-arch-corner-tr" viewBox="0 0 90 90" aria-hidden="true">
                <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
                <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
                <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
                <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
                <path d="M40,10 C41,13 43,15 46,16 C43,17 41,19 40,22 C39,19 37,17 34,16 C37,15 39,13 40,10 Z" fill="var(--theme-ink, #f7ecf3)" opacity="0.6"/>
              </svg>
              <div class="cine-arch-panel">
                <svg class="cine-arch-motif" viewBox="0 0 46 30" aria-hidden="true">
                  <path d="M17,15 A9,9 0 1 0 17,-3 A7,7 0 1 1 17,15 Z" fill="var(--theme-accent)" transform="translate(0,9)"/>
                  <path d="M32,6 C32.6,7.6 33.9,8.7 35.6,8.9 C33.9,9.1 32.6,10.2 32,11.8 C31.4,10.2 30.1,9.1 28.4,8.9 C30.1,8.7 31.4,7.6 32,6 Z" fill="var(--theme-ink, #f7ecf3)"/>
                </svg>
                <div class="cine-arch-photo">
                  <img :src="wedding.content.coupleIllustrationUrl" alt="">
                </div>
                <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
                <h1 class="cine-names">
                  {{ wedding.content.brideName }}<span class="cine-amp">&amp;</span>{{ wedding.content.groomName }}
                </h1>
                <p class="cine-date">{{ wedding.content.dateLabel }}</p>
              </div>
            </div>
            <template v-else>
              <div class="cine-frame">
                <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
                <h1 class="cine-names">
                  {{ wedding.content.brideName }}<span class="cine-amp">&amp;</span>{{ wedding.content.groomName }}
                </h1>
              </div>
              <p class="cine-date">{{ wedding.content.dateLabel }}</p>
            </template>
          </div>
        </div>

        <!-- STOP: venue diorama - a courtyard scene the couple "stands in",
             right after the cover. Only appears once a couple picture is
             uploaded (same gate as the cover's arch treatment above, and the
             same picture) - without one there's no figure to put in the
             scene, so it's skipped entirely rather than showing an empty
             courtyard. -->
        <div v-if="wedding.content.coupleIllustrationUrl" class="cine-row cine-row-center">
          <div class="cine-stop cine-venue-stop" :class="stopClass('venue')" :ref="el => setStopRef('venue', el)">
            <div class="cine-venue">
              <div class="cine-venue-sky"></div>
              <svg class="cine-venue-roof" viewBox="0 0 390 200" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-10,185 C10,130 35,85 66,74 C96,90 118,118 150,140 C172,155 195,160 195,160 C195,160 218,155 240,140 C272,118 294,90 324,74 C355,85 380,130 400,185 Z" fill="color-mix(in srgb, var(--theme-accent) 18%, #2c1608)"/>
                <path d="M0,160 C14,92 34,32 62,18 C90,34 112,70 140,96 C164,114 176,120 195,122 C214,120 226,114 250,96 C278,70 300,34 328,18 C356,32 376,92 390,160 L390,200 L0,200 Z" fill="color-mix(in srgb, var(--theme-accent) 30%, #4a2a12)"/>
                <path d="M0,166 C14,100 34,42 62,28 C90,44 112,78 140,102 C164,120 176,126 195,128 C214,126 226,120 250,102 C278,78 300,44 328,28 C356,42 376,100 390,166" fill="none" stroke="var(--theme-accent)" stroke-width="1.5" opacity=".5"/>
                <path d="M62,110 L62,200 M328,110 L328,200 M195,122 L195,200" stroke="#2c1608" stroke-width="9" opacity=".8"/>
              </svg>
              <div class="cine-venue-floor"></div>
              <div class="cine-venue-signage">
                <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
                <div class="cine-venue-names">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</div>
              </div>
              <svg class="cine-venue-arch" viewBox="0 0 220 90" aria-hidden="true">
                <g opacity=".95">
                  <circle cx="16" cy="32" r="14" fill="var(--theme-accent)"/><circle cx="36" cy="16" r="10" fill="color-mix(in srgb, var(--theme-accent) 60%, white)"/>
                  <circle cx="6" cy="16" r="9" fill="color-mix(in srgb, var(--theme-accent) 70%, white)"/><circle cx="48" cy="36" r="8" fill="color-mix(in srgb, var(--theme-accent) 40%, #7a8f4a)"/>
                  <circle cx="204" cy="30" r="14" fill="var(--theme-accent)"/><circle cx="184" cy="14" r="10" fill="color-mix(in srgb, var(--theme-accent) 60%, white)"/>
                  <circle cx="214" cy="12" r="9" fill="color-mix(in srgb, var(--theme-accent) 70%, white)"/><circle cx="172" cy="34" r="8" fill="color-mix(in srgb, var(--theme-accent) 40%, #7a8f4a)"/>
                </g>
              </svg>
              <div class="cine-venue-photo"><img :src="wedding.content.coupleIllustrationUrl" alt=""></div>
            </div>
          </div>
        </div>

        <!-- STOP: greeting - the salutation card, right after the venue. -->
        <div class="cine-row" :class="rowAlignClass('greeting')">
          <div class="cine-stop cine-card-stop" :class="stopClass('greeting')" :ref="el => setStopRef('greeting', el)">
            <div class="cine-card">
              <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
              <p class="cine-story-text">{{ wedding.content.story }}</p>
              <h3 class="cine-greeting-names">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</h3>
            </div>
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
          <div class="cine-stop cine-card-stop" :class="stopClass('vip-' + scene.id)" :ref="el => setStopRef('vip-' + scene.id, el)">
            <div class="cine-card">
              <img v-if="scene.imageUrl" :src="scene.imageUrl" alt="" class="cine-scene-img">
              <h3 v-if="scene.title">{{ scene.title }}</h3>
              <p v-if="scene.body" class="cine-story-text">{{ scene.body }}</p>
            </div>
          </div>
        </div>

        <!-- STOP: event details -->
        <div class="cine-row" :class="rowAlignClass('event')">
          <div class="cine-stop cine-card-stop" :class="stopClass('event')" :ref="el => setStopRef('event', el)">
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

        <!-- STOP: doa (prayer) - optional, off by default (see enableDoa on
             the Wedding Details page). When turned on with no custom text,
             defaultDoaText below fills in a generic Malay wedding doa. -->
        <div v-if="wedding.content.enableDoa" class="cine-row" :class="rowAlignClass('doa')">
          <div class="cine-stop cine-card-stop" :class="stopClass('doa')" :ref="el => setStopRef('doa', el)">
            <div class="cine-card cine-card-doa">
              <svg class="cine-doa-motif" viewBox="0 0 46 30" aria-hidden="true">
                <path d="M17,15 A9,9 0 1 0 17,-3 A7,7 0 1 1 17,15 Z" fill="var(--theme-accent)" transform="translate(0,9)"/>
                <path d="M32,6 C32.6,7.6 33.9,8.7 35.6,8.9 C33.9,9.1 32.6,10.2 32,11.8 C31.4,10.2 30.1,9.1 28.4,8.9 C30.1,8.7 31.4,7.6 32,6 Z" fill="var(--theme-ink, #f7ecf3)"/>
              </svg>
              <p class="cine-story-text">{{ wedding.content.doaText || defaultDoaText }}</p>
              <p class="cine-doa-amin">Amin Ya Rabbal 'Alamin</p>
            </div>
          </div>
        </div>

        <!-- STOP: photo frames - reuses the same couple picture as the cover
             (there's no separate individual bride/groom upload in the VIP
             dashboard yet), cropped to two different focal points so each
             frame reads as its own portrait rather than a repeated image. -->
        <div v-if="wedding.content.coupleIllustrationUrl" class="cine-row" :class="rowAlignClass('frames')">
          <div class="cine-stop" :class="stopClass('frames')" :ref="el => setStopRef('frames', el)">
            <div class="cine-frames">
              <svg class="cine-frames-ribbon" viewBox="0 0 70 44" aria-hidden="true">
                <path d="M35,10 L15,40 L25,34 L35,42 L45,34 L55,40 Z" fill="var(--theme-accent)"/>
                <circle cx="35" cy="10" r="10" fill="color-mix(in srgb, var(--theme-accent) 70%, white)"/>
              </svg>
              <div class="cine-frames-row">
                <div class="cine-frame-box"><img :src="wedding.content.coupleIllustrationUrl" style="object-position: 15% 20%;" alt="" /></div>
                <div class="cine-frame-box"><img :src="wedding.content.coupleIllustrationUrl" style="object-position: 85% 20%;" alt="" /></div>
              </div>
            </div>
          </div>
        </div>

        <!-- STOP: location / QR -->
        <div v-if="wedding.content.mapUrl" class="cine-row" :class="rowAlignClass('location')">
          <div class="cine-stop cine-card-stop" :class="stopClass('location')" :ref="el => setStopRef('location', el)">
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
          <div class="cine-stop cine-card-stop" :class="stopClass('gift')" :ref="el => setStopRef('gift', el)">
            <div class="cine-card">
              <h3>A Gift of Love</h3>
              <GiftCard :banks="[wedding.content.bank, wedding.content.bank2]" />
            </div>
          </div>
        </div>

        <!-- STOP: flow -->
        <div v-if="wedding.flow?.length" class="cine-row" :class="rowAlignClass('flow')">
          <div class="cine-stop cine-card-stop" :class="stopClass('flow')" :ref="el => setStopRef('flow', el)">
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
          <div class="cine-stop" :class="stopClass('closing')" :ref="el => setStopRef('closing', el)">
            <div class="cine-frame cine-frame-wide">
              <div class="cine-eyebrow">Join Our Celebration</div>
              <h2 class="cine-subnames" style="font-size:2rem;">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</h2>
            </div>
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

// EnvelopeIntro's own wrapper reserves a full 100dvh so the closed envelope
// has room to sit and its open animation has room to play. But that 100dvh
// block was staying in the document FOREVER, even once the envelope itself
// had fully animated away and unmounted - which meant the actual cinematic
// viewport below it started off-screen, and guests had to manually scroll
// past an empty full-screen block to ever see the camera fly-through. That
// defeats the entire point of this page ("plays itself, no scrolling") and
// is why the camera looked like it had already jumped ahead by the time
// anyone scrolled down to it: the timer had been running the whole time,
// unseen. envelopeCollapsed flips once EnvelopeIntro's slowest close
// animation (the wax-seal style, ~1.8s) has had time to fully finish, and
// the now-empty wrapper collapses out of the way so .cine-viewport takes
// over the screen immediately.
const envelopeCollapsed = ref(false)
watch(opened, (value) => {
  if (!value) return
  setTimeout(() => { envelopeCollapsed.value = true }, 2000)
})

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(props.wedding.content.mapUrl ?? '')}&size=200x200`
)

// Generic fallback shown on the doa stop when enableDoa is on but the couple
// hasn't written their own text yet - see doaText on WeddingContent.
const defaultDoaText = "Ya Allah Ya Tuhan kami, Engkau rahmatilah majlis ini dan berkatilah perjalanan hidup mereka berdua. Jalinkanlah perhubungan ini dengan ikatan kasih sayang, jauh dari salah faham dan perselisihan."

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
// alternates so the camera visibly travels left/right, not just down - unless
// the couple explicitly chose a position/zoom for one of their own VIP
// scenes in VipScenesPanel.vue, in which case that override wins. Kept in a
// deliberately narrow, calm range (scale 1.0-1.15) so the automatic default
// never feels like a jarring lurch even when nothing is overridden.
const alignByKey: Record<string, 'left' | 'right' | 'center'> = { cover: 'center', venue: 'center', closing: 'center' }
const scaleByKey: Record<string, number> = { cover: 1.0, venue: 1.0, closing: 0.94 }
const holdOverrideMsByKey: Record<string, number> = {}
const DEFAULT_SCALE: Record<string, number> = { greeting: 1.05, event: 1.08, doa: 1.06, frames: 1.05, location: 1.12, gift: 1.06, flow: 1.04 }
const MIDDLE_KEYS: string[] = [
  'greeting',
  ...vipScenes.value.map((scene) => `vip-${scene.id}`),
  'event', 'doa', 'frames', 'location', 'gift', 'flow'
]
MIDDLE_KEYS.forEach((key, i) => {
  const sceneId = key.startsWith('vip-') ? key.slice(4) : null
  const scene = sceneId ? vipScenes.value.find((s) => s.id === sceneId) : null
  const defaultAlign: 'left' | 'right' = i % 2 === 0 ? 'right' : 'left'
  const defaultScale = sceneId ? (i % 2 === 0 ? 1.06 : 1.04) : (DEFAULT_SCALE[key] ?? 1.06)
  alignByKey[key] = (scene?.position && scene.position !== 'auto') ? scene.position : defaultAlign
  scaleByKey[key] = scene?.zoomPercent ? scene.zoomPercent / 100 : defaultScale
  if (scene?.holdSeconds) holdOverrideMsByKey[key] = scene.holdSeconds * 1000
})
function rowAlignClass(key: string) {
  return 'cine-row-' + (alignByKey[key] || 'center')
}

// Reveal effect - "the content show, then gone" as the camera moves between
// stops (the reference behavior asked for): a stop is faded low while the
// camera is elsewhere and only comes to full opacity once it's the one the
// camera has actually arrived at, instead of every scene sitting fully
// visible in world-space all the time.
function stopClass(key: string) {
  return { 'cine-stop-active': stopOrder.value[currentIndex.value] === key }
}

// ---- camera engine ----
const viewportEl = ref<HTMLElement | null>(null)
const worldEl = ref<HTMLElement | null>(null)
const mistEl = ref<HTMLElement | null>(null)
const worldWidthPx = ref(600)

// A brief smoke/mist puff at the start of each automatic camera move (not
// the very first instant jump, and not the instant jump from Skip to RSVP -
// both of those are meant to feel immediate, not misty). Mirrors the
// reference video's soft transitions between scenes.
function puffMist() {
  const el = mistEl.value
  if (!el) return
  el.classList.add('cine-mist-active')
  setTimeout(() => { el.classList.remove('cine-mist-active') }, 900)
}
const stopRefs: Record<string, HTMLElement> = {}
function setStopRef(key: string, el: Element | null) {
  if (el) stopRefs[key] = el as HTMLElement
}

const stopOrder = ref<string[]>([])
const currentIndex = ref(0)
let stops: Array<{ x: number; y: number; scale: number; hold: number }> = []
let timer: ReturnType<typeof setTimeout> | null = null
// Slightly longer + eased than a typical UI transition on purpose - this is
// meant to read as a slow, deliberate camera move, not a snap-cut. Must stay
// in sync with .cine-world's CSS transition duration below.
const TRANSITION_MS = 1900

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
    const autoHold = Math.min(5200, Math.max(2200, textLen * 30))
    const hold = holdOverrideMsByKey[key] ?? autoHold
    return { x, y, scale: scaleByKey[key] ?? 1.05, hold }
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
  if (!instant) puffMist()
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
.envelope-shell {
  position: relative;
  overflow: hidden;
  min-height: 100dvh;
  transition: min-height 0.4s ease;
}

/* Once the envelope has fully animated away (see envelopeCollapsed in the
   script above), this wrapper is empty - collapsing its reserved height
   lets .cine-viewport slide up to fill the screen on its own, instead of
   sitting below a permanent blank 100dvh block the guest would otherwise
   have to scroll past manually. */
.envelope-shell-collapsed {
  min-height: 0;
}

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
  transition: transform 1.9s cubic-bezier(.45, 0, .15, 1);
  will-change: transform;
}

/* The couple's own venue photo (optional) - fixed to the viewport, not
   panned with .cine-world, so it reads as one constant backdrop the whole
   fly-through plays over. Sits behind .cine-world in paint order purely by
   DOM order (it's the earlier sibling), no z-index tug-of-war needed. */
.cine-photo-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.05) brightness(0.72);
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

/* When a background photo is set, .cine-bg switches from an opaque gradient
   to a translucent color scrim so the photo shows through while text stays
   readable - see the :class binding on .cine-bg in the template. */
.cine-bg-scrim {
  background:
    radial-gradient(600px 500px at 30% 4%, rgba(227, 176, 74, .12), transparent 60%),
    radial-gradient(700px 600px at 70% 22%, rgba(201, 120, 150, .08), transparent 60%),
    linear-gradient(175deg, rgba(20, 10, 28, .55), rgba(14, 7, 18, .72) 45%, rgba(10, 5, 14, .85) 100%);
}

.cine-petals { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

/* Smoke/mist wipe - see puffMist() in the script. Sits above the world but
   below the HUD, fixed to the viewport (not panned), so it reads as
   something drifting across the screen rather than part of the scene. */
.cine-mist {
  position: absolute;
  inset: -10%;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  background:
    radial-gradient(45% 35% at 30% 40%, rgba(255, 248, 235, 0.55), transparent 70%),
    radial-gradient(40% 30% at 70% 60%, rgba(255, 248, 235, 0.4), transparent 70%);
  filter: blur(30px);
  transition: opacity 0.85s ease;
}
.cine-mist-active { opacity: 1; }

/* A light ornamental frame around the cover/closing names - an arch-shaped
   ring in the couple's own accent color, with two soft color blooms at its
   corners, so the bookend stops feel like they sit inside something rather
   than just being centered text. Deliberately simple so it holds up across
   every theme's color palette, not just one. */
.cine-frame {
  position: relative;
  padding: 34px 26px 26px;
  border: 1px solid var(--theme-accent, #e3b04a);
  border-radius: 120px 120px 14px 14px;
  background: radial-gradient(circle at 50% 22%, color-mix(in srgb, var(--theme-accent, #e3b04a) 16%, transparent), transparent 65%);
}
.cine-frame::before,
.cine-frame::after {
  content: '';
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(1px);
}
.cine-frame::before {
  top: -8px;
  left: -10px;
  background: radial-gradient(circle, var(--theme-accent, #e3b04a), transparent 70%);
}
.cine-frame::after {
  bottom: -10px;
  right: -8px;
  background: radial-gradient(circle, rgba(201, 120, 150, .8), transparent 70%);
}
.cine-frame-wide { border-radius: 24px; padding: 26px 30px; }

/* Template 1's ornamental-arch cover (see coupleIllustrationUrl above) - an
   arch-shaped panel in the couple's own theme colors, with two small
   floral sprigs at its outer corners and a crescent moon + star motif at
   the top. Purely decorative around the same eyebrow/names/date content
   the plain .cine-frame already shows, so nothing here depends on any
   field that could be missing. */
.cine-arch { position: relative; width: 100%; max-width: 280px; }
.cine-arch-corner { position: absolute; width: 58px; height: 58px; top: -6px; z-index: 1; filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3)); }
.cine-arch-corner-tl { left: -12px; }
.cine-arch-corner-tr { right: -12px; transform: scaleX(-1); }
.cine-arch-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 22px 22px;
  color: var(--theme-ink, #f7ecf3);
  background: linear-gradient(165deg, color-mix(in srgb, var(--theme-accent) 20%, var(--theme-bg-via, #1c0f2e)) 0%, var(--theme-bg-via, #1c0f2e) 55%, var(--theme-bg-to, #150a20) 100%);
  border: 1px solid color-mix(in srgb, var(--theme-accent) 55%, transparent);
  clip-path: path('M0,250 C0,102 30,0 140,0 C250,0 280,102 280,250 L280,430 L0,430 Z');
}
.cine-arch-motif { width: 38px; height: 25px; margin-bottom: 6px; flex-shrink: 0; }
.cine-arch-photo {
  width: 64%;
  max-width: 168px;
  margin: 2px 0 10px;
  -webkit-mask-image: linear-gradient(180deg, #000 78%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 78%, transparent 100%);
}
.cine-arch-photo img { display: block; width: 100%; height: auto; filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.35)); }
.cine-arch-panel .cine-eyebrow { margin-bottom: 8px; }
.cine-arch-panel .cine-names {
  font-size: 1.55rem;
  line-height: 1.2;
  margin-bottom: 8px;
  max-width: 100%;
  overflow-wrap: break-word;
}
.cine-arch-panel .cine-date { margin-top: 2px; }

/* Venue diorama (see the venue stop above) - a small courtyard scene built
   from the couple's own theme accent color via color-mix(), so it reads
   correctly across every theme, not just one palette. Sits right after the
   cover, before the couple's own written scenes. */
.cine-venue-stop { width: 300px; }
.cine-venue { position: relative; width: 100%; aspect-ratio: 3 / 4; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px -14px rgba(0,0,0,.6); }
.cine-venue-sky { position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--theme-accent) 22%, #f6d29c) 0%, color-mix(in srgb, var(--theme-accent) 30%, #dd8548) 45%, color-mix(in srgb, var(--theme-accent) 15%, #9c4526) 100%); }
.cine-venue-roof { position: absolute; left: 0; right: 0; top: 22%; height: 36%; width: 100%; }
.cine-venue-floor {
  position: absolute; left: 0; right: 0; bottom: 0; height: 46%;
  background:
    repeating-linear-gradient(135deg, rgba(0,0,0,.06) 0 2px, transparent 2px 30px),
    repeating-linear-gradient(45deg, rgba(0,0,0,.06) 0 2px, transparent 2px 30px),
    linear-gradient(180deg, color-mix(in srgb, var(--theme-accent) 20%, #c1663a) 0%, color-mix(in srgb, var(--theme-accent) 10%, #9c4c28) 100%);
}
.cine-venue-signage {
  position: absolute; left: 50%; top: 47%; transform: translateX(-50%); text-align: center;
  background: rgba(0,0,0,.12); padding: 8px 14px; border-radius: 8px; backdrop-filter: blur(2px);
}
.cine-venue-signage .cine-eyebrow { margin-bottom: 4px; }
.cine-venue-names { font-family: var(--theme-heading-font, serif); font-style: italic; font-weight: 600; font-size: 1.05rem; color: #2c1608; }
.cine-venue-arch { position: absolute; left: 50%; top: 33%; transform: translateX(-50%); width: 58%; filter: drop-shadow(0 8px 12px rgba(0,0,0,.3)); }
.cine-venue-photo {
  position: absolute; left: 50%; bottom: 4%; transform: translateX(-50%); width: 44%;
  -webkit-mask-image: linear-gradient(180deg, #000 88%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 88%, transparent 100%);
}
.cine-venue-photo img { width: 100%; display: block; filter: drop-shadow(0 14px 18px rgba(0,0,0,.4)); }

.cine-greeting-names { margin-top: 14px; font-family: var(--theme-heading-font, serif); font-style: italic; font-size: 1.2rem; color: var(--theme-ink, #f7ecf3); }

/* Doa (prayer) card - a lighter double-border variant of .cine-card so it
   reads as its own quieter moment rather than another event-details box. */
.cine-card-doa { text-align: center; padding-top: 30px; }
.cine-card-doa::before, .cine-card-doa::after { display: none; }
.cine-doa-motif { width: 30px; height: 20px; margin: 0 auto 12px; display: block; }
.cine-doa-amin { margin-top: 10px; font-style: italic; color: var(--theme-accent); font-size: .82rem; }

/* Photo frames stop - two ornate frames with a ribbon bow, sharing the same
   couple picture as the cover (cropped to two focal points) since there's
   no separate solo bride/groom upload in the VIP dashboard yet. */
.cine-frames { position: relative; padding-top: 24px; }
.cine-frames-ribbon { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 60px; height: 38px; z-index: 1; }
.cine-frames-row { display: flex; gap: 12px; }
.cine-frame-box {
  width: 118px; height: 152px; border-radius: 4px; overflow: hidden;
  border: 6px solid color-mix(in srgb, var(--theme-accent) 45%, #cbb17f);
  box-shadow: 0 16px 28px -10px rgba(0,0,0,.5);
}
.cine-frame-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

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

/* Reveal effect: dim while the camera is elsewhere, come to full opacity
   only once the camera has actually arrived - "the content show, then
   gone" as the camera moves between stops, instead of every scene sitting
   fully visible the whole time. See stopClass() in the script. */
.cine-stop { max-width: 320px; text-align: center; opacity: 0.2; transition: opacity 1.3s ease; }
.cine-stop-active { opacity: 1; }
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

.cine-card {
  position: relative;
  background: rgba(20, 10, 24, .55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(227,176,74,.3);
  border-radius: 6px;
  padding: 26px 24px 24px;
  box-shadow: 0 16px 30px -14px rgba(0, 0, 0, 0.6);
}
/* Rolled top/bottom edges - reads as a hanging scroll or card propped in
   the scene rather than a flat glass rectangle floating on its own. */
.cine-card::before,
.cine-card::after {
  content: '';
  position: absolute;
  left: -4px;
  right: -4px;
  height: 10px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(227,176,74,.5), rgba(227,176,74,.15));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
}
.cine-card::before { top: -6px; }
.cine-card::after { bottom: -6px; }
/* The thread it hangs from - a faint vertical line up into the scene. */
.cine-card-stop { position: relative; }
.cine-card-stop::before {
  content: '';
  position: absolute;
  top: -34px;
  left: 50%;
  width: 1px;
  height: 34px;
  background: rgba(255, 255, 255, 0.28);
}
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
