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
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
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
              <div class="flex flex-wrap bg-gray-900 border border-gray-700 rounded-full p-1 gap-0.5">
                <button v-for="preset in allRsvpPresets" :key="preset.id" type="button" @click="applyTranslation(preset)" class="px-3 py-1 text-xs font-medium rounded-full transition-colors hover:bg-gray-800 hover:text-white text-gray-400">{{ preset.label }}</button>
              </div>
            </div>

            <div class="space-y-4">
              <UFormField label="RSVP Page Title">
                <UInput v-model="form.rsvpTitle" placeholder="e.g. RSVP" class="w-full" />
              </UFormField>

              <UFormField label="Deadline Prefix">
                <UInput v-model="form.rsvpDeadlineText" placeholder="e.g. Kindly respond by" class="w-full" />
              </UFormField>

              <UFormField label="'Return to Invitation' Button">
                <UInput v-model="form.rsvpReturnButton" placeholder="e.g. Return to Invitation" class="w-full" />
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

              <UFormField label="If Guest Declines - Sympathy Message" hint="Use {name} where the guest's own name should appear">
                <UTextarea v-model="form.rsvpDeclineMessage" :rows="2" placeholder="We'll miss you, {name}! Feel free to leave us a wish on the next step." class="w-full" />
              </UFormField>

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

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Wishes Wall Heading" hint="Shown above the wall of wishes on the thank-you page">
                  <UInput v-model="form.rsvpWishesWallTitle" placeholder="e.g. Wishes & Blessings" class="w-full" />
                </UFormField>
                <UFormField label="Wishes Wall Empty Text">
                  <UInput v-model="form.rsvpWishesEmptyText" placeholder="e.g. Be the first to leave a wish" class="w-full" />
                </UFormField>
              </div>

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

              <div class="h-px bg-white/10 my-4 w-full"></div>

              <h3 class="text-sm font-semibold text-white mb-1">Thank You Screen</h3>
              <UFormField label="Thank You Title" hint="Use {name} where the guest's own name should appear">
                <UInput v-model="form.rsvpThankYouTitle" placeholder="e.g. Thank you, {name}!" class="w-full" />
              </UFormField>
              <UFormField label="Thank You Intro Sentence">
                <UInput v-model="form.rsvpThankYouIntro" placeholder="e.g. Your RSVP has been securely received." class="w-full" />
              </UFormField>
              <UFormField label="'Submit Another Response' Button">
                <UInput v-model="form.rsvpSubmitAnotherButton" placeholder="e.g. Submit another response" class="w-full" />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Mobile Preview of the RSVP -->
        <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-3 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
            </p>
            <UButton variant="link" color="gray" size="xs" :to="wedding ? `/w/${wedding.slug}/rsvp` : undefined" target="_blank" external padded={false}>
              Open Live <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-1 w-3 h-3"/>
            </UButton>
          </div>

          <!-- 4-page toggle, same pattern as Design Studio's Cover/Details switch -->
          <div class="flex flex-wrap items-center justify-center gap-1.5 w-full mb-4 px-2">
            <button
              v-for="(tab, index) in previewTabs"
              :key="tab.key"
              type="button"
              class="preview-tab"
              :class="{ 'preview-tab-active': previewStep === index }"
              @click="goToPreviewStep(index)"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Smartphone Mockup Wrapper -->
          <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0">
            <div class="phone-notch z-50"></div>
            <!-- Scaled RSVP Mockup inside the phone - mirrors the real app/pages/w/[slug]/rsvp.vue markup and classes -->
            <div class="phone-screen hide-scrollbar relative bg-[#04101f] text-white overflow-y-auto" :style="styleVars">
               <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))` }"></div>

               <div v-if="form.coverPhotoUrl" class="absolute inset-0 z-0 opacity-40 pointer-events-none">
                 <img :src="form.coverPhotoUrl" class="w-full h-full object-cover" />
                 <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
               </div>

               <PetalsBackground v-if="form.enablePetals !== false" :style-name="form.petalStyle" class="z-0 pointer-events-none" :count="12" />
               <CardOrnament v-if="form.ornamentStyle" :style="form.ornamentStyle" color="var(--theme-accent)" class="z-0 pointer-events-none" />

               <div class="relative z-10 px-4 py-10 flex flex-col min-h-full">

                  <div class="flex justify-center mb-4">
                    <span class="preview-back-btn">
                      <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" />
                      {{ form.rsvpReturnButton || 'Return to Invitation' }}
                    </span>
                  </div>

                  <div class="text-center space-y-2 mb-6">
                    <h1 class="text-3xl font-bold tracking-wide drop-shadow-md" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">
                      {{ form.rsvpTitle || 'RSVP' }}
                    </h1>
                    <div class="h-px w-16 mx-auto" :style="{ background: 'var(--theme-accent)' }" />
                    <p class="text-[0.7rem] text-white/70 font-light tracking-wide pt-2">
                      {{ form.rsvpDeadlineText || 'Kindly respond by' }} <span class="font-medium" :style="{ color: 'var(--theme-accent)' }">{{ form.rsvpDeadlineLabel || '28 Aug 2026' }}</span>
                    </p>
                  </div>

                  <div class="rounded-[1.5rem] border bg-ink-900/40 backdrop-blur-xl shadow-xl px-4 py-6 flex-1" :style="{ borderColor: 'var(--theme-accent-soft)' }">

                    <template v-if="previewStep < 3">
                      <div class="flex items-center justify-center gap-2 mb-6">
                        <template v-for="(label, index) in previewSteps" :key="label">
                          <div class="flex items-center gap-1.5">
                            <div class="preview-step-dot" :class="{ 'preview-step-dot-active': index <= previewStep }">
                              <UIcon v-if="index < previewStep" name="i-heroicons-check" class="w-3 h-3" />
                              <span v-else>{{ index + 1 }}</span>
                            </div>
                          </div>
                          <div v-if="index < previewSteps.length - 1" class="w-4 h-px" :class="index < previewStep ? 'bg-gold-400/50' : 'bg-white/10'" />
                        </template>
                      </div>

                      <!-- Step 1: About You -->
                      <div v-if="previewStep === 0" class="space-y-5 animate-in fade-in duration-300">
                        <UFormField :label="form.rsvpNameLabel || 'Name(s)'">
                          <UInput v-model="previewState.name" :placeholder="form.rsvpNamePlaceholder || 'Type your full name'" size="sm" class="w-full" />
                        </UFormField>
                        <div>
                          <p class="text-xs text-white/80 mb-2 font-medium">{{ form.rsvpAttendQuestion || 'Will you be attending?' }}</p>
                          <div class="grid grid-cols-2 gap-2">
                            <button type="button" class="preview-option-card" :class="{ 'preview-option-card-active': previewState.attending === 'Yes' }" @click="previewState.attending = 'Yes'">
                              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mb-1" />
                              <span>{{ form.rsvpAttendYes || 'Joyfully Accept' }}</span>
                            </button>
                            <button type="button" class="preview-option-card" :class="{ 'preview-option-card-active': previewState.attending === 'No' }" @click="previewState.attending = 'No'">
                              <UIcon name="i-heroicons-x-circle" class="w-4 h-4 mb-1" />
                              <span>{{ form.rsvpAttendNo || 'Regretfully Decline' }}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Step 2: Details (or decline message) -->
                      <div v-else-if="previewStep === 1" class="animate-in fade-in duration-300">
                        <div v-if="previewState.attending === 'No'" class="flex flex-col items-center justify-center text-center space-y-3 py-8">
                          <UIcon name="i-heroicons-envelope-open" class="w-8 h-8 text-white/30" />
                          <p class="text-white/80 italic text-sm">{{ fillNameToken(form.rsvpDeclineMessage || "We'll miss you, {name}! Feel free to leave us a wish on the next step.", previewState.name) }}</p>
                        </div>
                        <div v-else class="space-y-5">
                          <UFormField :label="form.rsvpGuestLabel || 'Number of guests attending'">
                            <UInputNumber v-model="previewState.guestCount" :min="1" :max="10" size="sm" class="w-24" />
                          </UFormField>
                          <div>
                            <p class="text-xs text-white/80 mb-2 font-medium">{{ form.rsvpSeatingLabel || 'Do you require special seating? (e.g., wheelchair access)' }}</p>
                            <div class="grid grid-cols-2 gap-2">
                              <button type="button" class="preview-option-card-small" :class="{ 'preview-option-card-active': previewState.specialSeating === true }" @click="previewState.specialSeating = true">Yes</button>
                              <button type="button" class="preview-option-card-small" :class="{ 'preview-option-card-active': previewState.specialSeating === false }" @click="previewState.specialSeating = false">No</button>
                            </div>
                          </div>
                          <UFormField :label="form.rsvpDietaryLabel || 'Dietary restrictions (if any)'">
                            <UInput v-model="previewState.dietary" :placeholder="form.rsvpDietaryPlaceholder || 'e.g. Vegetarian, No Seafood'" size="sm" class="w-full" />
                          </UFormField>
                        </div>
                      </div>

                      <!-- Step 3: Wishes & Summary -->
                      <div v-else class="space-y-4 animate-in fade-in duration-300">
                        <UFormField :label="form.rsvpWishesLabel || 'Wishes & Blessings'">
                          <p class="italic text-[0.65rem] mb-1.5 opacity-70" :style="{ color: 'var(--theme-accent)' }">{{ form.rsvpWishesSubtitle || 'Write your well wishes for the couple' }}</p>
                          <UTextarea v-model="previewState.doa" :placeholder="form.rsvpWishesPlaceholder || 'May your marriage be blessed...'" :rows="3" class="w-full text-xs" />
                        </UFormField>
                        <div class="rounded-lg border border-white/10 bg-white/5 p-3 text-[0.7rem] space-y-1.5">
                          <h4 class="font-semibold text-white mb-1.5 border-b border-white/10 pb-1.5">{{ form.rsvpSummaryTitle || 'RSVP Summary' }}</h4>
                          <div class="grid grid-cols-3 gap-1">
                            <span class="text-white/50">{{ form.rsvpSummaryNameLabel || 'Name:' }}</span> <span class="col-span-2 font-medium">{{ previewState.name || 'Guest Name' }}</span>
                            <span class="text-white/50">{{ form.rsvpSummaryStatusLabel || 'Status:' }}</span> <span class="col-span-2 font-medium" :class="previewState.attending === 'Yes' ? 'text-emerald-400' : 'text-red-400'">{{ previewState.attending === 'Yes' ? (form.rsvpAttendingText || 'Attending') : (form.rsvpNotAttendingText || 'Not Attending') }}</span>
                            <template v-if="previewState.attending === 'Yes'">
                              <span class="text-white/50">{{ form.rsvpSummaryGuestsLabel || 'Guests:' }}</span> <span class="col-span-2">{{ previewState.guestCount }}</span>
                              <span class="text-white/50">{{ form.rsvpSummarySpecialLabel || 'Special:' }}</span> <span class="col-span-2">{{ previewState.specialSeating ? 'Yes' : 'No' }}</span>
                            </template>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                        <button v-if="previewStep > 0" type="button" class="preview-nav-btn" @click="goToPreviewStep(previewStep - 1)">
                          <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" /> {{ form.rsvpBackButton || 'Back' }}
                        </button>
                        <div v-else></div>
                        <button type="button" class="preview-nav-btn-primary" @click="goToPreviewStep(previewStep + 1)">
                          <template v-if="previewStep < 2">{{ form.rsvpContinueButton || 'Continue' }} <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" /></template>
                          <template v-else>{{ form.rsvpConfirmButton || 'Confirm RSVP' }} <UIcon name="i-heroicons-paper-airplane" class="w-3 h-3" /></template>
                        </button>
                      </div>
                    </template>

                    <!-- Thank You page -->
                    <template v-else>
                      <div class="text-center space-y-4 py-4 animate-in zoom-in duration-500">
                        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border-2 mb-1" :style="{ borderColor: 'var(--theme-accent)' }">
                          <UIcon name="i-heroicons-check" class="w-7 h-7" :style="{ color: 'var(--theme-accent)' }" />
                        </div>
                        <div>
                          <h2 class="text-xl font-display mb-1.5 drop-shadow-md" :style="{ color: 'var(--theme-ink)' }">{{ fillNameToken(form.rsvpThankYouTitle || 'Thank you, {name}!', previewState.name) }}</h2>
                          <p class="text-white/80 text-xs font-light leading-relaxed">
                            {{ form.rsvpThankYouIntro || 'Your RSVP has been securely received.' }} {{ previewState.attending === 'Yes' ? (form.rsvpSuccessYes || 'We are absolutely thrilled to celebrate with you.') : (form.rsvpSuccessNo || 'You will be dearly missed.') }}
                          </p>
                        </div>
                        <button type="button" class="preview-nav-btn mx-auto">{{ form.rsvpSubmitAnotherButton || 'Submit another response' }}</button>
                      </div>

                      <div class="mt-6 pt-6 border-t border-white/10">
                        <WishesWall
                          v-if="wedding"
                          :wedding-id="wedding.id"
                          :title="form.rsvpWishesWallTitle || 'Wishes & Blessings'"
                          :empty-text="form.rsvpWishesEmptyText || 'Be the first to leave a wish 💛'"
                        />
                      </div>
                    </template>
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
import confetti from 'canvas-confetti'
import { createDefaultContent, type WeddingContent } from '~/composables/useWeddingTypes'
import type { RsvpPreset } from '~/composables/useThemes'

// This is the real RSVP editor, shared by /dashboard/rsvp-editor and the
// /admin/wedding/[id]/rsvp-editor admin page. overrideWeddingId is only
// ever set by the admin page; couples hitting their own dashboard never
// pass it, so useMyWedding() falls back to its normal own-wedding lookup.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading, saving, updateContent } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { themeStyleVars, allRsvpPresets } = useThemes()
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

function applyTranslation(preset: RsvpPreset) {
  Object.assign(form, preset.texts)
  toast.add({ title: `${preset.label} RSVP preset applied`, color: 'success' })
}

// --- Live Preview: a real, navigable 4-page mock of the guest-facing RSVP
// flow (Step 1/2/3 + Thank You), mirroring app/pages/w/[slug]/rsvp.vue's
// markup so every button and animation the editor form controls is visible
// here, not just a single static card. previewState is a local sample
// guest so the preview can be interacted with (choosing Yes/No, typing a
// wish) without ever touching real guest data.
const previewTabs = computed(() => [
  { key: 'step1', label: form.rsvpStepAboutYou || 'About You' },
  { key: 'step2', label: form.rsvpStepDetails || 'Details' },
  { key: 'step3', label: form.rsvpStepWishes || 'Wishes' },
  { key: 'thankyou', label: 'Thank You' }
])
const previewSteps = computed(() => [
  form.rsvpStepAboutYou || 'About You',
  form.rsvpStepDetails || 'Details',
  form.rsvpStepWishes || 'Wishes'
])
const previewStep = ref(0)
const previewState = reactive({
  name: 'Alex Guest',
  attending: 'Yes' as 'Yes' | 'No',
  guestCount: 2,
  specialSeating: false as boolean | null,
  dietary: '',
  doa: 'Wishing you both a lifetime of love and happiness!'
})

function previewConfetti() {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const accentColor = (styleVars.value as Record<string, string>)['--theme-accent'] || '#d4a017'
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.5 },
    colors: [accentColor, '#ffffff', '#f3ddaa'],
    disableForReducedMotion: true
  })
}

function goToPreviewStep(index: number) {
  const clamped = Math.max(0, Math.min(3, index))
  previewStep.value = clamped
  if (clamped === 3) previewConfetti()
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
    if (!form.rsvpReturnButton) form.rsvpReturnButton = 'Return to Invitation'
    if (!form.rsvpDeclineMessage) form.rsvpDeclineMessage = "We'll miss you, {name}! Feel free to leave us a wish on the next step."
    if (!form.rsvpThankYouTitle) form.rsvpThankYouTitle = 'Thank you, {name}!'
    if (!form.rsvpThankYouIntro) form.rsvpThankYouIntro = 'Your RSVP has been securely received.'
    if (!form.rsvpSubmitAnotherButton) form.rsvpSubmitAnotherButton = 'Submit another response'
    if (!form.rsvpWishesWallTitle) form.rsvpWishesWallTitle = 'Wishes & Blessings'
    if (!form.rsvpWishesEmptyText) form.rsvpWishesEmptyText = 'Be the first to leave a wish 💛'
  },
  { immediate: true }
)

async function saveContent() {
  await updateContent({ ...form })
  savedAt.value = Date.now()
  toast.add({ title: 'RSVP settings saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'RSVP Editor — WeddingCard' })
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

/* Live Preview: 4-page toggle (mirrors AdminLivePreview.vue's .preview-tab
   Cover/Details switch) plus the mini step-indicator, option cards, and nav
   buttons used inside the phone mockup - scaled-down equivalents of the
   real classes in app/pages/w/[slug]/rsvp.vue. */
.preview-tab {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  white-space: nowrap;
}

.preview-tab-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.3);
}

.preview-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-step-dot {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.preview-step-dot-active {
  border-color: var(--theme-accent, #e3b04a);
  color: var(--theme-ink, #f3ddaa);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.2));
}

.preview-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.85rem 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
}

.preview-option-card-small {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.preview-option-card-active {
  border-color: var(--theme-accent, #e3b04a) !important;
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15)) !important;
  color: var(--theme-ink, #f3ddaa) !important;
}

.preview-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-nav-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--theme-bg-from, #1f1400);
  background: var(--theme-accent, #d4a017);
}
</style>
