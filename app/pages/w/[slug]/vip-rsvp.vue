<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
    <p class="animate-pulse tracking-widest uppercase text-xs">Loading RSVP...</p>
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <p class="text-xl font-display mb-4">We couldn't find that invitation.</p>
      <UButton to="/" variant="soft" color="neutral" class="rounded-full">Go home</UButton>
    </div>
  </div>

  <div v-else-if="wedding.content.rsvpEnabled === false" class="min-h-screen vrsvp-surface flex items-center justify-center text-white text-center px-6" :style="styleVars">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm">
      <UIcon name="i-heroicons-envelope" class="w-10 h-10 text-gold-300/60 mb-4 mx-auto" />
      <p class="text-xl font-display mb-2">RSVP isn't needed for this celebration.</p>
      <p class="text-sm text-white/60 mb-6">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }} aren't collecting RSVPs online — this is an invitation-only card.</p>
      <UButton :to="backHref" variant="soft" color="neutral" class="rounded-full">Back to invitation</UButton>
    </div>
  </div>

  <!-- The VIP RSVP page - a purpose-built companion to VipCinematicInvite.vue
       rather than the classic step-wizard reskinned with gold colors. Same
       illustrated venue backdrop as the gate scene, and each step arrives
       from its own side (About You from the bride's side, Details from the
       groom's, Wishes rising up center) - a small continuation of the same
       "camera settles on a side" language the gate uses, rather than a
       generic numbered-dot form wizard. Submission logic (validation,
       Firestore writes, confetti) is intentionally the same as the classic
       page - only the shell and motion are different. -->
  <section v-else class="min-h-screen vrsvp-surface text-white flex items-center justify-center px-4 py-12 relative overflow-x-hidden" :style="styleVars">
    <div v-if="wedding.vipBackgroundImageUrl" class="vrsvp-photo-backdrop" :style="{ backgroundImage: `url(${wedding.vipBackgroundImageUrl})` }"></div>
    <div v-else class="vrsvp-photo-backdrop vrsvp-illustrated-backdrop" :style="{ backgroundImage: `url(${venueBackgroundImage})` }"></div>
    <div class="vrsvp-scrim"></div>
    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" class="z-0 pointer-events-none" />

    <div v-if="wedding.content.audioSrc" class="fixed top-4 right-4 z-30">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <UContainer class="max-w-xl w-full relative z-10">
      <div class="flex justify-center mb-6">
        <UButton :to="backHref" variant="ghost" color="neutral" size="sm" icon="i-heroicons-arrow-left" aria-label="Back to Invitation" class="text-white/70 hover:text-white rounded-full bg-white/5 border border-white/10 backdrop-blur-sm px-4">
          {{ wedding.content.rsvpReturnButton || 'Return to Invitation' }}
        </UButton>
      </div>

      <div class="text-center space-y-2 mb-8 vrsvp-header">
        <img v-if="flowerAccent" :src="flowerAccent" alt="" class="vrsvp-header-flower vrsvp-header-flower-left" />
        <img v-if="flowerAccent" :src="flowerAccent" alt="" class="vrsvp-header-flower vrsvp-header-flower-right" />
        <p class="vrsvp-eyebrow">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</p>
        <h1 class="vrsvp-title">{{ wedding.content.rsvpTitle || 'RSVP' }}</h1>
        <div class="h-px w-24 mx-auto" :style="{ background: 'var(--theme-accent)' }" />
        <p v-if="wedding.content.rsvpDeadlineLabel" class="text-sm text-white/70 font-light tracking-wide pt-2">
          {{ wedding.content.rsvpDeadlineText || 'Kindly respond by' }} <span class="font-medium" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.rsvpDeadlineLabel }}</span>
        </p>
      </div>

      <UAlert
        v-if="!isConfigured"
        icon="i-heroicons-exclamation-triangle"
        color="warning"
        variant="soft"
        title="Configuration Missing"
        description="Firebase credentials are required to save RSVPs."
        class="mb-6 rounded-2xl"
      />

      <div class="vrsvp-card">
        <template v-if="!submitted">
          <!-- Three gold dots, same visual language as .cine-hud on the
               cinematic invite, instead of a numbered step bar. -->
          <div class="vrsvp-dots">
            <span v-for="(label, index) in steps" :key="label" class="vrsvp-dot" :class="{ on: index === currentStep, done: index < currentStep }"></span>
          </div>

          <div class="relative vrsvp-step-area">
            <Transition :name="stepTransitionName" mode="out-in">
              <div :key="currentStep" class="w-full">
                <template v-if="currentStep === 0">
                  <div class="space-y-8">
                    <UFormField :label="wedding.content.rsvpNameLabel || 'Name(s)'" name="name" :error="errors.name">
                      <UInput v-model="state.name" :placeholder="wedding.content.rsvpNamePlaceholder || 'Type your full name'" size="xl" class="w-full shadow-inner" variant="outline" />
                    </UFormField>

                    <div>
                      <p class="text-sm text-white/80 mb-3 font-medium">{{ wedding.content.rsvpAttendQuestion || 'Will you be attending?' }}</p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label class="vrsvp-option" :class="{ 'vrsvp-option-active': state.attending === 'Yes' }">
                          <input v-model="state.attending" type="radio" value="Yes" class="sr-only">
                          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 mb-2 opacity-80" />
                          <span class="font-medium">{{ wedding.content.rsvpAttendYes || 'Joyfully Accept' }}</span>
                        </label>
                        <label class="vrsvp-option" :class="{ 'vrsvp-option-active': state.attending === 'No' }">
                          <input v-model="state.attending" type="radio" value="No" class="sr-only">
                          <UIcon name="i-heroicons-x-circle" class="w-6 h-6 mb-2 opacity-80" />
                          <span class="font-medium">{{ wedding.content.rsvpAttendNo || 'Regretfully Decline' }}</span>
                        </label>
                      </div>
                      <p v-if="errors.attending" class="mt-2 text-sm text-red-400 font-medium">{{ errors.attending }}</p>
                    </div>
                  </div>
                </template>

                <template v-else-if="currentStep === 1">
                  <template v-if="state.attending === 'No'">
                    <div class="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
                      <UIcon name="i-heroicons-envelope-open" class="w-12 h-12 text-white/30" />
                      <p class="text-white/80 italic text-lg">
                        {{ fillNameToken(wedding.content.rsvpDeclineMessage || "We'll miss you, {name}! Feel free to leave us a wish on the next step.", state.name) }}
                      </p>
                    </div>
                  </template>

                  <template v-else>
                    <div class="space-y-8 pt-2">
                      <UFormField :label="wedding.content.rsvpGuestLabel || 'Number of guests attending'" name="guestCount" :error="errors.guestCount">
                        <div class="flex justify-start">
                          <UInputNumber v-model="state.guestCount" :min="1" :max="10" size="lg" class="w-32 shadow-inner" />
                        </div>
                      </UFormField>

                      <div class="h-px w-full bg-white/5"></div>

                      <div>
                        <p class="text-sm text-white/80 mb-3 font-medium">{{ wedding.content.rsvpSeatingLabel || 'Do you require special seating? (e.g., wheelchair access)' }}</p>
                        <div class="grid grid-cols-2 gap-4">
                          <label class="vrsvp-option vrsvp-option-small" :class="{ 'vrsvp-option-active': state.specialSeating === true }">
                            <input v-model="state.specialSeating" type="radio" :value="true" class="sr-only"> {{ wedding.content.rsvpSeatingYesLabel || 'Yes' }}
                          </label>
                          <label class="vrsvp-option vrsvp-option-small" :class="{ 'vrsvp-option-active': state.specialSeating === false }">
                            <input v-model="state.specialSeating" type="radio" :value="false" class="sr-only"> {{ wedding.content.rsvpSeatingNoLabel || 'No' }}
                          </label>
                        </div>
                        <p v-if="errors.specialSeating" class="mt-2 text-sm text-red-400">{{ errors.specialSeating }}</p>
                      </div>

                      <UFormField :label="wedding.content.rsvpDietaryLabel || 'Dietary restrictions (if any)'" name="dietary">
                        <UInput v-model="state.dietary" :placeholder="wedding.content.rsvpDietaryPlaceholder || 'e.g. Vegetarian, No Seafood'" size="lg" class="w-full" />
                      </UFormField>
                    </div>
                  </template>
                </template>

                <template v-else-if="currentStep === 2">
                  <div class="space-y-6">
                    <UFormField :label="wedding.content.rsvpWishesLabel || 'Wishes & Blessings'" name="doa" :error="errors.doa">
                      <p class="italic text-xs mb-2 opacity-70" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.rsvpWishesSubtitle || 'Write your well wishes for the couple' }}</p>
                      <UTextarea v-model="state.doa" :placeholder="wedding.content.rsvpWishesPlaceholder || 'May your marriage be blessed...'" :rows="4" class="w-full resize-none custom-scrollbar shadow-inner text-base" />
                    </UFormField>

                    <div class="rounded-xl border border-white/10 bg-white/5 p-5 text-sm space-y-2 backdrop-blur-md shadow-inner">
                      <h4 class="font-semibold text-white mb-3 border-b border-white/10 pb-2">{{ wedding.content.rsvpSummaryTitle || 'RSVP Summary' }}</h4>
                      <div class="grid grid-cols-3 gap-2">
                        <span class="text-white/50">{{ wedding.content.rsvpSummaryNameLabel || 'Name:' }}</span> <span class="col-span-2 font-medium">{{ state.name }}</span>
                        <span class="text-white/50">{{ wedding.content.rsvpSummaryStatusLabel || 'Status:' }}</span> <span class="col-span-2 font-medium" :class="state.attending === 'Yes' ? 'text-emerald-400' : 'text-red-400'">{{ state.attending === 'Yes' ? (wedding.content.rsvpAttendingText || 'Attending') : (wedding.content.rsvpNotAttendingText || 'Not Attending') }}</span>
                        <template v-if="state.attending === 'Yes'">
                          <span class="text-white/50">{{ wedding.content.rsvpSummaryGuestsLabel || 'Guests:' }}</span> <span class="col-span-2">{{ state.guestCount }}</span>
                          <span class="text-white/50">{{ wedding.content.rsvpSummarySpecialLabel || 'Special:' }}</span> <span class="col-span-2">{{ state.specialSeating ? 'Yes' : 'No' }}</span>
                          <span v-if="state.dietary" class="text-white/50">{{ wedding.content.rsvpSummaryDietaryLabel || 'Dietary:' }}</span> <span v-if="state.dietary" class="col-span-2">{{ state.dietary }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </Transition>
          </div>

          <div class="flex items-center justify-between mt-12 pt-6 border-t border-white/10 relative z-20">
            <UButton v-if="currentStep > 0" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" class="hover:bg-white/10 rounded-full px-4" @click="goBack">{{ wedding.content.rsvpBackButton || 'Back' }}</UButton>
            <div v-else></div>

            <UButton v-if="currentStep < steps.length - 1" trailing-icon="i-heroicons-arrow-right" class="rounded-full px-8 shadow-md vrsvp-btn" size="lg" @click="goNext">{{ wedding.content.rsvpContinueButton || 'Continue' }}</UButton>
            <UButton v-else size="lg" icon="i-heroicons-paper-airplane" :loading="submitting" class="rounded-full px-8 vrsvp-btn vrsvp-btn-glow" @click="submitForm">{{ wedding.content.rsvpConfirmButton || 'Confirm RSVP' }}</UButton>
          </div>
        </template>

        <!-- Thank-you - the couple's own illustration rises up behind the
             message, so the RSVP flow closes the same way the invitation
             opened: with the two of them, in the same illustrated venue. -->
        <template v-else>
          <div class="text-center space-y-6 py-6 vrsvp-thanks">
            <div class="vrsvp-thanks-couple-wrap">
              <img :src="thanksCoupleImage" alt="" class="vrsvp-thanks-couple" />
            </div>
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border-2 mb-2" :style="{ borderColor: 'var(--theme-accent)' }">
              <UIcon name="i-heroicons-check" class="w-12 h-12" :style="{ color: 'var(--theme-accent)' }" />
            </div>

            <div>
              <h2 class="text-4xl font-display mb-2 drop-shadow-md" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">{{ fillNameToken(wedding.content.rsvpThankYouTitle || 'Thank you, {name}!', lastSubmittedName) }}</h2>
              <p class="text-white/80 text-lg font-light max-w-md mx-auto leading-relaxed">
                {{ wedding.content.rsvpThankYouIntro || 'Your RSVP has been securely received.' }} {{ lastAttending === 'Yes' ? (wedding.content.rsvpSuccessYes || 'We are absolutely thrilled to celebrate with you.') : (wedding.content.rsvpSuccessNo || 'You will be dearly missed.') }}
              </p>
            </div>

            <div class="pt-6">
              <UButton variant="soft" color="neutral" class="rounded-full px-6 hover:bg-white/10 transition-colors" @click="resetForm">{{ wedding.content.rsvpSubmitAnotherButton || 'Submit another response' }}</UButton>
            </div>
          </div>

          <div class="mt-12 pt-10 border-t border-white/10">
            <WishesWall
              :wedding-id="wedding.id"
              :title="wedding.content.rsvpWishesWallTitle || 'Wishes & Blessings'"
              :empty-text="wedding.content.rsvpWishesEmptyText || 'Be the first to leave a wish 💛'"
            />
          </div>
        </template>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
// The VIP RSVP page - a dedicated companion to VipCinematicInvite.vue (see
// the template comment above). Submission logic below is deliberately the
// same as the classic app/pages/w/[slug]/rsvp.vue (same Zod schemas, same
// Firestore collections, same confetti) - only the shell, motion, and
// step-arrival direction are different. Classic guests never see this page;
// VipCinematicInvite's rsvpLink (set in vip.vue) points VIP guests here
// instead of the classic route.
import confetti from 'canvas-confetti'
import { z } from 'zod'
import { addDoc, collection } from 'firebase/firestore'

const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars } = useThemes()
const { db, isConfigured } = useFirebase()
const toast = useToast()

const backHref = computed(() => {
  const toParam = typeof route.query.to === 'string' && route.query.to
    ? `?to=${encodeURIComponent(route.query.to)}`
    : ''
  return `/w/${slug}/vip${toParam}`
})

const styleVars = computed(() =>
  themeStyleVars(
    wedding.value?.themeId,
    {
      bgFrom: wedding.value?.content.customBgFrom,
      bgTo: wedding.value?.content.customBgTo,
      accent: wedding.value?.content.customAccent
    },
    wedding.value?.content.customFontFamily || wedding.value?.content.fontFamily,
    wedding.value?.content.textWeight
  )
)

useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

// The same ready-made illustrated venue/couple defaults as the gate scene
// (see VipCinematicInvite.vue) - so this page matches even before the
// couple has uploaded their own venue photo or portrait.
const DEFAULT_VENUE_BACKGROUND = '/vip-scene/venue-background.webp'
const DEFAULT_COUPLE_ILLUSTRATION = '/vip-scene/couple/couple-classic.webp'
const venueBackgroundImage = computed(() => DEFAULT_VENUE_BACKGROUND)
const thanksCoupleImage = computed(() => wedding.value?.content.coupleIllustrationUrl || DEFAULT_COUPLE_ILLUSTRATION)
const flowerAccent = '/vip-scene/flowers/flowers-3.webp'

const steps = computed(() => [
  wedding.value?.content.rsvpStepAboutYou || 'About You',
  wedding.value?.content.rsvpStepDetails || 'Details',
  wedding.value?.content.rsvpStepWishes || 'Wishes'
])
const currentStep = ref(0)
// Each step arrives from its own side - About You from the left (the
// bride's side in the gate scene), Details from the right (the groom's
// side), Wishes rises up from the bottom - a small echo of the gate's own
// left/right/settle choreography, rather than one repeated slide direction.
const STEP_TRANSITIONS = ['vrsvp-step-left', 'vrsvp-step-right', 'vrsvp-step-up']
const stepTransitionName = ref(STEP_TRANSITIONS[0])
const submitting = ref(false)
const submitted = ref(false)
const lastSubmittedName = ref('')
const lastAttending = ref<'Yes' | 'No'>('Yes')

const state = reactive({
  name: (route.query.to as string) || '',
  attending: '' as 'Yes' | 'No' | '',
  guestCount: 1,
  specialSeating: null as boolean | null,
  dietary: '',
  doa: ''
})

const errors = reactive<Record<string, string>>({})

const nameSchema = z.string().trim().min(2, 'Please enter your name(s)')
const doaSchema = z.string().trim().min(3, 'A short wish means a lot \u{1F49B}').max(500, 'Keep it under 500 characters')

function clearErrors() {
  for (const key of Object.keys(errors)) delete errors[key]
}

function validateStep(step: number): boolean {
  clearErrors()
  if (step === 0) {
    const result = nameSchema.safeParse(state.name)
    if (!result.success) errors.name = result.error.issues[0]?.message ?? 'Please enter your name(s)'
    if (!state.attending) errors.attending = 'Please choose whether you can attend'
    return Object.keys(errors).length === 0
  }
  if (step === 1) {
    if (state.attending === 'No') return true
    if (!state.guestCount || state.guestCount < 1) {
      errors.guestCount = 'At least 1 guest'
    } else if (state.guestCount > 10) {
      errors.guestCount = 'For groups larger than 10, please contact us directly'
    }
    if (state.specialSeating === null) errors.specialSeating = 'Please choose an option'
    return Object.keys(errors).length === 0
  }
  if (step === 2) {
    const result = doaSchema.safeParse(state.doa)
    if (!result.success) errors.doa = result.error.issues[0]?.message ?? 'Please share a short wish'
    return Object.keys(errors).length === 0
  }
  return true
}

function fillNameToken(template: string, name: string) {
  return template.replace('{name}', name || 'friend')
}

function goNext() {
  if (!validateStep(currentStep.value)) return
  const next = Math.min(currentStep.value + 1, steps.value.length - 1)
  stepTransitionName.value = STEP_TRANSITIONS[next] || STEP_TRANSITIONS[0]
  currentStep.value = next
}

function goBack() {
  clearErrors()
  const prev = Math.max(currentStep.value - 1, 0)
  stepTransitionName.value = STEP_TRANSITIONS[prev] || STEP_TRANSITIONS[0]
  currentStep.value = prev
}

function fireConfetti() {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const accentColor = styleVars.value['--theme-accent'] || '#d4a017'
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: [accentColor, '#ffffff', '#f3ddaa'],
    disableForReducedMotion: true
  })
}

function resetForm() {
  state.name = ''
  state.attending = ''
  state.guestCount = 1
  state.specialSeating = null
  state.dietary = ''
  state.doa = ''
  clearErrors()
  stepTransitionName.value = STEP_TRANSITIONS[0]
  currentStep.value = 0
  submitted.value = false
}

async function submitForm() {
  if (!validateStep(2) || !wedding.value) return

  if (!isConfigured || !db) {
    toast.add({ title: 'Firebase not configured', color: 'warning' })
    return
  }

  submitting.value = true
  try {
    const submittedAt = new Date().toISOString()

    await addDoc(collection(db, 'weddings', wedding.value.id, 'guests'), {
      name: state.name.trim(),
      tier: 'general',
      phone: '',
      attending: state.attending,
      guestCount: state.attending === 'Yes' ? state.guestCount : 0,
      specialSeating: state.attending === 'Yes' ? state.specialSeating : false,
      dietary: state.attending === 'Yes' ? state.dietary.trim() : '',
      doa: state.doa.trim(),
      submittedAt
    })

    if (state.doa.trim()) {
      await addDoc(collection(db, 'weddings', wedding.value.id, 'wishes'), {
        name: state.name.trim(),
        doa: state.doa.trim(),
        submittedAt
      })
    }

    lastSubmittedName.value = state.name.trim()
    lastAttending.value = state.attending as 'Yes' | 'No'
    submitted.value = true
    fireConfetti()
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Submission failed', description: 'Please check your connection and try again.', color: 'error' })
  } finally {
    submitting.value = false
  }
}

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({ title: `RSVP — ${value.content.brideName} & ${value.content.groomName}` })
  },
  { immediate: true }
)
</script>

<style scoped>
.vrsvp-surface {
  position: relative;
  overflow: hidden;
}
.vrsvp-photo-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.05) brightness(0.6);
}
.vrsvp-illustrated-backdrop {
  filter: saturate(1.08) brightness(0.68);
}
.vrsvp-scrim {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(600px 500px at 30% 4%, rgba(227, 176, 74, .12), transparent 60%),
    radial-gradient(700px 600px at 70% 22%, rgba(201, 120, 150, .08), transparent 60%),
    linear-gradient(175deg, rgba(20, 10, 28, .62), rgba(14, 7, 18, .78) 45%, rgba(10, 5, 14, .9) 100%);
}

.vrsvp-header { position: relative; }
.vrsvp-header-flower {
  position: absolute;
  top: -34px;
  width: 64px;
  height: auto;
  opacity: .8;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, .35));
  pointer-events: none;
}
.vrsvp-header-flower-left { left: -6px; transform: scaleX(1) rotate(-8deg); }
.vrsvp-header-flower-right { right: -6px; transform: scaleX(-1) rotate(-8deg); }

.vrsvp-eyebrow {
  font-size: .66rem;
  letter-spacing: .32em;
  text-transform: uppercase;
  color: var(--theme-accent);
}
.vrsvp-title {
  font-family: var(--theme-heading-font, 'Great Vibes', cursive);
  font-weight: 500;
  font-size: 3.1rem;
  letter-spacing: normal;
  color: var(--theme-ink, #f7ecf3);
  text-shadow: 0 4px 20px rgba(0, 0, 0, .45);
}

.vrsvp-card {
  position: relative;
  z-index: 10;
  border-radius: 1.75rem;
  padding: 2.25rem 1.5rem;
  background: linear-gradient(165deg, color-mix(in srgb, var(--theme-accent) 12%, var(--theme-bg-via, #1c0f2e)) 0%, var(--theme-bg-via, #1c0f2e) 55%, var(--theme-bg-to, #150a20) 100%);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--theme-accent) 70%, transparent),
    0 0 0 7px var(--theme-bg-to, #150a20),
    0 0 0 8px color-mix(in srgb, var(--theme-accent) 45%, transparent),
    0 25px 55px -20px rgba(0, 0, 0, .7);
}
@media (min-width: 640px) {
  .vrsvp-card { padding: 2.5rem 2.5rem; }
}

.vrsvp-dots { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 2rem; }
.vrsvp-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(247, 236, 243, .22);
  transition: background .3s ease, transform .3s ease, width .3s ease;
}
.vrsvp-dot.done { background: color-mix(in srgb, var(--theme-accent) 60%, transparent); }
.vrsvp-dot.on { background: var(--theme-accent); width: 22px; border-radius: 999px; }

.vrsvp-step-area { position: relative; min-height: 300px; }

.vrsvp-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.vrsvp-option:hover { border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.06); transform: translateY(-2px); }
.vrsvp-option-small { padding: .85rem; border-radius: .75rem; font-weight: 500; flex-direction: row; }
.vrsvp-option-active {
  border-color: var(--theme-accent, #e3b04a);
  background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
  color: var(--theme-ink, #f3ddaa);
  box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-accent) 30%, transparent);
}

.vrsvp-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
  font-weight: 600;
}
.vrsvp-btn:hover { filter: brightness(1.08); }
.vrsvp-btn-glow { animation: vrsvp-glow 2.4s ease-in-out infinite; }
@keyframes vrsvp-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--theme-accent) 45%, transparent); }
  50% { box-shadow: 0 0 0 14px color-mix(in srgb, var(--theme-accent) 0%, transparent); }
}

/* Step arrival - each step slides in from its own side (see
   stepTransitionName in the script) instead of one repeated direction. */
.vrsvp-step-left-enter-active, .vrsvp-step-left-leave-active,
.vrsvp-step-right-enter-active, .vrsvp-step-right-leave-active,
.vrsvp-step-up-enter-active, .vrsvp-step-up-leave-active {
  transition: opacity .45s ease, transform .5s cubic-bezier(.22, .61, .36, 1);
  position: absolute;
  width: 100%;
}
.vrsvp-step-left-enter-from { opacity: 0; transform: translateX(-46px); }
.vrsvp-step-left-leave-to { opacity: 0; transform: translateX(46px); }
.vrsvp-step-right-enter-from { opacity: 0; transform: translateX(46px); }
.vrsvp-step-right-leave-to { opacity: 0; transform: translateX(-46px); }
.vrsvp-step-up-enter-from { opacity: 0; transform: translateY(36px); }
.vrsvp-step-up-leave-to { opacity: 0; transform: translateY(-36px); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }

/* Thank-you - the couple rise up softly above the message, closing the
   loop with the gate scene's own reveal. A normal in-flow element (not
   absolutely positioned) so it reserves its own space above the checkmark
   instead of floating up over the header. */
.vrsvp-thanks-couple-wrap {
  width: 42%;
  max-width: 150px;
  margin: 0 auto 6px;
  opacity: .95;
  animation: vrsvp-thanks-rise .9s cubic-bezier(.22, .61, .36, 1) both;
}
.vrsvp-thanks-couple { width: 100%; display: block; filter: drop-shadow(0 12px 22px rgba(0, 0, 0, .4)); }
@keyframes vrsvp-thanks-rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: .95; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .vrsvp-step-left-enter-active, .vrsvp-step-left-leave-active,
  .vrsvp-step-right-enter-active, .vrsvp-step-right-leave-active,
  .vrsvp-step-up-enter-active, .vrsvp-step-up-leave-active,
  .vrsvp-dot, .vrsvp-thanks-couple-wrap { transition: none !important; animation: none !important; }
}
</style>
