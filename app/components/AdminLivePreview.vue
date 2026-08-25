<template>
  <UModal v-model:open="isOpen" :title="titles[mode]" :ui="{ content: 'sm:max-w-3xl' }">
    <template #body>
      <div class="space-y-5">
        <UAlert
          icon="i-heroicons-eye"
          color="info"
          variant="soft"
          title="Generic preview - not any real couple's wedding"
          :description="descriptions[mode]"
        />

        <!-- USER DASHBOARD: the real /dashboard shell layout (same markup,
             classes, and nav-item structure as app/layouts/dashboard.vue),
             fed the current label/enabled settings from
             useThemes().dashboardSettings and a sample "Live Page" status
             card instead of a real couple's account. -->
        <div v-if="mode === 'dashboard'" class="real-dashboard-frame">
          <aside class="real-dashboard-aside">
            <div class="flex items-center gap-2 px-3 py-3 mb-2">
              <div class="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <UIcon name="i-heroicons-heart" class="w-4 h-4 text-gold-300" />
              </div>
              <span class="font-display font-semibold text-sm text-gold-100 tracking-wide">WeddingCard</span>
            </div>
            <nav class="flex flex-col gap-1.5 px-1">
              <div
                v-for="(item, index) in mockDashboardNavItems"
                :key="item.id"
                class="real-nav-link"
                :class="{ 'real-nav-link-active': index === 0 }"
              >
                <UIcon :name="dashboardNavIcons[item.id] || 'i-heroicons-square-2-stack'" class="w-4 h-4 shrink-0" />
                <span>{{ item.label }}</span>
              </div>
              <p v-if="mockDashboardNavItems.length === 0" class="text-xs text-white/30 px-3 pt-2">
                Every page is currently turned off - a real couple would see an empty sidebar.
              </p>
            </nav>
            <div class="mt-auto pt-4">
              <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-xs shadow-inner">
                <p class="text-white/40 uppercase tracking-widest text-[0.6rem] font-semibold mb-1">Live Page</p>
                <p class="text-gold-200 truncate font-medium">/w/sample-slug</p>
                <UBadge color="success" variant="subtle" size="sm" class="mt-2">Published</UBadge>
              </div>
            </div>
          </aside>
          <div class="real-dashboard-main">
            <p class="text-xs uppercase tracking-widest text-gold-300/70 font-semibold mb-1">{{ dashboardSettings.overviewEyebrow }}</p>
            <p class="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">{{ dashboardSettings.overviewTitle }}</p>
            <div class="mt-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
              <p class="text-base font-semibold text-white/85">{{ dashboardSettings.createCardTitle }}</p>
              <p class="text-sm text-white/50 mt-1.5">{{ dashboardSettings.createCardDescription }}</p>
            </div>
          </div>
        </div>
        <p v-if="mode === 'dashboard'" class="text-xs text-white/40">This is the same layout, same components, and same Tailwind classes as <code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard</code> for every signed-in couple - only the labels, the enabled pages, and the two lines of overview text are what Save on this page controls. The "Live Page" card and sidebar highlight are illustrative styling, not a real couple's data.</p>

        <!-- DESIGN / TYPOGRAPHY / DESIGN OPTIONS / STARTER DEFAULTS: the
             actual cover-card and inner-details-page render components,
             fed a synthetic sample couple so this can never show a real
             couple's data. -->
        <div v-else-if="mode === 'design'">
          <div class="flex items-center gap-2 mb-4">
            <button
              type="button"
              class="preview-tab"
              :class="{ 'preview-tab-active': designView === 'cover' }"
              @click="designView = 'cover'"
            >
              Cover card
            </button>
            <button
              type="button"
              class="preview-tab"
              :class="{ 'preview-tab-active': designView === 'details' }"
              @click="designView = 'details'"
            >
              Inner details page
            </button>
          </div>
          <div class="phone-bezel w-full max-w-[360px] mx-auto shadow-2xl">
            <div class="phone-notch"></div>
            <div class="phone-screen relative bg-[#04101f]">
              <WeddingCardPreview v-if="designView === 'cover'" :content="sampleContent" :theme-id="sampleThemeId" class="min-h-full" />
              <WeddingDetailsPreview v-else :content="sampleContent" :theme-id="sampleThemeId" :flow="sampleFlow" class="min-h-full" />
            </div>
          </div>
        </div>

        <!-- OPENING LANGUAGES / OPENING STYLES: the same envelope-opening
             animation a guest sees, using a sample "Guest Name" - never a
             real guest or real couple. -->
        <div v-else-if="mode === 'opening'">
          <div class="flex items-center justify-between mb-3 px-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70">Tap the phone to see it open, like a guest would</p>
            <button type="button" class="text-xs text-white/40 hover:text-white/70" @click="openingPreviewOpened = false">Reset</button>
          </div>
          <div class="phone-bezel w-full max-w-[360px] mx-auto shadow-2xl">
            <div class="phone-notch"></div>
            <div class="phone-screen relative bg-[#04101f]" :style="sampleStyleVars">
              <EnvelopeIntro v-model:opened="openingPreviewOpened" guest-name="Guest Name" :content="sampleContent" />
              <div v-if="openingPreviewOpened" class="absolute inset-0 flex items-center justify-center text-white/50 text-sm italic px-6 text-center">
                (This is where the couple's own cover card appears)
              </div>
            </div>
          </div>
        </div>

        <!-- RSVP LANGUAGES: the actual RSVP page layout (same rounded card,
             step indicator, and option-card classes as
             app/pages/w/[slug]/rsvp.vue), theme-styled, with a sample guest
             filling it in - no real guest data. -->
        <div v-else-if="mode === 'rsvp'" class="real-rsvp-frame" :style="sampleStyleVars">
          <div class="real-rsvp-card">
            <!-- Fixed white, not var(--theme-ink) - .real-rsvp-card below
                 is always dark regardless of theme, so theme-ink (dark,
                 for a light theme) would be unreadable dark-on-dark. -->
            <div class="text-center space-y-2 mb-6">
              <h1 class="text-3xl font-bold tracking-wide" :style="{ color: '#fff', fontFamily: 'var(--theme-heading-font)' }">
                {{ sampleContent.rsvpTitle }}
              </h1>
              <div class="h-px w-16 mx-auto" :style="{ background: 'var(--theme-accent)' }" />
              <p class="text-xs text-white/70 font-light tracking-wide pt-1">
                {{ sampleContent.rsvpDeadlineText }} <span class="font-medium" :style="{ color: 'var(--theme-accent)' }">12 December 2026</span>
              </p>
            </div>

            <div class="flex items-center justify-center gap-2 mb-8">
              <template v-for="(label, index) in ['About You', 'Details', 'Wishes']" :key="label">
                <div class="flex items-center gap-2">
                  <div class="real-step-dot" :class="{ 'real-step-dot-active': index === 0 }">{{ index + 1 }}</div>
                  <span class="hidden sm:inline text-[0.65rem] uppercase tracking-widest font-medium" :class="index === 0 ? '' : 'text-white/30'" :style="index === 0 ? { color: 'var(--theme-accent)' } : {}">{{ label }}</span>
                </div>
                <div v-if="index < 2" class="w-6 h-px bg-white/10" />
              </template>
            </div>

            <div class="space-y-5">
              <div>
                <p class="text-xs text-white/50 mb-1.5">{{ sampleContent.rsvpNameLabel }}</p>
                <div class="real-rsvp-input">{{ sampleContent.rsvpNamePlaceholder }}</div>
              </div>
              <div>
                <p class="text-sm text-white/80 mb-3 font-medium">{{ sampleContent.rsvpAttendQuestion }}</p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="real-option-card real-option-card-active">
                    <UIcon name="i-heroicons-check-circle" class="w-5 h-5 mb-1.5 opacity-80" />
                    <span class="text-sm font-medium">{{ sampleContent.rsvpAttendYes }}</span>
                  </div>
                  <div class="real-option-card">
                    <UIcon name="i-heroicons-x-circle" class="w-5 h-5 mb-1.5 opacity-80" />
                    <span class="text-sm font-medium">{{ sampleContent.rsvpAttendNo }}</span>
                  </div>
                </div>
              </div>
              <div>
                <p class="text-xs text-white/50 mb-1.5">{{ sampleContent.rsvpWishesLabel }}</p>
                <p class="text-[0.65rem] text-white/30 mb-1.5">{{ sampleContent.rsvpWishesSubtitle }}</p>
                <div class="real-rsvp-input">{{ sampleContent.rsvpWishesPlaceholder }}</div>
              </div>
              <button type="button" class="real-rsvp-button">{{ sampleContent.rsvpConfirmButton }}</button>
            </div>
          </div>
          <p class="text-xs text-white/40 mt-3">This is the actual RSVP page a guest opens (<code class="text-gold-300 bg-white/5 px-1 rounded">/w/[slug]/rsvp</code>) - same card, same step layout, styled with your current theme colours - with a sample guest filling it in. No real guest ever sees this exact data.</p>
        </div>

        <!-- DAY FLOW: the real Wedding Day Flow page (same header classes
             and the same FlowTimeline component as
             app/pages/dashboard/flow.vue), a dashboard tool guests never
             see, showing the page labels plus a sample timeline. -->
        <div v-else-if="mode === 'dayflow'" class="real-tool-frame">
          <h1 class="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            {{ dayFlowSettings.pageTitle }}
          </h1>
          <p class="text-sm text-white/50 mt-1 mb-5 flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" style="color: #e3b04a;" />
            {{ dayFlowSettings.pageDescription }}
          </p>
          <div class="real-tool-panel">
            <FlowTimeline :items="sampleFlowTimelineItems" />
          </div>
          <p class="text-xs text-white/40 mt-4">This is the couple's own Day Flow page in their dashboard (not shown to guests) - same header, same timeline component as the real page. The title/description above are exactly what Save here controls; the sample timeline is illustrative, a couple's real flow is their own.</p>
        </div>

        <!-- GUEST LIST: the real Guest List page header/stat-card/table
             style (matching app/pages/dashboard/guests.vue), a dashboard
             tool guests never see, with two sample rows. -->
        <div v-else-if="mode === 'guests'" class="real-tool-frame">
          <h1 class="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            {{ guestListSettings.pageTitle }}
          </h1>
          <p class="text-sm text-white/50 mt-1.5 mb-5">{{ guestListSettings.pageDescription }}</p>
          <div class="real-tool-panel">
            <table class="real-guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tier</th>
                  <th v-if="guestListSettings.showSpecialSeating">Special Seating</th>
                  <th v-if="guestListSettings.showDietary">Dietary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sample Guest 1</td>
                  <td><span class="real-tier-badge">{{ guestListSettings.vipLabel }}</span></td>
                  <td v-if="guestListSettings.showSpecialSeating">Wheelchair access</td>
                  <td v-if="guestListSettings.showDietary">Vegetarian</td>
                </tr>
                <tr>
                  <td>Sample Guest 2</td>
                  <td><span class="real-tier-badge real-tier-badge-general">{{ guestListSettings.generalLabel }}</span></td>
                  <td v-if="guestListSettings.showSpecialSeating">-</td>
                  <td v-if="guestListSettings.showDietary">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-white/40 mt-4">This is the couple's own Guest List page in their dashboard (not shown to guests) - same header and table style as the real page. The title/description, tier names, and which of the two optional columns appear are exactly what Save here controls.</p>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { createDefaultContent } from '~/composables/useWeddingTypes'

const props = withDefaults(defineProps<{
  mode: 'dashboard' | 'design' | 'opening' | 'rsvp' | 'dayflow' | 'guests'
  /** Optional overrides merged onto the synthetic sample content - e.g. a
   * specific ornament/theme/opening style being previewed from a list. */
  overrides?: Record<string, unknown>
}>(), {
  overrides: () => ({})
})

const isOpen = defineModel<boolean>('open', { default: false })

const {
  dashboardSettings, dayFlowSettings, guestListSettings,
  allThemes, allTextPresets, allDayFlowPresets,
  starterDefaults, enabledOpeningStyles, enabledOrnamentStyles, enabledPetalStyles, enabledTopIcons,
  themeStyleVars
} = useThemes()

const titles: Record<typeof props.mode, string> = {
  dashboard: 'View Live - User Dashboard',
  design: 'View Live - Design',
  opening: 'View Live - Opening',
  rsvp: 'View Live - RSVP',
  dayflow: 'View Live - Day Flow',
  guests: 'View Live - Guest List'
}

const descriptions: Record<typeof props.mode, string> = {
  dashboard: "This is the generic dashboard layout every signed-in couple gets - the same shell for all of them, not any one person's real account.",
  design: 'A sample couple ("Aisyah & Danial") showing exactly how your current Design Studio / Typography / Design Options / Starter Defaults settings render on a real card - never an actual couple\'s content.',
  opening: 'The same envelope-opening moment a guest experiences, using a sample guest name - not any real invitation.',
  rsvp: 'The real RSVP page layout and theme styling, filled in with a sample guest - not the working form, and no real guest data.',
  dayflow: "The couple's own Wedding Day Flow page (a dashboard tool guests never see), same layout, with a sample timeline.",
  guests: "The couple's own Guest List page (a dashboard tool guests never see), same layout, with two sample rows."
}

const designView = ref<'cover' | 'details'>('cover')
const openingPreviewOpened = ref(false)

const mockDashboardNavItems = computed(() => dashboardSettings.value.navItems.filter((item) => item.enabled))

// Same icon-per-page mapping as app/layouts/dashboard.vue's dashboardPages list.
const dashboardNavIcons: Record<string, string> = {
  overview: 'i-heroicons-home',
  opening: 'i-heroicons-envelope',
  editor: 'i-heroicons-paint-brush',
  rsvp: 'i-heroicons-pencil-square',
  guests: 'i-heroicons-users',
  flow: 'i-heroicons-clock',
  billing: 'i-heroicons-credit-card'
}

const sampleThemeId = computed(() => {
  const override = props.overrides?.themeId as string | undefined
  return override || allThemes.value[0]?.id || 'timeless-gold'
})

const sampleFlowTimelineItems = computed(() => {
  const preset = allDayFlowPresets.value[0]
  if (!preset) return []
  return preset.items.map((item, index) => ({ id: String(index), ...item }))
})

const sampleFlow = computed(() => sampleFlowTimelineItems.value)

// One synthetic "sample couple" built from the real createDefaultContent()
// shape (so every field a real card needs is present and sensibly filled),
// then layered with the platform's current catalog choices so the preview
// actually reflects what's saved - never any real couple's own data.
const sampleContent = computed(() => {
  const base = createDefaultContent('Aisyah', 'Danial')
  const englishPreset = allTextPresets.value.find((p) => p.id === 'en') || allTextPresets.value[0]
  const merged = {
    ...base,
    story: starterDefaults.value.story || base.story,
    enablePetals: starterDefaults.value.enablePetals,
    petalStyle: enabledPetalStyles.value[0]?.value || starterDefaults.value.petalStyle,
    ornamentStyle: enabledOrnamentStyles.value[0]?.value ?? starterDefaults.value.ornamentStyle,
    textWeight: starterDefaults.value.textWeight,
    btnDetails: starterDefaults.value.btnDetails,
    btnRsvp: starterDefaults.value.btnRsvp,
    innerTopIcon: enabledTopIcons.value[0]?.value || 'none',
    detailsTopIcon: enabledTopIcons.value[0]?.value || 'none',
    openingStyle: enabledOpeningStyles.value[0]?.value || base.openingStyle,
    openingTitle: englishPreset?.openingTitle || base.openingTitle,
    openingGreeting: (englishPreset?.openingGreeting || base.openingGreeting).replace('{guestName}', 'Guest Name'),
    openingActionText: englishPreset?.openingActionText || base.openingActionText,
    dateLabel: '12 December 2026',
    timeLabel: '4:00 PM',
    venueName: 'Sample Grand Ballroom',
    venueAddress: '123 Sample Avenue, Kuala Lumpur',
    ...props.overrides
  }
  return merged as typeof base
})

const sampleStyleVars = computed(() => themeStyleVars(sampleThemeId.value))
</script>

<style scoped>
/* Mirrors app/layouts/dashboard.vue's <aside>/<nav>/.nav-link styling
   exactly, just scaled down to fit inside a modal instead of a full page. */
.real-dashboard-frame {
  display: flex;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #051021;
  min-height: 320px;
}

.real-dashboard-aside {
  width: 220px;
  shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(11, 28, 48, 0.4);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem 0.75rem;
}

.real-nav-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.65rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid transparent;
}

.real-nav-link-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.2);
}

.real-dashboard-main {
  flex: 1;
  padding: 1.75rem;
}

.preview-tab {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-tab-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.3);
}

.phone-bezel {
  position: relative;
  height: 560px;
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
}

.phone-screen {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* RSVP: mirrors app/pages/w/[slug]/rsvp.vue's theme-surface card,
   .step-dot, and .option-card classes exactly, using the real theme CSS
   variables (sampleStyleVars) so the accent colour genuinely matches. */
.real-rsvp-frame {
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  background: linear-gradient(160deg, var(--theme-bg-from, #04101f), var(--theme-bg-via, #0b1c30), var(--theme-bg-to, #142a45));
}

/* Everything inside this card (white/light text, step dots, option
   cards below) assumes a dark backdrop, same as the real rsvp.vue page.
   A flat rgba(11, 28, 48, 0.4) only stayed dark enough for that on dark
   themes - on a light theme (Ivory Minimalist, Sky Serenade) it washed
   out to a barely-there grey, same bug fixed in rsvp.vue and
   DashboardRsvpEditorPanel.vue's .classic-rsvp-card. Mixing in only a
   capped share of the theme's own colours keeps a hint of the chosen
   theme while guaranteeing the card itself always stays dark enough. */
.real-rsvp-card {
  border-radius: 1.5rem;
  border: 1px solid var(--theme-accent-soft, rgba(212, 160, 23, 0.2));
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 30%, #0a1420) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 25%, #050b14) 100%
  );
  backdrop-filter: blur(20px);
  padding: 1.75rem 1.5rem;
  max-width: 420px;
  margin: 0 auto;
}

.real-step-dot {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

/* color is fixed white, not var(--theme-ink) - inside the always-dark
   .real-rsvp-card, so theme-ink would be unreadable dark-on-dark for a
   light theme. */
.real-step-dot-active {
  border-color: var(--theme-accent, #e3b04a);
  color: #fff;
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.2));
}

.real-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

/* Same reasoning as .real-step-dot-active above. */
.real-option-card-active {
  border-color: var(--theme-accent, #e3b04a);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15));
  color: #fff;
}

.real-rsvp-input {
  padding: 0.55rem 0.85rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.real-rsvp-button {
  width: 100%;
  padding: 0.7rem;
  border-radius: 999px;
  background: var(--theme-accent, #d4a017);
  color: var(--theme-bg-from, #1f1400);
  font-weight: 600;
  font-size: 0.85rem;
}

/* Day Flow / Guest List: mirrors the .form-panel dashboard-tool card style
   from those real pages. */
.real-tool-frame {
  border-radius: 1.25rem;
}

.real-tool-panel {
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.real-guests-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.real-guests-table th {
  text-align: left;
  padding: 0.5rem 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.real-guests-table td {
  padding: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
}

.real-tier-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
}

.real-tier-badge-general {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}
</style>
