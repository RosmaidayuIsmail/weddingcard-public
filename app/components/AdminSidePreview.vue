<template>
  <div class="flex gap-6 items-start">
    <!-- Main editor content -->
    <div class="flex-1 min-w-0">
      <slot />
    </div>

    <!-- Persistent live preview (xl+). On smaller screens it collapses below. -->
    <aside class="asp-aside">
      <div class="flex items-center justify-between mb-3 px-1">
        <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
          <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live preview
        </p>
        <button v-if="mode === 'opening'" type="button" class="text-xs text-white/40 hover:text-white/70" @click="opened = false">Reset</button>
      </div>

      <div class="phone-bezel shadow-2xl">
        <div class="phone-notch"></div>
        <div class="phone-screen relative bg-[#04101f]" :style="styleVars">
          <template v-if="mode === 'opening'">
            <EnvelopeIntro v-model:opened="opened" guest-name="Guest Name" :content="content" />
          </template>
          <template v-else>
            <WeddingCardPreview :content="content" :theme-id="themeId" />
          </template>
        </div>
      </div>
      <p class="text-xs text-white/40 mt-3">Updates live as you edit. Uses a sample couple — never real data.</p>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { createDefaultContent } from '~/composables/useWeddingTypes'

// Persistent, always-visible live preview that sits beside an admin editor and
// updates reactively as the form changes (replaces the old "View Live" popup).
const props = withDefaults(defineProps<{
  mode?: 'design' | 'opening'
  themeId?: string
  overrides?: Record<string, unknown>
}>(), {
  mode: 'design',
  themeId: 'timeless-gold',
  overrides: () => ({})
})

const { themeStyleVars, starterDefaults, enabledPetalStyles, enabledOrnamentStyles, enabledTopIcons, enabledOpeningStyles, allTextPresets } = useThemes()

const opened = ref(false)

const content = computed(() => {
  const base = createDefaultContent('Aisyah', 'Danial')
  const englishPreset = allTextPresets.value.find((p) => p.id === 'en') || allTextPresets.value[0]
  return {
    ...base,
    story: starterDefaults.value.story || base.story,
    enablePetals: starterDefaults.value.enablePetals,
    petalStyle: enabledPetalStyles.value[0]?.value || starterDefaults.value.petalStyle,
    ornamentStyle: enabledOrnamentStyles.value[0]?.value ?? starterDefaults.value.ornamentStyle,
    textWeight: starterDefaults.value.textWeight,
    btnDetails: starterDefaults.value.btnDetails,
    btnRsvp: starterDefaults.value.btnRsvp,
    innerTopIcon: enabledTopIcons.value[0]?.value || 'none',
    openingStyle: enabledOpeningStyles.value[0]?.value || base.openingStyle,
    openingTitle: englishPreset?.openingTitle || base.openingTitle,
    openingGreeting: (englishPreset?.openingGreeting || base.openingGreeting).replace('{guestName}', 'Guest Name'),
    openingActionText: englishPreset?.openingActionText || base.openingActionText,
    dateLabel: '12 December 2026',
    venueName: 'Sample Grand Ballroom',
    ...props.overrides
  } as ReturnType<typeof createDefaultContent>
})

const styleVars = computed(() => themeStyleVars(props.themeId))
</script>

<style scoped>
.asp-aside {
  width: 340px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
}
@media (max-width: 1279px) {
  .asp-aside { display: none; }
}
.phone-bezel {
  position: relative;
  height: 620px;
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  overflow: hidden;
}
.phone-notch {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 40%; height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
}
.phone-screen { width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden; }
</style>
