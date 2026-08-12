<template>
    <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">
      
      <div v-if="loading" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" style="color: #e3b04a;" />
        <p class="animate-pulse tracking-widest uppercase text-xs">Loading RSVP Editor...</p>
      </div>
  
      <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
        <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
          <UIcon name="i-heroicons-envelope-open" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
        </div>
        <p class="text-lg">Wedding not found.</p>
        <UButton to="/admin" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Back to all weddings</UButton>
      </div>
  
      <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pt-4 lg:pt-0">
          <div>
            <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
              RSVP Text & Localization
            </h1>
            <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
              <UIcon name="i-heroicons-language" class="w-4 h-4" style="color: #e3b04a;" />
              Translate or customize the questions your guests answer.
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
            </span>
            <UButton 
              size="lg" 
              color="primary" 
              class="font-semibold shadow-xl shadow-gold-500/20 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/30 w-full sm:w-auto" 
              :loading="saving" 
              @click="saveContent"
            >
              Save changes
            </UButton>
          </div>
        </div>
  
        <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">
          
          <!-- Left Column: Controls -->
          <div class="flex-1 w-full lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-8 order-2 lg:order-1">
            
            <div class="space-y-6 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div class="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
                <h2 class="text-lg font-semibold text-white">RSVP Prompts</h2>
                <div class="flex bg-gray-900 border border-gray-700 rounded-full p-1">
                  <button type="button" @click="applyTranslation('en')" class="px-3 py-1 text-xs font-medium rounded-full transition-colors hover:bg-gray-800 hover:text-white text-gray-400">English</button>
                  <button type="button" @click="applyTranslation('ms')" class="px-3 py-1 text-xs font-medium rounded-full transition-colors hover:bg-gray-800 hover:text-white text-gray-400">Bahasa Melayu</button>
                </div>
              </div>
  
              <div class="space-y-4">
                <UFormField label="RSVP Page Title">
                  <UInput v-model="form.rsvpTitle" placeholder="e.g. RSVP" class="w-full" />
                </UFormField>
  
                <UFormField label="Deadline Prefix">
                  <UInput v-model="form.rsvpDeadlineText" placeholder="e.g. Kindly respond by" class="w-full" />
                </UFormField>
                
                <div class="h-px bg-white/10 my-4 w-full"></div>
  
                <UFormField label="Attendance Question">
                  <UInput v-model="form.rsvpAttendQuestion" placeholder="e.g. Will you be attending?" class="w-full" />
                </UFormField>
                
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="'Yes' Option Label">
                    <UInput v-model="form.rsvpAttendYes" placeholder="e.g. Joyfully Accept" class="w-full" />
                  </UFormField>
                  <UFormField label="'No' Option Label">
                    <UInput v-model="form.rsvpAttendNo" placeholder="e.g. Regretfully Decline" class="w-full" />
                  </UFormField>
                </div>
  
                <div class="h-px bg-white/10 my-4 w-full"></div>

                <h3 class="text-sm font-semibold text-white mb-1">Step Labels</h3>
                <div class="grid grid-cols-3 gap-3">
                  <UFormField label="Step 1">
                    <UInput v-model="form.rsvpStepAboutYou" placeholder="About You" class="w-full" />
                  </UFormField>
                  <UFormField label="Step 2">
                    <UInput v-model="form.rsvpStepDetails" placeholder="Details" class="w-full" />
                  </UFormField>
                  <UFormField label="Step 3">
                    <UInput v-model="form.rsvpStepWishes" placeholder="Wishes" class="w-full" />
                  </UFormField>
                </div>

                <div class="h-px bg-white/10 my-4 w-full"></div>

                <h3 class="text-sm font-semibold text-white mb-1">Name Field</h3>
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Field Label">
                    <UInput v-model="form.rsvpNameLabel" placeholder="e.g. Name(s)" class="w-full" />
                  </UFormField>
                  <UFormField label="Placeholder">
                    <UInput v-model="form.rsvpNamePlaceholder" placeholder="e.g. Type your full name" class="w-full" />
                  </UFormField>
                </div>

                <div class="h-px bg-white/10 my-4 w-full"></div>

                <UFormField label="Guest Count Label">
                  <UInput v-model="form.rsvpGuestLabel" placeholder="e.g. Number of guests attending" class="w-full" />
                </UFormField>
  
                <UFormField label="Special Seating Question">
                  <UInput v-model="form.rsvpSeatingLabel" placeholder="e.g. Do you require special seating?" class="w-full" />
                </UFormField>
  
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Dietary Restrictions Label">
                    <UInput v-model="form.rsvpDietaryLabel" placeholder="e.g. Dietary restrictions (if any)" class="w-full" />
                  </UFormField>
                  <UFormField label="Dietary Placeholder">
                    <UInput v-model="form.rsvpDietaryPlaceholder" placeholder="e.g. Vegetarian, No Seafood" class="w-full" />
                  </UFormField>
                </div>
  
                <div class="h-px bg-white/10 my-4 w-full"></div>
  
                <UFormField label="Wishes Label">
                  <UInput v-model="form.rsvpWishesLabel" placeholder="e.g. Wishes & Blessings" class="w-full" />
                </UFormField>
                <UFormField label="Wishes Subtitle">
                  <UInput v-model="form.rsvpWishesSubtitle" placeholder="e.g. Write your well wishes for the couple" class="w-full" />
                </UFormField>
                <UFormField label="Wishes Placeholder">
                  <UInput v-model="form.rsvpWishesPlaceholder" placeholder="e.g. May your marriage be blessed..." class="w-full" />
                </UFormField>

                <div class="h-px bg-white/10 my-4 w-full"></div>

                <h3 class="text-sm font-semibold text-white mb-1">Summary Screen</h3>
                <UFormField label="Summary Title">
                  <UInput v-model="form.rsvpSummaryTitle" placeholder="e.g. RSVP Summary" class="w-full" />
                </UFormField>
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="'Name' Label">
                    <UInput v-model="form.rsvpSummaryNameLabel" placeholder="Name:" class="w-full" />
                  </UFormField>
                  <UFormField label="'Status' Label">
                    <UInput v-model="form.rsvpSummaryStatusLabel" placeholder="Status:" class="w-full" />
                  </UFormField>
                  <UFormField label="'Guests' Label">
                    <UInput v-model="form.rsvpSummaryGuestsLabel" placeholder="Guests:" class="w-full" />
                  </UFormField>
                  <UFormField label="'Special' Label">
                    <UInput v-model="form.rsvpSummarySpecialLabel" placeholder="Special:" class="w-full" />
                  </UFormField>
                  <UFormField label="'Dietary' Label">
                    <UInput v-model="form.rsvpSummaryDietaryLabel" placeholder="Dietary:" class="w-full" />
                  </UFormField>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="'Attending' Status Text">
                    <UInput v-model="form.rsvpAttendingText" placeholder="Attending" class="w-full" />
                  </UFormField>
                  <UFormField label="'Not Attending' Status Text">
                    <UInput v-model="form.rsvpNotAttendingText" placeholder="Not Attending" class="w-full" />
                  </UFormField>
                </div>

                <div class="h-px bg-white/10 my-4 w-full"></div>

                <h3 class="text-sm font-semibold text-white mb-1">Buttons</h3>
                <div class="grid grid-cols-3 gap-3">
                  <UFormField label="Back Button">
                    <UInput v-model="form.rsvpBackButton" placeholder="Back" class="w-full" />
                  </UFormField>
                  <UFormField label="Continue Button">
                    <UInput v-model="form.rsvpContinueButton" placeholder="Continue" class="w-full" />
                  </UFormField>
                  <UFormField label="Confirm Button">
                    <UInput v-model="form.rsvpConfirmButton" placeholder="Confirm RSVP" class="w-full" />
                  </UFormField>
                </div>

                <div class="h-px bg-white/10 my-4 w-full"></div>

                <h3 class="text-sm font-semibold text-white mb-1">Confirmation Messages</h3>
                <UFormField label="If Attending">
                  <UInput v-model="form.rsvpSuccessYes" placeholder="We are absolutely thrilled to celebrate with you." class="w-full" />
                </UFormField>
                <UFormField label="If Not Attending">
                  <UInput v-model="form.rsvpSuccessNo" placeholder="You will be dearly missed." class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>
  
          <!-- Right Column: Live Mobile Preview of the RSVP -->
          <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
            <div class="flex items-center justify-between w-full mb-4 px-2">
              <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
              </p>
              <UButton variant="link" color="gray" size="xs" :to="wedding ? `/w/${wedding.slug}/rsvp` : undefined" target="_blank" external padded={false}>
                Open Live <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-1 w-3 h-3"/>
              </UButton>
            </div>
            
            <!-- Smartphone Mockup Wrapper -->
            <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0">
              <div class="phone-notch z-50"></div>
              <!-- Scaled RSVP Mockup inside the phone -->
              <div class="phone-screen hide-scrollbar relative bg-[#04101f] text-white overflow-y-auto" :style="styleVars">
                 <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))` }"></div>
                 
                 <!-- FIXED: Added Missing Cover Photo and Ornaments to RSVP Preview -->
                 <div v-if="form.coverPhotoUrl" class="absolute inset-0 z-0 opacity-40 pointer-events-none">
                   <img :src="form.coverPhotoUrl" class="w-full h-full object-cover" />
                   <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
                 </div>
                 <CardOrnament v-if="form.ornamentStyle" :style="form.ornamentStyle" color="var(--theme-accent)" class="z-0 pointer-events-none" />
  
                 <div class="relative z-10 px-4 py-12 flex flex-col min-h-full">
                    
                    <div class="text-center space-y-3 mb-6 mt-4">
                      <!-- FIXED: Injected custom Google Font styling directly into the header -->
                      <h1 class="text-3xl font-bold tracking-wide drop-shadow-md" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">
                        {{ form.rsvpTitle || 'RSVP' }}
                      </h1>
                      <div class="h-px w-16 mx-auto" :style="{ background: 'var(--theme-accent)' }" />
                      <p class="text-[0.7rem] text-white/70 font-light tracking-wide pt-2">
                        {{ form.rsvpDeadlineText || 'Kindly respond by' }} <span class="font-medium" :style="{ color: 'var(--theme-accent)' }">{{ form.rsvpDeadlineLabel || '28 Aug 2026' }}</span>
                      </p>
                    </div>
  
                    <!-- Mock Form Card -->
                    <div class="rounded-[1.5rem] border bg-ink-900/40 backdrop-blur-xl shadow-xl px-4 py-6" :style="{ borderColor: 'var(--theme-accent-soft)' }">
                      <div class="space-y-6">
                        <div>
                          <p class="text-xs text-white/80 mb-2 font-medium">{{ form.rsvpAttendQuestion || 'Will you be attending?' }}</p>
                          <div class="grid grid-cols-2 gap-2">
                            <label class="p-3 rounded-lg border border-white/15 bg-white/5 text-center text-xs text-white/80">
                              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mb-1" />
                              <br/>{{ form.rsvpAttendYes || 'Joyfully Accept' }}
                            </label>
                            <label class="p-3 rounded-lg border border-white/15 bg-white/5 text-center text-xs text-white/80">
                              <UIcon name="i-heroicons-x-circle" class="w-4 h-4 mb-1" />
                              <br/>{{ form.rsvpAttendNo || 'Regretfully Decline' }}
                            </label>
                          </div>
                        </div>
  
                        <div class="h-px bg-white/10"></div>
  
                        <UFormField :label="form.rsvpGuestLabel || 'Number of guests attending'">
                          <UInput placeholder="1" size="sm" class="w-20" />
                        </UFormField>
  
                        <div>
                          <p class="text-xs text-white/80 mb-2 font-medium">{{ form.rsvpSeatingLabel || 'Do you require special seating?' }}</p>
                          <div class="grid grid-cols-2 gap-2">
                            <label class="p-2 rounded-lg border border-white/15 bg-white/5 text-center text-xs">Yes</label>
                            <label class="p-2 rounded-lg border border-white/15 bg-white/5 text-center text-xs">No</label>
                          </div>
                        </div>
  
                        <UFormField :label="form.rsvpDietaryLabel || 'Dietary restrictions (if any)'">
                          <UInput placeholder="e.g. Vegetarian" size="sm" />
                        </UFormField>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { createDefaultContent, type WeddingContent } from '~/composables/useWeddingTypes'
  
  definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })
  
  const route = useRoute()
  const weddingId = computed(() => route.params.id as string)
  
  const { wedding, loading, saving, updateContent } = useMyWedding(weddingId)
  const { themeStyleVars } = useThemes()
  const toast = useToast()
  
  const form = reactive<WeddingContent>(createDefaultContent())
  const savedAt = ref<number | null>(null)
  
  // Dynamically inject custom Google Font stylesheet into the editor for live preview
  useHead({
    link: computed(() => {
      if (form.customFontUrl && !form.customFontUrl.includes('fonts.google.com/specimen/')) {
        return [{ rel: 'stylesheet', href: form.customFontUrl }]
      }
      return []
    })
  })
  
  const styleVars = computed(() => {
    if (!wedding.value) return {}
    return themeStyleVars(
      wedding.value.themeId,
      { bgFrom: form.customBgFrom, bgTo: form.customBgTo, accent: form.customAccent },
      form.customFontFamily || form.fontFamily
    )
  })
  
  function applyTranslation(lang: 'en' | 'ms') {
    if (lang === 'ms') {
      form.rsvpTitle = 'RSVP / Pengesahan'
      form.rsvpDeadlineText = 'Sila sahkan kehadiran sebelum'
      form.rsvpAttendQuestion = 'Adakah anda akan hadir?'
      form.rsvpAttendYes = 'Ya, Akan Hadir'
      form.rsvpAttendNo = 'Maaf, Tidak Dapat Hadir'
      form.rsvpGuestLabel = 'Jumlah tetamu yang akan hadir'
      form.rsvpSeatingLabel = 'Adakah anda perlukan tempat duduk khas? (Cth: berkerusi roda)'
      form.rsvpDietaryLabel = 'Alahan / Pantang larang makanan'
      form.rsvpWishesLabel = 'Ucapan & Doa'
      form.rsvpStepAboutYou = 'Tentang Anda'
      form.rsvpStepDetails = 'Butiran'
      form.rsvpStepWishes = 'Ucapan'
      form.rsvpNameLabel = 'Nama'
      form.rsvpNamePlaceholder = 'Taip nama penuh anda'
      form.rsvpDietaryPlaceholder = 'Cth: Vegetarian, Tiada Makanan Laut'
      form.rsvpWishesSubtitle = 'Tuliskan ucapan dan doa anda untuk pasangan pengantin'
      form.rsvpWishesPlaceholder = 'Semoga perkahwinan kalian diberkati...'
      form.rsvpSummaryTitle = 'Ringkasan RSVP'
      form.rsvpSummaryNameLabel = 'Nama:'
      form.rsvpSummaryStatusLabel = 'Status:'
      form.rsvpSummaryGuestsLabel = 'Tetamu:'
      form.rsvpSummarySpecialLabel = 'Keperluan Khas:'
      form.rsvpSummaryDietaryLabel = 'Alahan Makanan:'
      form.rsvpAttendingText = 'Akan Hadir'
      form.rsvpNotAttendingText = 'Tidak Dapat Hadir'
      form.rsvpBackButton = 'Kembali'
      form.rsvpContinueButton = 'Seterusnya'
      form.rsvpConfirmButton = 'Sahkan RSVP'
      form.rsvpSuccessYes = 'Kami amat teruja untuk meraikan bersama anda.'
      form.rsvpSuccessNo = 'Kami akan amat merindui kehadiran anda.'
    } else {
      form.rsvpTitle = 'RSVP'
      form.rsvpDeadlineText = 'Kindly respond by'
      form.rsvpAttendQuestion = 'Will you be attending?'
      form.rsvpAttendYes = 'Joyfully Accept'
      form.rsvpAttendNo = 'Regretfully Decline'
      form.rsvpGuestLabel = 'Number of guests attending'
      form.rsvpSeatingLabel = 'Do you require special seating? (e.g., wheelchair access)'
      form.rsvpDietaryLabel = 'Dietary restrictions (if any)'
      form.rsvpWishesLabel = 'Wishes & Blessings'
      form.rsvpStepAboutYou = 'About You'
      form.rsvpStepDetails = 'Details'
      form.rsvpStepWishes = 'Wishes'
      form.rsvpNameLabel = 'Name(s)'
      form.rsvpNamePlaceholder = 'Type your full name'
      form.rsvpDietaryPlaceholder = 'e.g. Vegetarian, No Seafood'
      form.rsvpWishesSubtitle = 'Write your well wishes for the couple'
      form.rsvpWishesPlaceholder = 'May your marriage be blessed...'
      form.rsvpSummaryTitle = 'RSVP Summary'
      form.rsvpSummaryNameLabel = 'Name:'
      form.rsvpSummaryStatusLabel = 'Status:'
      form.rsvpSummaryGuestsLabel = 'Guests:'
      form.rsvpSummarySpecialLabel = 'Special:'
      form.rsvpSummaryDietaryLabel = 'Dietary:'
      form.rsvpAttendingText = 'Attending'
      form.rsvpNotAttendingText = 'Not Attending'
      form.rsvpBackButton = 'Back'
      form.rsvpContinueButton = 'Continue'
      form.rsvpConfirmButton = 'Confirm RSVP'
      form.rsvpSuccessYes = 'We are absolutely thrilled to celebrate with you.'
      form.rsvpSuccessNo = 'You will be dearly missed.'
    }
    toast.add({ title: 'RSVP Text presets applied', color: 'success' })
  }
  
  let initialized = false
  watch(
    wedding,
    (value) => {
      if (!value || initialized) return
      initialized = true
      Object.assign(form, value.content)
      
      // Fallbacks for older DB entries
      if (!form.rsvpTitle) form.rsvpTitle = 'RSVP'
      if (!form.rsvpDeadlineText) form.rsvpDeadlineText = 'Kindly respond by'
      if (!form.rsvpAttendQuestion) form.rsvpAttendQuestion = 'Will you be attending?'
      if (!form.rsvpAttendYes) form.rsvpAttendYes = 'Joyfully Accept'
      if (!form.rsvpAttendNo) form.rsvpAttendNo = 'Regretfully Decline'
      if (!form.rsvpGuestLabel) form.rsvpGuestLabel = 'Number of guests attending'
      if (!form.rsvpSeatingLabel) form.rsvpSeatingLabel = 'Do you require special seating? (e.g., wheelchair access)'
      if (!form.rsvpDietaryLabel) form.rsvpDietaryLabel = 'Dietary restrictions (if any)'
      if (!form.rsvpWishesLabel) form.rsvpWishesLabel = 'Wishes & Blessings'
    },
    { immediate: true }
  )
  
  async function saveContent() {
    await updateContent({ ...form })
    savedAt.value = Date.now()
    toast.add({ title: 'RSVP settings saved', color: 'success' })
    setTimeout(() => { savedAt.value = null }, 3000)
  }
  
  useSeoMeta({ title: 'RSVP Editor (Admin) — WeddingCard', robots: 'noindex, nofollow' })
  </script>
  
  <style scoped>
  .form-panel {
    border-radius: 1.25rem;
    padding: 1.75rem;
    background: #111827; 
    border: 1px solid #374151; 
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  }
  
  .phone-bezel {
    position: relative;
    height: 720px; 
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
    box-shadow: inset 0 -1px 1px rgba(255,255,255,0.05);
  }
  
  .phone-screen {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
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