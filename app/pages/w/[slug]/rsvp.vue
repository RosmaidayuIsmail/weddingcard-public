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

  <div v-else-if="wedding.content.rsvpEnabled === false" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6" :style="styleVars">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm">
      <UIcon name="i-heroicons-envelope" class="w-10 h-10 text-gold-300/60 mb-4 mx-auto" />
      <p class="text-xl font-display mb-2">RSVP isn't needed for this celebration.</p>
      <p class="text-sm text-white/60 mb-6">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }} aren't collecting RSVPs online — this is an invitation-only card.</p>
      <UButton :to="`/w/${slug}`" variant="soft" color="neutral" class="rounded-full">Back to invitation</UButton>
    </div>
  </div>

  <section v-else class="min-h-screen theme-surface text-white flex items-center justify-center px-4 py-12 relative overflow-x-hidden bg-[#04101f]" :style="styleVars">
    <!-- FIXED: Added Missing Cover Photo and Ornaments to Live RSVP Page -->
    <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))` }"></div>
    
    <div v-if="wedding.content.coverPhotoUrl" class="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000 animate-in fade-in pointer-events-none">
      <img :src="wedding.content.coverPhotoUrl" alt="Background" class="w-full h-full object-cover" />
      <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
    </div>

    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" class="z-0 pointer-events-none" />
    <CardOrnament :style="wedding.content.ornamentStyle" color="var(--theme-accent)" class="z-0 pointer-events-none" />

    <UContainer class="max-w-xl w-full relative z-10 animate-fade-up">
      <div class="flex justify-center mb-6">
        <UButton :to="`/w/${slug}`" variant="ghost" color="neutral" size="sm" icon="i-heroicons-arrow-left" aria-label="Back to Cover" class="text-white/70 hover:text-white rounded-full bg-white/5 border border-white/10 backdrop-blur-sm px-4">
          Return to Invitation
        </UButton>
      </div>

      <div class="text-center space-y-3 mb-8">
        <!-- FIXED: Injected custom Google Font styling directly into the header -->
        <h1 class="text-5xl font-bold tracking-wide drop-shadow-md" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">
          {{ wedding.content.rsvpTitle || 'RSVP' }}
        </h1>
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

      <div class="rounded-3xl border bg-ink-900/40 backdrop-blur-xl shadow-2xl px-6 py-10 sm:px-10" :style="{ borderColor: 'var(--theme-accent-soft)' }">
        <template v-if="!submitted">
          <div class="flex items-center justify-center gap-3 mb-10">
            <template v-for="(label, index) in steps" :key="label">
              <div class="flex items-center gap-3">
                <div class="step-dot transition-all duration-500" :class="index <= currentStep ? 'step-dot-active scale-110 shadow-lg' : ''">
                  <UIcon v-if="index < currentStep" name="i-heroicons-check" class="w-4 h-4" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span class="hidden sm:inline text-xs uppercase tracking-widest font-medium transition-colors duration-300" :class="index <= currentStep ? '' : 'text-white/30'" :style="index <= currentStep ? { color: 'var(--theme-accent)' } : {}">
                  {{ label }}
                </span>
              </div>
              <div v-if="index < steps.length - 1" class="w-6 sm:w-12 h-px transition-colors duration-500" :class="index < currentStep ? 'bg-gold-400/50' : 'bg-white/10'" />
            </template>
          </div>

          <div class="relative min-h-[300px]">
            <Transition :name="transitionName" mode="out-in">
              <div :key="currentStep" class="w-full">
                
                <template v-if="currentStep === 0">
                  <div class="space-y-8">
                    <UFormField label="Name(s)" name="name" :error="errors.name">
                      <UInput v-model="state.name" placeholder="Type your full name" size="xl" class="w-full shadow-inner" variant="outline" />
                    </UFormField>

                    <div>
                      <p class="text-sm text-white/80 mb-3 font-medium">{{ wedding.content.rsvpAttendQuestion || 'Will you be attending?' }}</p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label class="option-card" :class="{ 'option-card-active': state.attending === 'Yes' }">
                          <input v-model="state.attending" type="radio" value="Yes" class="sr-only">
                          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 mb-2 opacity-80" />
                          <span class="font-medium">{{ wedding.content.rsvpAttendYes || 'Joyfully Accept' }}</span>
                        </label>
                        <label class="option-card" :class="{ 'option-card-active': state.attending === 'No' }">
                          <input v-model="state.attending" type="radio" value="No" class="sr-only">
                          <UIcon name="i-heroicons-x-circle" class="w-6 h-6 mb-2 opacity-80" />
                          <span class="font-medium">{{ wedding.content.rsvpAttendNo || 'Regretfully Decline' }}</span>
                        </label>
                      </div>
                      <p v-if="errors.attending" class="mt-2 text-sm text-red-400 font-medium animate-in fade-in">{{ errors.attending }}</p>
                    </div>
                  </div>
                </template>

                <template v-else-if="currentStep === 1">
                  <template v-if="state.attending === 'No'">
                    <div class="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
                      <UIcon name="i-heroicons-envelope-open" class="w-12 h-12 text-white/30" />
                      <p class="text-white/80 italic text-lg">
                        We’ll miss you, <span class="font-semibold text-white">{{ state.name || 'friend' }}</span>! <br/>Feel free to leave us a wish on the next step.
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
                          <label class="option-card-small" :class="{ 'option-card-active': state.specialSeating === true }">
                            <input v-model="state.specialSeating" type="radio" :value="true" class="sr-only"> Yes
                          </label>
                          <label class="option-card-small" :class="{ 'option-card-active': state.specialSeating === false }">
                            <input v-model="state.specialSeating" type="radio" :value="false" class="sr-only"> No
                          </label>
                        </div>
                        <p v-if="errors.specialSeating" class="mt-2 text-sm text-red-400 animate-in fade-in">{{ errors.specialSeating }}</p>
                      </div>

                      <UFormField :label="wedding.content.rsvpDietaryLabel || 'Dietary restrictions (if any)'" name="dietary">
                        <UInput v-model="state.dietary" placeholder="e.g. Vegetarian, No Seafood" size="lg" class="w-full" />
                      </UFormField>
                    </div>
                  </template>
                </template>

                <template v-else-if="currentStep === 2">
                  <div class="space-y-6">
                    <UFormField :label="wedding.content.rsvpWishesLabel || 'Wishes & Blessings'" name="doa" :error="errors.doa">
                      <p class="italic text-xs mb-2 opacity-70" :style="{ color: 'var(--theme-accent)' }">Write your well wishes for the couple</p>
                      <UTextarea v-model="state.doa" placeholder="May your marriage be blessed..." :rows="4" class="w-full resize-none custom-scrollbar shadow-inner text-base" />
                    </UFormField>

                    <div class="rounded-xl border border-white/10 bg-white/5 p-5 text-sm space-y-2 backdrop-blur-md shadow-inner">
                      <h4 class="font-semibold text-white mb-3 border-b border-white/10 pb-2">RSVP Summary</h4>
                      <div class="grid grid-cols-3 gap-2">
                        <span class="text-white/50">Name:</span> <span class="col-span-2 font-medium">{{ state.name }}</span>
                        <span class="text-white/50">Status:</span> <span class="col-span-2 font-medium" :class="state.attending === 'Yes' ? 'text-emerald-400' : 'text-red-400'">{{ state.attending === 'Yes' ? 'Attending' : 'Not Attending' }}</span>
                        <template v-if="state.attending === 'Yes'">
                          <span class="text-white/50">Guests:</span> <span class="col-span-2">{{ state.guestCount }}</span>
                          <span class="text-white/50">Special:</span> <span class="col-span-2">{{ state.specialSeating ? 'Yes' : 'No' }}</span>
                          <span v-if="state.dietary" class="text-white/50">Dietary:</span> <span v-if="state.dietary" class="col-span-2">{{ state.dietary }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </Transition>
          </div>

          <div class="flex items-center justify-between mt-12 pt-6 border-t border-white/10 relative z-20">
            <UButton v-if="currentStep > 0" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" class="hover:bg-white/10 rounded-full px-4" @click="goBack">Back</UButton>
            <div v-else></div>
            
            <UButton v-if="currentStep < steps.length - 1" color="primary" trailing-icon="i-heroicons-arrow-right" class="rounded-full px-8 shadow-md" size="lg" @click="goNext">Continue</UButton>
            <UButton v-else color="primary" size="lg" icon="i-heroicons-paper-airplane" :loading="submitting" class="rounded-full px-8 shadow-[0_0_20px_-5px_var(--theme-accent)] animate-glow" @click="submitForm">Confirm RSVP</UButton>
          </div>
        </template>

        <template v-else>
          <div class="text-center space-y-6 animate-in zoom-in duration-500 py-10">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border-2 mb-2" :style="{ borderColor: 'var(--theme-accent)' }">
              <UIcon name="i-heroicons-check" class="w-12 h-12" :style="{ color: 'var(--theme-accent)' }" />
            </div>
            
            <div>
              <h2 class="text-4xl font-display mb-2 drop-shadow-md" :style="{ color: 'var(--theme-ink)' }">Thank you, {{ lastSubmittedName }}!</h2>
              <p class="text-white/80 text-lg font-light max-w-md mx-auto leading-relaxed">
                Your RSVP has been securely received.{{ lastAttending === 'Yes' ? ' We are absolutely thrilled to celebrate with you.' : ' You will be dearly missed.' }}
              </p>
            </div>
            
            <div class="pt-6">
              <UButton variant="soft" color="neutral" class="rounded-full px-6 hover:bg-white/10 transition-colors" @click="resetForm">Submit another response</UButton>
            </div>
          </div>

          <div class="mt-12 pt-10 border-t border-white/10 animate-fade-up delay-2">
            <WishesWall :wedding-id="wedding.id" />
          </div>
        </template>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { z } from 'zod'
import { addDoc, collection } from 'firebase/firestore'

const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars } = useThemes()
const { db, isConfigured } = useFirebase()
const toast = useToast()

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

const steps = ['About You', 'Details', 'Wishes']
const currentStep = ref(0)
const transitionName = ref('slide-left')
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

function goNext() {
  if (!validateStep(currentStep.value)) return
  transitionName.value = 'slide-left'
  currentStep.value = Math.min(currentStep.value + 1, steps.length - 1)
}

function goBack() {
  clearErrors()
  transitionName.value = 'slide-right'
  currentStep.value = Math.max(currentStep.value - 1, 0)
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
  transitionName.value = 'slide-right'
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
.step-dot {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.step-dot-active {
  border-color: var(--theme-accent, #e3b04a);
  color: var(--theme-ink, #f3ddaa);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.2));
}

.option-card {
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
.option-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.option-card-small {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.option-card-small:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
}

.option-card-active, .option-card-small.option-card-active {
  border-color: var(--theme-accent, #e3b04a);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15));
  color: var(--theme-ink, #f3ddaa);
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: absolute;
  width: 100%;
}

.slide-left-enter-from { opacity: 0; transform: translateX(40px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-40px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-40px); }
.slide-right-leave-to { opacity: 0; transform: translateX(40px); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>