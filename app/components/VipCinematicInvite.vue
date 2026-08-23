<template>
  <div class="theme-surface text-white relative overflow-hidden" :class="{ 'cine-embedded-root': embedded }" :style="styleVars">
    <CustomCodeBlock v-if="customCode.position === 'top'" class="relative z-20" />

    <div v-if="wedding.content.audioSrc && opened" class="fixed top-4 right-4 z-40">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <!-- Envelope gate: same tap-to-open ceremony as the classic layout. The
         tap is also the "user gesture" the browser needs to allow the music
         to autoplay, and it's the moment that kicks off the scene sequence
         below. -->
    <div class="envelope-shell" :class="{ 'envelope-shell-collapsed': envelopeCollapsed, 'cine-embedded': embedded }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />
    </div>

    <!-- The cinematic stage: a single fixed-size frame. Every scene below is
         a full-frame layer stacked on top of the others (position:absolute;
         inset:0) that crossfades in and out on its own timer - see goTo() /
         sceneKeys in the script. Nothing pans or zooms around a canvas -
         each scene is its own deliberately composed layout, always in the
         same place, matching how the reference invitation actually works
         (confirmed frame-by-frame against the couple's own reference
         video: one fixed card, whole layouts crossfade in place). -->
    <div v-if="opened" class="cine-viewport" :class="{ 'cine-embedded': embedded }">
      <!-- The couple's own venue photo (optional), fixed behind every scene. -->
      <div v-if="wedding.vipBackgroundImageUrl" class="cine-photo-backdrop" :style="{ backgroundImage: `url(${wedding.vipBackgroundImageUrl})` }"></div>
      <div class="cine-bg" :class="{ 'cine-bg-scrim': !!wedding.vipBackgroundImageUrl }"></div>
      <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" class="cine-petals" />

      <!-- Soft smoke/mist wipe that puffs across the screen at the start of
           each scene change (see puffMist() below). -->
      <div class="cine-mist" ref="mistEl"></div>

      <div class="cine-stage">

        <!-- SCENE: gate - always the very first scene (see sceneDefs in the
             script). A closed double door that swings open a beat after the
             envelope opens, revealing the couple's monogram before handing
             off to the cover card - real opening motion instead of the
             fly-through just cutting straight to a static card. -->
        <div class="cine-scene cine-scene-gate" :class="{ 'cine-scene-active': currentKey === 'gate' }">
          <div class="cine-gate" :class="{ 'cine-gate-open': gateOpen }">
            <div class="cine-gate-reveal">
              <img v-if="gateMonogramImage" :src="gateMonogramImage" alt="" class="cine-gate-reveal-image" />
              <div v-else class="cine-gate-reveal-monogram">{{ gateMonogramLabel }}</div>
            </div>
            <div class="cine-gate-panel cine-gate-panel-left">
              <div class="cine-gate-panel-seam"></div>
              <div class="cine-gate-panel-medallion"></div>
            </div>
            <div class="cine-gate-panel cine-gate-panel-right">
              <div class="cine-gate-panel-seam"></div>
              <div class="cine-gate-panel-medallion"></div>
            </div>
          </div>
        </div>

        <!-- SCENE: cover - a bordered keepsake card: eyebrow, names, date,
             address. Matches the reference invitation's opening card. -->
        <div class="cine-scene cine-scene-frame" :class="{ 'cine-scene-active': currentKey === 'cover' }">
          <div class="cine-bordered-card">
            <svg class="cine-corner cine-corner-tl" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-tr" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-bl" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-br" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <div class="cine-bordered-inner">
              <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
              <h1 class="cine-names">{{ wedding.content.brideName }}<span class="cine-amp">&amp;</span>{{ wedding.content.groomName }}</h1>
              <p class="cine-date">{{ wedding.content.dateLabel }}</p>
              <p v-if="wedding.content.venueAddress" class="cine-cover-address">{{ wedding.content.venueAddress }}</p>
            </div>
          </div>
        </div>

        <!-- SCENE: couple - the same bordered card, this time holding only
             the couple's own photo, no text at all - matching the reference
             exactly. Only appears once a photo is uploaded. -->
        <div v-if="wedding.content.coupleIllustrationUrl" class="cine-scene cine-scene-frame" :class="{ 'cine-scene-active': currentKey === 'couple' }">
          <div class="cine-bordered-card cine-bordered-card-photo">
            <svg class="cine-corner cine-corner-tl" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-tr" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-bl" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-br" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <div class="cine-couple-photo"><img :src="wedding.content.coupleIllustrationUrl" alt=""></div>
          </div>
        </div>

        <!-- SCENE: greeting - the couple's own words to their guests. -->
        <div class="cine-scene cine-scene-flat" :class="{ 'cine-scene-active': currentKey === 'greeting' }">
          <div class="cine-card">
            <div class="cine-eyebrow">{{ wedding.content.innerGreeting || "You're Invited" }}</div>
            <p class="cine-story-text">{{ wedding.content.story }}</p>
            <h3 class="cine-greeting-names">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</h3>
          </div>
        </div>

        <!-- SCENE: bride biodata - her portrait (cropped from the couple's
             own photo, if there is one) on one side, her full name +
             parents on the other, a flat themed background with no border -
             matching the reference's solo bride card exactly. Optional -
             skipped when both fields are empty. -->
        <div v-if="wedding.content.brideFullName || wedding.content.brideParents" class="cine-scene cine-scene-bio" :class="{ 'cine-scene-active': currentKey === 'brideBio' }">
          <svg class="cine-bio-branch" viewBox="0 0 200 400" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-10,20 C40,60 20,140 90,180 C160,220 130,300 190,410" fill="none" stroke="var(--theme-accent)" stroke-width="2" opacity="0.16"/>
            <ellipse cx="55" cy="88" rx="16" ry="8" fill="var(--theme-accent)" opacity="0.14" transform="rotate(35 55 88)"/>
            <ellipse cx="95" cy="176" rx="18" ry="9" fill="var(--theme-accent)" opacity="0.14" transform="rotate(-25 95 176)"/>
            <ellipse cx="150" cy="260" rx="16" ry="8" fill="var(--theme-accent)" opacity="0.14" transform="rotate(40 150 260)"/>
            <ellipse cx="170" cy="360" rx="18" ry="9" fill="var(--theme-accent)" opacity="0.14" transform="rotate(-20 170 360)"/>
          </svg>
          <div v-if="wedding.content.coupleIllustrationUrl" class="cine-bio-portrait">
            <img :src="wedding.content.coupleIllustrationUrl" style="object-position: 80% 12%;" alt="">
          </div>
          <div class="cine-bio-text">
            <div class="cine-bio-label">{{ wedding.content.familyBrideLabel || 'Bride' }}</div>
            <h2 class="cine-bio-name">{{ wedding.content.brideFullName || wedding.content.brideName }}</h2>
            <p v-if="wedding.content.brideParents" class="cine-bio-parents">{{ wedding.content.childOfLabel || 'Child of' }}<br>{{ wedding.content.brideParents }}</p>
          </div>
        </div>

        <!-- SCENE: groom biodata - mirrored (see brideBio above), plus a
             faint mosque-dome watermark, matching the reference's groom
             card. Optional - skipped when both fields are empty. -->
        <div v-if="wedding.content.groomFullName || wedding.content.groomParents" class="cine-scene cine-scene-bio cine-scene-bio-mirror" :class="{ 'cine-scene-active': currentKey === 'groomBio' }">
          <svg class="cine-bio-branch" viewBox="0 0 200 400" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-10,20 C40,60 20,140 90,180 C160,220 130,300 190,410" fill="none" stroke="var(--theme-accent)" stroke-width="2" opacity="0.16"/>
            <ellipse cx="55" cy="88" rx="16" ry="8" fill="var(--theme-accent)" opacity="0.14" transform="rotate(35 55 88)"/>
            <ellipse cx="95" cy="176" rx="18" ry="9" fill="var(--theme-accent)" opacity="0.14" transform="rotate(-25 95 176)"/>
            <ellipse cx="150" cy="260" rx="16" ry="8" fill="var(--theme-accent)" opacity="0.14" transform="rotate(40 150 260)"/>
            <ellipse cx="170" cy="360" rx="18" ry="9" fill="var(--theme-accent)" opacity="0.14" transform="rotate(-20 170 360)"/>
          </svg>
          <svg class="cine-bio-dome" viewBox="0 0 200 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <path d="M60,120 L60,70 A40,40 0 0 1 140,70 L140,120 Z" fill="var(--theme-accent)"/>
            <rect x="96" y="30" width="8" height="26" fill="var(--theme-accent)"/>
            <circle cx="100" cy="24" r="7" fill="none" stroke="var(--theme-accent)" stroke-width="3"/>
          </svg>
          <div v-if="wedding.content.coupleIllustrationUrl" class="cine-bio-portrait">
            <img :src="wedding.content.coupleIllustrationUrl" style="object-position: 20% 12%;" alt="">
          </div>
          <div class="cine-bio-text">
            <div class="cine-bio-label">{{ wedding.content.familyGroomLabel || 'Groom' }}</div>
            <h2 class="cine-bio-name">{{ wedding.content.groomFullName || wedding.content.groomName }}</h2>
            <p v-if="wedding.content.groomParents" class="cine-bio-parents">{{ wedding.content.childOfLabel || 'Child of' }}<br>{{ wedding.content.groomParents }}</p>
          </div>
        </div>

        <!-- SCENES: VIP scenes - the couple's own narrative content, written
             and ordered from the admin's Full Scene Manager (see
             VipScenesPanel.vue). Rendered generically: an optional image,
             a title, and body text - whatever the couple wrote. -->
        <div
          v-for="scene in vipScenes"
          :key="scene.id"
          class="cine-scene cine-scene-flat"
          :class="{ 'cine-scene-active': currentKey === ('vip-' + scene.id) }"
        >
          <div class="cine-card">
            <img v-if="scene.imageUrl" :src="scene.imageUrl" alt="" class="cine-scene-img">
            <h3 v-if="scene.title">{{ scene.title }}</h3>
            <p v-if="scene.body" class="cine-story-text">{{ scene.body }}</p>
          </div>
        </div>

        <!-- SCENE: event details -->
        <div class="cine-scene cine-scene-flat" :class="{ 'cine-scene-active': currentKey === 'event' }">
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

        <!-- SCENE: doa (prayer) - optional, off by default (see enableDoa on
             the Wedding Details page). -->
        <div v-if="wedding.content.enableDoa" class="cine-scene cine-scene-flat" :class="{ 'cine-scene-active': currentKey === 'doa' }">
          <div class="cine-card cine-card-doa">
            <svg class="cine-doa-motif" viewBox="0 0 46 30" aria-hidden="true">
              <path d="M17,15 A9,9 0 1 0 17,-3 A7,7 0 1 1 17,15 Z" fill="var(--theme-accent)" transform="translate(0,9)"/>
              <path d="M32,6 C32.6,7.6 33.9,8.7 35.6,8.9 C33.9,9.1 32.6,10.2 32,11.8 C31.4,10.2 30.1,9.1 28.4,8.9 C30.1,8.7 31.4,7.6 32,6 Z" fill="var(--theme-ink, #f7ecf3)"/>
            </svg>
            <p class="cine-story-text">{{ wedding.content.doaText || defaultDoaText }}</p>
            <p class="cine-doa-amin">Amin Ya Rabbal 'Alamin</p>
          </div>
        </div>

        <!-- SCENE: photo frames - reuses the couple's own photo (there's no
             separate individual bride/groom upload in the VIP dashboard
             yet), cropped to two focal points so each frame reads as its
             own portrait. -->
        <div v-if="wedding.content.coupleIllustrationUrl" class="cine-scene cine-scene-flat" :class="{ 'cine-scene-active': currentKey === 'frames' }">
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

        <!-- SCENE: location - a mosque-dome-and-minaret skyline silhouette,
             matching the reference's closing/location card, plus a real
             scannable QR code (the reference is a generic template with no
             real functionality behind it - guests actually need this). -->
        <div v-if="wedding.content.mapUrl" class="cine-scene cine-scene-location" :class="{ 'cine-scene-active': currentKey === 'location' }">
          <div class="cine-location-sky"></div>
          <svg class="cine-location-skyline" viewBox="0 0 400 180" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
              <linearGradient id="skylineFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="color-mix(in srgb, var(--theme-accent) 55%, #b5652f)" stop-opacity="0"/>
                <stop offset="35%" stop-color="color-mix(in srgb, var(--theme-accent) 55%, #b5652f)" stop-opacity="1"/>
              </linearGradient>
            </defs>
            <path d="M0,180 L0,140 C20,140 20,110 40,110 C46,90 60,78 70,78 C74,58 90,40 100,40 C110,40 126,58 130,78 C140,78 154,90 160,110 C180,110 180,140 200,140 C220,140 220,110 240,110 C246,90 260,78 270,78 C274,58 290,40 300,40 C310,40 326,58 330,78 C340,78 354,90 360,110 C380,110 380,140 400,140 L400,180 Z" fill="url(#skylineFade)"/>
            <circle cx="100" cy="26" r="6" fill="color-mix(in srgb, var(--theme-accent) 70%, white)"/>
            <circle cx="300" cy="26" r="6" fill="color-mix(in srgb, var(--theme-accent) 70%, white)"/>
            <path d="M92,20 A8,8 0 1 0 100,8 A6,6 0 1 1 92,20 Z" fill="color-mix(in srgb, var(--theme-accent) 80%, white)"/>
          </svg>
          <div class="cine-location-content">
            <div class="cine-eyebrow">{{ wedding.content.locationHeading || 'Location' }}</div>
            <p class="cine-location-address">
              <template v-if="wedding.content.venueName">{{ wedding.content.venueName }}<br></template>{{ wedding.content.venueAddress }}
            </p>
            <p v-if="wedding.content.dateLabel" class="cine-location-date">{{ wedding.content.dateLabel }}</p>
            <p class="cine-location-subtitle">{{ wedding.content.locationSubtitle || 'Scan or tap to open in Maps' }}</p>
            <div class="cine-qr"><img :src="qrCodeUrl" alt="QR code linking to the venue" loading="lazy"></div>
            <UButton :to="wedding.content.mapUrl" target="_blank" external icon="i-heroicons-map-pin" color="primary" class="rounded-full mt-3">
              {{ wedding.content.locationMapsButtonLabel || 'Google Maps' }}
            </UButton>
          </div>
        </div>

        <!-- SCENE: gift -->
        <div v-if="hasGift" class="cine-scene cine-scene-flat" :class="{ 'cine-scene-active': currentKey === 'gift' }">
          <div class="cine-card">
            <h3>A Gift of Love</h3>
            <GiftCard :banks="[wedding.content.bank, wedding.content.bank2]" />
          </div>
        </div>

        <!-- SCENE: flow -->
        <div v-if="wedding.flow?.length" class="cine-scene cine-scene-flat" :class="{ 'cine-scene-active': currentKey === 'flow' }">
          <div class="cine-card">
            <h3>{{ wedding.content.eventFlowHeading || 'Event Flow' }}</h3>
            <FlowTimeline :items="wedding.flow" />
          </div>
        </div>

        <!-- SCENE: closing / RSVP - the sequence settles here. -->
        <div class="cine-scene cine-scene-frame" :class="{ 'cine-scene-active': currentKey === 'closing' }">
          <div class="cine-bordered-card cine-bordered-card-wide">
            <svg class="cine-corner cine-corner-tl" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-tr" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-bl" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <svg class="cine-corner cine-corner-br" viewBox="0 0 60 60" aria-hidden="true">
              <path d="M4,2 C24,6 42,18 54,36" fill="none" stroke="var(--theme-accent)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
              <circle cx="18" cy="14" r="7" fill="var(--theme-accent)" opacity="0.85"/>
              <circle cx="30" cy="26" r="5" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
              <circle cx="10" cy="30" r="4" fill="color-mix(in srgb, var(--theme-accent) 55%, white)" opacity="0.9"/>
            </svg>
            <div class="cine-bordered-inner">
              <div class="cine-eyebrow">Join Our Celebration</div>
              <h2 class="cine-subnames">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</h2>
              <UButton v-if="wedding.content.rsvpEnabled !== false" :to="rsvpLink" size="lg" color="primary" class="cine-cta">
                {{ wedding.content.btnRsvp || 'RSVP Now' }}
              </UButton>
              <div class="mt-4 opacity-85"><ShareButtons :bride-name="wedding.content.brideName" :groom-name="wedding.content.groomName" :date-label="wedding.content.dateLabel" :share-message="wedding.content.shareMessage" /></div>
            </div>
          </div>
        </div>

        <CustomCodeBlock v-if="customCode.position !== 'top'" class="cine-scene cine-scene-flat" />
      </div>

      <div class="cine-hud">
        <span v-for="(key, i) in sceneKeys" :key="key" class="cine-dot" :class="{ on: i === currentIndex }"></span>
      </div>
      <button v-if="hasFocus && !playingFull" type="button" class="cine-focus-toggle" @click="playFull">
        &#9654; Play full fly-through
      </button>
      <button v-else-if="hasFocus && playingFull" type="button" class="cine-focus-toggle" @click="backToFocusScene">
        &#9208; Back to this scene
      </button>
      <button v-else-if="!hasFocus && currentIndex < sceneKeys.length - 1" type="button" class="cine-skip" @click="skipToEnd">Skip to RSVP &rarr;</button>

      <!-- Preview-only reset: lets the couple replay the fly-through from
           scene 1 without leaving/reopening the dashboard page. Never shown
           on the real guest page - a real guest only ever taps the envelope
           once. -->
      <button v-if="embedded" type="button" class="cine-reset-toggle" title="Replay from the start" @click="restartPreview">
        &#8635; Replay
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// The VIP "cinematic" layout: after the envelope opens, a sequence of
// fixed, full-frame scenes crossfade in and out on their own timer - no
// scrolling, no taps required from the guest, no camera panning across a
// canvas. Each scene is its own deliberately composed layout (see the
// SCENE comments in the template) instead of one shared card template
// reused everywhere - matching how the reference invitation is actually
// built (confirmed frame-by-frame against the couple's own reference
// video: one fixed card, whole layouts crossfade in place, not a camera
// moving through space).
import { autoMonogramText, type WeddingDoc } from '~/composables/useWeddingTypes'

const props = withDefaults(defineProps<{
  wedding: WeddingDoc
  guestName?: string
  rsvpLink: string
  /**
   * True when this instance is mounted inside a small dashboard preview
   * frame (see the "Live Preview" panels across the VIP dashboard) instead
   * of the real full-screen guest page. The only real difference is that
   * .envelope-shell/.cine-viewport normally reserve `100dvh` (the real
   * device screen), which would blow out of a small bezel - in embedded
   * mode they reserve `100%` of their own parent instead. Everything else
   * (scene content, theme, sequencing) is the exact same component doing
   * the exact same thing at a smaller size - this is the same component as
   * the live guest page, not a second reimplementation to keep in sync.
   */
  embedded?: boolean
  /**
   * When set on an embedded dashboard preview, the preview skips the
   * tap-to-open envelope entirely and holds on this one scene (by its
   * currentKey value, e.g. 'gift', 'flow', 'location') instead of playing
   * through the whole fly-through - so the Gift page's preview actually
   * shows the Gift scene, the Flow page's shows Flow, etc., rather than
   * every dashboard page looking like the same autoplaying loop from the
   * cover. A "Play full fly-through" button lets the couple still watch
   * the whole thing from here without leaving the page. Ignored (no
   * effect) when embedded is false - the real guest page always plays the
   * full sequence from the envelope.
   */
  focusScene?: string
}>(), {
  guestName: '',
  embedded: false,
  focusScene: ''
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

// Embedded dashboard previews skip the tap-to-open envelope entirely and
// start already "opened" - a couple checking their Gift or Flow editor
// wants to see the actual scene content immediately, not a closed envelope
// they have to remember to tap. The real guest page (embedded=false) always
// starts closed, same tap-to-open ceremony as before.
const opened = ref(props.embedded)

// EnvelopeIntro's own wrapper reserves a full 100dvh so the closed envelope
// has room to sit and its open animation has room to play. envelopeCollapsed
// flips once its slowest close animation has had time to finish, and the
// now-empty wrapper collapses out of the way so .cine-viewport takes over
// the screen immediately instead of leaving a blank block to scroll past.
const envelopeCollapsed = ref(props.embedded)
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

// Simple static countdown snapshot for the event-details scene - the full
// live-ticking CountdownTimer isn't needed here since it only shows for a
// few seconds.
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
// generically between the automatic bride/groom bio scenes and the
// automatic data-bound scenes (event/location/gift/flow/closing) below.
const vipScenes = computed(() => props.wedding.vipScenes || [])

// ---- scene sequence ----
// The full ordered list of possible scenes, each with the same visibility
// rule as its `v-if` in the template above (kept side by side on purpose -
// if one changes, find the matching SCENE comment and update the other).
// sceneKeys is just this list filtered down to what this couple actually
// has filled in.
const sceneDefs = computed(() => {
  const c = props.wedding.content
  const defs: Array<{ key: string; visible: boolean }> = [
    { key: 'gate', visible: true },
    { key: 'cover', visible: true },
    { key: 'couple', visible: !!c.coupleIllustrationUrl },
    { key: 'greeting', visible: true },
    { key: 'brideBio', visible: !!(c.brideFullName || c.brideParents) },
    { key: 'groomBio', visible: !!(c.groomFullName || c.groomParents) },
    ...vipScenes.value.map((scene) => ({ key: `vip-${scene.id}`, visible: true })),
    { key: 'event', visible: true },
    { key: 'doa', visible: !!c.enableDoa },
    { key: 'frames', visible: !!c.coupleIllustrationUrl },
    { key: 'location', visible: !!c.mapUrl },
    { key: 'gift', visible: hasGift.value },
    { key: 'flow', visible: !!(props.wedding.flow && props.wedding.flow.length) },
    { key: 'closing', visible: true }
  ]
  return defs.filter((d) => d.visible)
})
const sceneKeys = computed(() => sceneDefs.value.map((d) => d.key))
const currentIndex = ref(0)
const currentKey = computed(() => sceneKeys.value[currentIndex.value])

// SCENE: gate - see the template below. Doors start closed and swing open
// a beat later - playGateIntro() arms that beat and is called explicitly
// everywhere playback restarts from scene 0 (first envelope open, the
// Replay button, "Play full fly-through"), rather than being driven off
// currentKey - currentIndex is already 0 by default before the envelope
// even opens, so a plain watch(currentKey) would fire (and start the timer)
// the instant the component mounts, long before the guest actually taps
// the envelope, leaving the doors already open by the time they see them.
const gateOpen = ref(false)
let gateTimer: ReturnType<typeof setTimeout> | null = null
function playGateIntro() {
  if (gateTimer) clearTimeout(gateTimer)
  gateOpen.value = false
  gateTimer = setTimeout(() => { gateOpen.value = true }, 450)
}

// What's revealed once the gate opens - the couple's own monogram setup
// (Wedding Details > Monogram) when they've turned it on, otherwise a
// simple auto "B & G" initials mark so the gate never opens on nothing.
const gateMonogramImage = computed(() => {
  const c = props.wedding.content
  return c.monogramEnabled && c.monogramType === 'upload' && c.monogramImageUrl ? c.monogramImageUrl : ''
})
const gateMonogramLabel = computed(() => {
  const c = props.wedding.content
  if (c.monogramEnabled && c.monogramType === 'custom-text' && c.monogramText) return c.monogramText
  return autoMonogramText(c.brideName, c.groomName)
})

// How long each scene type holds before crossfading to the next - tuned to
// match the reference video's own pacing (roughly 3-4 seconds per beat).
// VIP custom scenes use the couple's own explicit hold (see
// VipScenesPanel.vue) when set, or an auto value based on how much they
// wrote.
const HOLD_MS: Record<string, number> = {
  gate: 3400, cover: 4200, couple: 3200, greeting: 3600, brideBio: 3800, groomBio: 3800,
  event: 4200, doa: 3800, frames: 3400, location: 4600, gift: 3800, flow: 4000
}
function holdFor(key: string) {
  if (key.startsWith('vip-')) {
    const id = key.slice(4)
    const scene = vipScenes.value.find((s) => s.id === id)
    if (scene?.holdSeconds) return scene.holdSeconds * 1000
    const len = ((scene?.title || '') + (scene?.body || '')).trim().length
    return Math.min(5200, Math.max(2600, len * 30))
  }
  return HOLD_MS[key] ?? 3600
}

// A brief smoke/mist puff at the start of each automatic scene change (not
// the very first instant jump, and not the instant jump from Skip to RSVP -
// both of those are meant to feel immediate, not misty).
const mistEl = ref<HTMLElement | null>(null)
function puffMist() {
  const el = mistEl.value
  if (!el) return
  el.classList.add('cine-mist-active')
  setTimeout(() => { el.classList.remove('cine-mist-active') }, 900)
}

let timer: ReturnType<typeof setTimeout> | null = null
// Must stay in sync with .cine-scene's CSS transition duration below.
const TRANSITION_MS = 1000

function goTo(i: number, instant?: boolean) {
  if (timer) clearTimeout(timer)
  currentIndex.value = i
  if (!instant) puffMist()
  if (i >= sceneKeys.value.length - 1) return
  timer = setTimeout(() => goTo(i + 1), TRANSITION_MS + holdFor(sceneKeys.value[i]))
}

function skipToEnd() {
  goTo(sceneKeys.value.length - 1, true)
}

// focusScene support (embedded dashboard previews only - see the prop doc
// above). hasFocus is false whenever the couple hasn't filled in whatever
// makes that scene appear yet (e.g. the Gift page before any bank details
// are saved) - in that case there's nothing to hold on, so it falls back to
// the normal full autoplay below instead of showing a blank/missing scene.
const focusIndex = computed(() => (props.focusScene ? sceneKeys.value.indexOf(props.focusScene) : -1))
const hasFocus = computed(() => props.embedded && focusIndex.value >= 0)
const playingFull = ref(false)
function showFocusScene() {
  if (timer) clearTimeout(timer)
  currentIndex.value = focusIndex.value
}
function playFull() {
  playingFull.value = true
  playGateIntro()
  goTo(0, true)
}
function backToFocusScene() {
  playingFull.value = false
  showFocusScene()
}
// Preview-only "Replay" control (see the button in the template) - jumps
// back to scene 1 and re-runs the full autoplay sequence from there, same
// as the very first render, so the couple can watch it again as many times
// as they like instead of it just sitting on the last scene once it ends.
function restartPreview() {
  if (!props.embedded) return
  playingFull.value = true
  playGateIntro()
  goTo(0, true)
}
// Re-focus automatically the moment this scene becomes available - e.g. the
// Gift page's preview switches from the full autoplay loop to holding on
// the actual Gift scene as soon as the couple's typed enough to make it
// appear, without needing to reopen the page.
watch(hasFocus, (has) => {
  if (has && !playingFull.value) showFocusScene()
})

const reduceMotion = ref(false)
watch(opened, async (value) => {
  if (!value) return
  await nextTick()
  if (hasFocus.value && !playingFull.value) {
    showFocusScene()
    return
  }
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) {
    // Reduced-motion guests skip the whole fly-through (existing behavior,
    // unchanged) - so there's no point arming the gate's door animation.
    goTo(sceneKeys.value.length - 1, true)
  } else {
    playGateIntro()
    goTo(0, true)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  if (gateTimer) clearTimeout(gateTimer)
})
</script>

<style scoped>
/* Embedded mode (see the `embedded` prop above) - a small dashboard preview
   frame has a fixed pixel height, not a real device screen, so `100dvh`
   would blow out of it. These three rules are the ONLY difference between
   the embedded and real full-screen render. */
.cine-embedded-root {
  height: 100%;
}
.envelope-shell.cine-embedded {
  min-height: 100%;
  height: 100%;
}
/* .envelope-shell-collapsed alone (1 class) loses a specificity fight
   against .envelope-shell.cine-embedded (2 classes) - without this rule,
   an embedded preview's envelope wrapper never actually collapses once the
   envelope opens, so it keeps reserving the full 100% height of the phone
   bezel and pushes .cine-viewport (the actual scene content) out of the
   visible, overflow-hidden frame - leaving only the flat background color
   showing. This 3-class rule outranks both and forces the real collapse. */
.envelope-shell.cine-embedded.envelope-shell-collapsed {
  min-height: 0;
  height: 0;
}
.cine-viewport.cine-embedded {
  min-height: 100%;
  height: 100%;
}

.envelope-shell {
  position: relative;
  overflow: hidden;
  min-height: 100dvh;
  transition: min-height 0.4s ease;
}
.envelope-shell-collapsed {
  min-height: 0;
}

.cine-viewport {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
}

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
  inset: 0;
  background:
    radial-gradient(600px 500px at 30% 4%, rgba(227, 176, 74, .14), transparent 60%),
    radial-gradient(700px 600px at 70% 22%, rgba(201, 120, 150, .10), transparent 60%),
    radial-gradient(700px 600px at 30% 45%, rgba(120, 140, 180, .08), transparent 60%),
    linear-gradient(175deg, var(--theme-bg-from, #2a1245), var(--theme-bg-via, #1c0f2e) 45%, var(--theme-bg-to, #150a20) 100%);
  z-index: 0;
}
.cine-bg-scrim {
  background:
    radial-gradient(600px 500px at 30% 4%, rgba(227, 176, 74, .12), transparent 60%),
    radial-gradient(700px 600px at 70% 22%, rgba(201, 120, 150, .08), transparent 60%),
    linear-gradient(175deg, rgba(20, 10, 28, .55), rgba(14, 7, 18, .72) 45%, rgba(10, 5, 14, .85) 100%);
}

.cine-petals { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

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

/* The stage: every scene is a full-frame layer stacked here, one active at
   a time - see currentKey in the script. This replaces the old
   camera-pans-across-a-canvas engine: now each scene is its own fixed,
   deliberately composed layout that simply crossfades in and out in place. */
.cine-stage { position: absolute; inset: 0; z-index: 2; }

.cine-scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  opacity: 0;
  pointer-events: none;
  /* A scene that isn't active sits very slightly drifted/zoomed - when it
     becomes active it settles into place, and the scene it replaces drifts
     the opposite way as it fades - so every change reads as the camera
     gliding to the next moment instead of a flat cut, matching the
     reference videos' drifting camera instead of a plain crossfade. */
  transform: scale(1.035) translateX(2.4%);
  transition: opacity 1s ease, transform 1.4s cubic-bezier(.22, .61, .36, 1);
}
.cine-scene-active { opacity: 1; pointer-events: auto; z-index: 1; transform: scale(1) translateX(0); }
.cine-scene-flat { flex-direction: column; }

/* SCENE: gate - a closed double door filling the whole frame (no padding,
   unlike every other scene) that slides open to the sides, revealing the
   couple's monogram sitting behind it. See gateOpen/playGateIntro() above. */
.cine-scene-gate { padding: 0; }
.cine-gate { position: absolute; inset: 0; overflow: hidden; }

.cine-gate-reveal {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(.82);
  transition: opacity .7s ease .25s, transform .7s cubic-bezier(.34, 1.56, .64, 1) .25s;
}
.cine-gate-open .cine-gate-reveal { opacity: 1; transform: scale(1); }

.cine-gate-reveal-monogram {
  font-family: var(--theme-heading-font, 'Great Vibes', cursive);
  font-size: 2.8rem;
  color: var(--theme-accent);
  letter-spacing: .04em;
  text-shadow: 0 2px 18px color-mix(in srgb, var(--theme-accent) 50%, transparent);
}
.cine-gate-reveal-image {
  max-width: 140px;
  max-height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, .4));
}

.cine-gate-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 2;
  background: linear-gradient(165deg, color-mix(in srgb, var(--theme-accent) 14%, var(--theme-bg-via, #1c0f2e)) 0%, var(--theme-bg-via, #1c0f2e) 55%, var(--theme-bg-to, #150a20) 100%);
  transition: transform 1.1s cubic-bezier(.65, 0, .35, 1);
}
.cine-gate-panel-left { left: 0; transform: translateX(0); box-shadow: inset -1px 0 0 color-mix(in srgb, var(--theme-accent) 40%, transparent); }
.cine-gate-panel-right { right: 0; transform: translateX(0); box-shadow: inset 1px 0 0 color-mix(in srgb, var(--theme-accent) 40%, transparent); }
.cine-gate-open .cine-gate-panel-left { transform: translateX(-102%); }
.cine-gate-open .cine-gate-panel-right { transform: translateX(102%); }

.cine-gate-panel-seam {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, transparent, var(--theme-accent), transparent);
}
.cine-gate-panel-left .cine-gate-panel-seam { right: 0; }
.cine-gate-panel-right .cine-gate-panel-seam { left: 0; }

.cine-gate-panel-medallion {
  position: absolute;
  top: 20%;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--theme-accent);
  background: color-mix(in srgb, var(--theme-accent) 18%, var(--theme-bg-via, #1c0f2e));
  box-shadow: 0 0 0 4px var(--theme-bg-to, #150a20), 0 4px 14px rgba(0, 0, 0, .4);
}
.cine-gate-panel-left .cine-gate-panel-medallion { right: -17px; }
.cine-gate-panel-right .cine-gate-panel-medallion { left: -17px; }

/* Bordered keepsake card - cover, couple photo, and closing all share this
   frame, the way the reference invitation's cover and couple pages share
   one bordered card. A double ring (accent color, a gap, a second accent
   ring) stands in for a woven border, with a small floral sprig at each
   corner. */
.cine-bordered-card {
  position: relative;
  width: 100%;
  max-width: 280px;
  padding: 36px 24px 30px;
  border-radius: 4px;
  text-align: center;
  background: linear-gradient(165deg, color-mix(in srgb, var(--theme-accent) 14%, var(--theme-bg-via, #1c0f2e)) 0%, var(--theme-bg-via, #1c0f2e) 55%, var(--theme-bg-to, #150a20) 100%);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--theme-accent) 70%, transparent),
    0 0 0 7px var(--theme-bg-to, #150a20),
    0 0 0 8px color-mix(in srgb, var(--theme-accent) 45%, transparent),
    0 25px 55px -20px rgba(0, 0, 0, .7);
}
.cine-bordered-card-wide { max-width: 300px; }
.cine-bordered-card-photo { padding: 16px; }

.cine-corner { position: absolute; width: 42px; height: 42px; z-index: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
.cine-corner-tl { top: 6px; left: 6px; }
.cine-corner-tr { top: 6px; right: 6px; transform: scaleX(-1); }
.cine-corner-bl { bottom: 6px; left: 6px; transform: scaleY(-1); }
.cine-corner-br { bottom: 6px; right: 6px; transform: scale(-1, -1); }

.cine-bordered-inner { position: relative; }
.cine-cover-address { margin-top: 10px; font-size: .74rem; color: rgba(247,236,243,.55); letter-spacing: .03em; }

.cine-couple-photo { border-radius: 2px; overflow: hidden; }
.cine-couple-photo img { width: 100%; display: block; }

/* Bride/groom biodata - flat themed background (no border, matching the
   reference), a portrait cropped from the couple's own photo on one side,
   name + parents on the other. .cine-scene-bio-mirror flips the layout for
   the groom, matching the reference's mirrored bride/groom pair. */
.cine-scene-bio {
  flex-direction: row-reverse;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  padding: 0 20px;
  text-align: left;
  overflow: hidden;
}
.cine-scene-bio-mirror { flex-direction: row; text-align: right; }
.cine-bio-branch { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
.cine-scene-bio-mirror .cine-bio-branch { transform: scaleX(-1); }
.cine-bio-dome { position: absolute; top: 6%; left: 50%; transform: translateX(-50%); width: 55%; opacity: .1; z-index: 0; }
.cine-bio-portrait {
  position: relative; z-index: 1; width: 44%; max-width: 160px; align-self: flex-end; margin-bottom: 6%;
  -webkit-mask-image: linear-gradient(180deg, #000 82%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 82%, transparent 100%);
}
.cine-bio-portrait img { width: 100%; display: block; filter: drop-shadow(0 16px 20px rgba(0,0,0,.4)); }
.cine-bio-text { position: relative; z-index: 1; flex: 1; padding-bottom: 22%; }
.cine-bio-label {
  font-family: var(--theme-heading-font, serif); font-style: italic; font-weight: 500;
  font-size: 1rem; letter-spacing: .04em; color: var(--theme-accent); margin-bottom: 6px;
}
.cine-bio-name { font-family: var(--theme-heading-font, serif); font-weight: 700; font-size: 1.55rem; line-height: 1.15; color: var(--theme-ink, #f7ecf3); margin: 0 0 10px; text-transform: uppercase; }
.cine-bio-parents { font-size: .78rem; line-height: 1.65; color: rgba(247,236,243,.68); }

.cine-greeting-names { margin-top: 14px; font-family: var(--theme-heading-font, serif); font-style: italic; font-size: 1.2rem; color: var(--theme-ink, #f7ecf3); }

.cine-card-doa { text-align: center; padding-top: 30px; }
.cine-doa-motif { width: 30px; height: 20px; margin: 0 auto 12px; display: block; }
.cine-doa-amin { margin-top: 10px; font-style: italic; color: var(--theme-accent); font-size: .82rem; }

.cine-frames { position: relative; padding-top: 24px; }
.cine-frames-ribbon { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 60px; height: 38px; z-index: 1; }
.cine-frames-row { display: flex; gap: 12px; }
.cine-frame-box {
  width: 118px; height: 152px; border-radius: 4px; overflow: hidden;
  border: 6px solid color-mix(in srgb, var(--theme-accent) 45%, #cbb17f);
  box-shadow: 0 16px 28px -10px rgba(0,0,0,.5);
}
.cine-frame-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Location - a mosque-dome-and-minaret skyline silhouette, matching the
   reference's closing card, with the couple's real address/date and a
   scannable QR code (real functionality the generic reference template
   doesn't need, but guests do). */
.cine-scene-location { flex-direction: column; justify-content: flex-end; padding-bottom: 34px; text-align: center; overflow: hidden; }
.cine-location-sky {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--theme-accent) 10%, var(--theme-bg-from, #2a1245)) 0%, color-mix(in srgb, var(--theme-accent) 22%, var(--theme-bg-to, #150a20)) 100%);
}
.cine-location-skyline { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 38%; opacity: .85; }
.cine-location-content { position: relative; z-index: 1; }
.cine-location-address { font-weight: 600; font-size: .95rem; line-height: 1.5; color: var(--theme-ink, #f7ecf3); }
.cine-location-date { margin-top: 4px; font-size: .74rem; letter-spacing: .05em; color: rgba(247,236,243,.6); }
.cine-location-subtitle { margin-top: 10px; font-size: .72rem; opacity: .55; color: var(--theme-ink, #f7ecf3); }

.cine-eyebrow { font-size: .66rem; letter-spacing: .32em; text-transform: uppercase; color: var(--theme-accent); margin-bottom: 10px; }
.cine-names { font-family: var(--theme-heading-font, serif); font-style: italic; font-weight: 500; font-size: 2.3rem; line-height: 1.1; margin: 0 0 10px; color: var(--theme-ink, #f7ecf3); overflow-wrap: break-word; }
.cine-amp { color: var(--theme-accent); font-size: .6em; margin: 0 .12em; }
.cine-date { font-size: .82rem; color: rgba(247, 236, 243, .7); letter-spacing: .06em; }

.cine-subnames { font-family: var(--theme-heading-font, serif); font-weight: 500; font-size: 1.4rem; margin: 6px 0 16px; color: var(--theme-ink, #f7ecf3); }

.cine-scene-img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 14px; display: block; }

.cine-card {
  position: relative;
  width: 300px;
  max-width: 100%;
  background: rgba(20, 10, 24, .55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(227,176,74,.3);
  border-radius: 6px;
  padding: 26px 24px 24px;
  text-align: center;
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
.cine-card-doa::before, .cine-card-doa::after { display: none; }
.cine-card h3 { font-family: var(--theme-heading-font, serif); font-weight: 500; font-size: 1.4rem; margin: 0 0 10px; color: var(--theme-ink, #f7ecf3); }
.cine-card p { font-size: .84rem; line-height: 1.7; color: rgba(247,236,243,.72); margin: 4px 0; }
.cine-story-text { white-space: pre-line; }
.cine-strong { font-weight: 600; color: var(--theme-ink, #f7ecf3); }
.cine-dim { color: rgba(247,236,243,.6); }

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

.cine-focus-toggle {
  position: absolute; top: 16px; right: 16px; z-index: 20;
  background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.2);
  color: rgba(247,236,243,.8); font-size: .64rem; letter-spacing: .03em;
  padding: 7px 12px; border-radius: 999px; cursor: pointer;
}
.cine-focus-toggle:hover { color: #fff; border-color: rgba(255,255,255,.4); }

.cine-reset-toggle {
  position: absolute; top: 16px; left: 16px; z-index: 20;
  background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.2);
  color: rgba(247,236,243,.8); font-size: .64rem; letter-spacing: .03em;
  padding: 7px 12px; border-radius: 999px; cursor: pointer;
}
.cine-reset-toggle:hover { color: #fff; border-color: rgba(255,255,255,.4); }

@media (prefers-reduced-motion: reduce) {
  .cine-scene { transition: none !important; }
  .cine-gate-panel, .cine-gate-reveal { transition: none !important; }
}
</style>
