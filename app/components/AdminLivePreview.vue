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

        <!-- USER DASHBOARD: a mock of the sidebar every couple sees, using
             the current label/enabled settings from useThemes().dashboardSettings.
             Nothing here is a real couple's account - it's the shared shell
             layout every couple gets. -->
        <div v-if="mode === 'dashboard'" class="dashboard-mock">
          <div class="dashboard-mock-frame">
            <div class="dashboard-mock-sidebar">
              <div class="flex items-center gap-2 px-3 py-3 mb-2">
                <UIcon name="i-heroicons-heart" class="w-4 h-4 text-gold-300" />
                <span class="font-display font-semibold text-sm text-gold-100">WeddingCard</span>
              </div>
              <div
                v-for="item in mockDashboardNavItems"
                :key="item.id"
                class="dashboard-mock-nav-item"
              >
                {{ item.label }}
              </div>
              <p v-if="mockDashboardNavItems.length === 0" class="text-xs text-white/30 px-3 pt-2">
                Every page is currently turned off - a real couple would see an empty sidebar.
              </p>
            </div>
            <div class="dashboard-mock-main">
              <p class="text-xs uppercase tracking-widest text-gold-300/70 font-semibold mb-1">{{ dashboardSettings.overviewEyebrow }}</p>
              <p class="text-lg font-display font-semibold text-white/90">{{ dashboardSettings.overviewTitle }}</p>
              <div class="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-sm font-semibold text-white/80">{{ dashboardSettings.createCardTitle }}</p>
                <p class="text-xs text-white/40 mt-1">{{ dashboardSettings.createCardDescription }}</p>
              </div>
            </div>
          </div>
          <p class="text-xs text-white/40 mt-3">This is the exact shell layout at <code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard</code> for every signed-in couple - only the labels, the enabled pages, and the two lines of overview text shown here are what Save on this page controls.</p>
        </div>

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

        <!-- RSVP LANGUAGES: the labels/questions a guest fills in, laid out
             like the real form without being the real form (no submit,
             no real data). -->
        <div v-else-if="mode === 'rsvp'" class="rsvp-mock">
          <p class="text-lg font-display font-semibold text-gold-100">{{ sampleContent.rsvpTitle }}</p>
          <p class="text-xs text-white/40 mt-1">{{ sampleContent.rsvpDeadlineText }} 12 December 2026</p>
          <div class="mt-4 space-y-3">
            <div class="rsvp-mock-field">
              <p class="text-sm text-white/70 mb-2">{{ sampleContent.rsvpAttendQuestion }}</p>
              <div class="flex gap-2">
                <span class="rsvp-mock-chip rsvp-mock-chip-active">{{ sampleContent.rsvpAttendYes }}</span>
                <span class="rsvp-mock-chip">{{ sampleContent.rsvpAttendNo }}</span>
              </div>
            </div>
            <div class="rsvp-mock-field">
              <p class="text-xs text-white/50 mb-1">{{ sampleContent.rsvpNameLabel }}</p>
              <div class="rsvp-mock-input">{{ sampleContent.rsvpNamePlaceholder }}</div>
            </div>
            <div class="rsvp-mock-field">
              <p class="text-xs text-white/50 mb-1">{{ sampleContent.rsvpGuestLabel }}</p>
              <div class="rsvp-mock-input">2</div>
            </div>
            <div class="rsvp-mock-field">
              <p class="text-xs text-white/50 mb-1">{{ sampleContent.rsvpWishesLabel }}</p>
              <p class="text-[0.65rem] text-white/30 mb-1">{{ sampleContent.rsvpWishesSubtitle }}</p>
              <div class="rsvp-mock-input">{{ sampleContent.rsvpWishesPlaceholder }}</div>
            </div>
            <button type="button" class="rsvp-mock-button">{{ sampleContent.rsvpConfirmButton }}</button>
          </div>
          <p class="text-xs text-white/40 mt-4">This is a mock, not the working form - it exists so you can read the actual wording a guest sees on the real RSVP page.</p>
        </div>

        <!-- DAY FLOW: the couple's own Wedding Day Flow page (dashboard
             tool, not something guests see), showing the page labels plus
             a sample timeline. -->
        <div v-else-if="mode === 'dayflow'" class="dayflow-mock">
          <p class="text-lg font-display font-semibold text-gold-100">{{ dayFlowSettings.pageTitle }}</p>
          <p class="text-xs text-white/40 mt-1 mb-4">{{ dayFlowSettings.pageDescription }}</p>
          <FlowTimeline :items="sampleFlowTimelineItems" />
          <p class="text-xs text-white/40 mt-4">This is the couple's own Day Flow page in their dashboard (not shown to guests) - the title/description above are exactly what Save here controls. The timeline items are a sample Quick Start preset; a couple's real flow is their own.</p>
        </div>

        <!-- GUEST LIST: the couple's own Guest List page (dashboard tool),
             showing page labels, tier labels, and which optional columns
             are visible. -->
        <div v-else-if="mode === 'guests'" class="guests-mock">
          <p class="text-lg font-display font-semibold text-gold-100">{{ guestListSettings.pageTitle }}</p>
          <p class="text-xs text-white/40 mt-1 mb-4">{{ guestListSettings.pageDescription }}</p>
          <table class="guests-mock-table">
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
                <td><span class="guests-mock-tier">{{ guestListSettings.vipLabel }}</span></td>
                <td v-if="guestListSettings.showSpecialSeating">Wheelchair access</td>
                <td v-if="guestListSettings.showDietary">Vegetarian</td>
              </tr>
              <tr>
                <td>Sample Guest 2</td>
                <td><span class="guests-mock-tier guests-mock-tier-general">{{ guestListSettings.generalLabel }}</span></td>
                <td v-if="guestListSettings.showSpecialSeating">-</td>
                <td v-if="guestListSettings.showDietary">-</td>
              </tr>
            </tbody>
          </table>
          <p class="text-xs text-white/40 mt-4">This is the couple's own Guest List page in their dashboard (not shown to guests) - the title/description, tier names, and which of the two optional columns appear are exactly what Save here controls.</p>
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
  rsvp: 'A read-only mock of the RSVP page wording - not the working form, and no real guest data.',
  dayflow: "The couple's own Wedding Day Flow page (a dashboard tool guests never see) with a sample timeline.",
  guests: "The couple's own Guest List page (a dashboard tool guests never see) with two sample rows."
}

const designView = ref<'cover' | 'details'>('cover')
const openingPreviewOpened = ref(false)

const mockDashboardNavItems = computed(() => dashboardSettings.value.navItems.filter((item) => item.enabled))

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
.dashboard-mock-frame {
  display: flex;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  min-height: 260px;
}

.dashboard-mock-sidebar {
  width: 190px;
  shrink: 0;
  background: rgba(11, 28, 48, 0.6);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem 0.6rem;
}

.dashboard-mock-nav-item {
  padding: 0.55rem 0.75rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.dashboard-mock-nav-item:first-child {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
}

.dashboard-mock-main {
  flex: 1;
  padding: 1.25rem;
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

.rsvp-mock,
.dayflow-mock,
.guests-mock {
  border-radius: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rsvp-mock-field {
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
}

.rsvp-mock-chip {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.5);
}

.rsvp-mock-chip-active {
  background: rgba(212, 160, 23, 0.15);
  border-color: rgba(212, 160, 23, 0.4);
  color: #f3ddaa;
}

.rsvp-mock-input {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.rsvp-mock-button {
  width: 100%;
  padding: 0.65rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #d4a017, #e3b04a);
  color: #1f1400;
  font-weight: 600;
  font-size: 0.85rem;
}

.guests-mock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.guests-mock-table th {
  text-align: left;
  padding: 0.5rem 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.guests-mock-table td {
  padding: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
}

.guests-mock-tier {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
}

.guests-mock-tier-general {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}
</style>
