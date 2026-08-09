<template>
  <div class="min-h-screen flex flex-col overflow-x-hidden">
    
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" style="color: #e3b04a;" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading Studio...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pt-4 lg:pt-0">
        <div>
          <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            Design Studio
          </h1>
          <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" style="color: #e3b04a;" />
            Customize every detail of your digital invitation
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

      <!-- Fully Mobile-Responsive Dual Pane Setup -->
      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">
        
        <!-- Left Column: Controls -->
        <div class="flex-1 w-full pb-8 space-y-8 order-2 lg:order-1">
          
          <div class="flex overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
            <button
              v-for="section in sections"
              :key="section.id"
              type="button"
              class="tab-button group flex items-center gap-2 whitespace-nowrap shrink-0"
              :class="{ 'tab-button-active': activeSection === section.id }"
              @click="activeSection = section.id"
            >
              <UIcon :name="section.icon" class="w-4 h-4 transition-transform group-hover:scale-110" />
              {{ section.label }}
            </button>
          </div>

          <!-- Couple & Text -->
          <div v-if="activeSection === 'couple'" class="space-y-6 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="panel-header">
              <h2 class="text-lg font-semibold text-white">The Couple & Text</h2>
              <p class="text-xs text-white/50">Your names and the main greetings.</p>
            </div>
            
            <UFormField label="Top Religious/Decorative Icon">
              <USelect
                v-model="form.innerTopIcon"
                :items="topIconOptions"
                size="lg"
                class="w-full mb-2 shadow-inner"
              />
            </UFormField>

            <div v-if="form.innerTopIcon && form.innerTopIcon !== 'none'" class="flex items-center gap-3 mb-2">
              <span class="text-xs text-white/50 shrink-0">Size</span>
              <input v-model.number="form.iconSize" type="range" min="50" max="200" step="5" class="flex-1 accent-[#e3b04a]">
              <span class="text-xs text-white/70 w-10 text-right shrink-0">{{ form.iconSize ?? 100 }}%</span>
            </div>

            <div v-if="form.innerTopIcon === 'custom'" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-3 mb-2">
              <p class="text-xs text-white/50">Upload your own icon — designed in Canva, found on Google, wherever. A small transparent PNG works best.</p>
              <div class="flex items-center gap-3">
                <div v-if="form.customIconUrl" class="w-14 h-14 rounded-lg overflow-hidden border border-gray-700 bg-black/30 shrink-0 flex items-center justify-center">
                  <img :src="form.customIconUrl" alt="Custom icon" class="max-w-full max-h-full object-contain">
                </div>
                <input ref="iconInput" type="file" accept="image/*" class="hidden" @change="handleIconSelect">
                <div class="flex flex-wrap gap-2">
                  <UButton size="sm" variant="soft" color="neutral" icon="i-heroicons-arrow-up-tray" :loading="iconUploading" :disabled="!cloudinaryConfigured" @click="iconInput?.click()">
                    {{ form.customIconUrl ? 'Change icon' : 'Upload icon' }}
                  </UButton>
                  <UButton v-if="form.customIconUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.customIconUrl = ''" />
                </div>
              </div>
            </div>

            <!-- Horizontal vs Vertical Names Toggle -->
            <UFormField label="Names Layout Alignment">
              <div class="flex bg-gray-900 border border-gray-700 rounded-lg p-1 w-full mb-4">
                <button 
                  type="button" 
                  @click="form.namesLayout = 'horizontal'" 
                  class="flex-1 py-2 text-[11px] sm:text-xs font-medium rounded-md transition-all duration-300"
                  :class="form.namesLayout === 'horizontal' ? 'bg-gray-700 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-white'"
                >
                  Side by Side
                </button>
                <button 
                  type="button" 
                  @click="form.namesLayout = 'vertical'" 
                  class="flex-1 py-2 text-[11px] sm:text-xs font-medium rounded-md transition-all duration-300"
                  :class="form.namesLayout === 'vertical' ? 'bg-gray-700 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-white'"
                >
                  Stacked
                </button>
              </div>
            </UFormField>

            <div class="grid sm:grid-cols-2 gap-5">
              <UFormField label="Bride's Short Name">
                <UInput v-model="form.brideName" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Groom's Short Name">
                <UInput v-model="form.groomName" size="lg" class="w-full" />
              </UFormField>
            </div>
            
            <div class="h-px w-full bg-white/5 my-2"></div>
            
            <div class="grid sm:grid-cols-2 gap-5">
              <UFormField label="Bride's Full Name">
                <UInput v-model="form.brideFullName" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Bride's Parents">
                <UInput v-model="form.brideParents" placeholder="Tuan Haji ... & Puan Hajjah ..." size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Groom's Full Name">
                <UInput v-model="form.groomFullName" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Groom's Parents">
                <UInput v-model="form.groomParents" placeholder="Encik ... & Puan ..." size="lg" class="w-full" />
              </UFormField>
            </div>

            <div class="h-px w-full bg-white/5 my-2"></div>

            <UFormField label="Inner Greeting (e.g. You're Invited)">
              <UInput v-model="form.innerGreeting" placeholder="You're Invited" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Inner Intro (e.g. To the wedding celebration of)">
              <UInput v-model="form.innerIntro" placeholder="To the wedding celebration of" size="lg" class="w-full" />
            </UFormField>

            <div class="grid sm:grid-cols-2 gap-5">
              <UFormField label="Button Text: View Details">
                <UInput v-model="form.btnDetails" placeholder="View Details" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Button Text: RSVP Now">
                <UInput v-model="form.btnRsvp" placeholder="RSVP Now" size="lg" class="w-full" :disabled="form.rsvpEnabled === false" />
              </UFormField>
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-gray-700">
              <div class="pr-4">
                <p class="text-sm font-semibold text-white">Collect RSVPs</p>
                <p class="text-xs text-white/50 mt-0.5">Turn off for an invitation-only card with no RSVP button or form — useful if you're tracking attendance another way.</p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="form.rsvpEnabled !== false"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
                :class="form.rsvpEnabled !== false ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                @click="form.rsvpEnabled = !form.rsvpEnabled"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="form.rsvpEnabled !== false ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>

            <div class="h-px w-full bg-white/5 my-2"></div>

            <UFormField label="Your Story / Opening Message">
              <template #help>
                <span class="text-xs text-white/40">A short, heartfelt welcome message for your guests.</span>
              </template>
              <UTextarea v-model="form.story" :rows="4" class="w-full resize-none custom-scrollbar" />
            </UFormField>
          </div>

          <!-- Event details -->
          <div v-if="activeSection === 'event'" class="space-y-6 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="panel-header">
              <h2 class="text-lg font-semibold text-white">Event Logistics</h2>
              <p class="text-xs text-white/50">Time, place, and RSVPs.</p>
            </div>

            <div class="grid sm:grid-cols-2 gap-5">
              <UFormField label="Wedding Date">
                <div class="relative w-full" ref="calendarRef">
                  <button 
                    type="button" 
                    @click="showCalendar = !showCalendar" 
                    class="w-full flex items-center text-left font-normal h-10 px-3 bg-[#111827] border border-gray-700 hover:bg-gray-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-400 overflow-hidden"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-5 h-5 mr-2 shrink-0" style="color: #e3b04a;" />
                    <span :class="!form.dateLabel ? 'text-gray-500' : 'text-gray-200'" class="truncate flex-1">
                      {{ form.dateLabel || 'Select a date' }}
                    </span>
                  </button>
                  
                  <Transition name="fade-down">
                    <div v-if="showCalendar" class="absolute left-0 top-12 p-4 w-[280px] bg-[#111827] border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100]">
                      <div class="flex items-center justify-between mb-4">
                        <UButton variant="ghost" color="gray" icon="i-heroicons-chevron-left" @click.stop="prevMonth" class="text-white hover:bg-gray-800" />
                        <span class="font-semibold text-white tracking-wide">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
                        <UButton variant="ghost" color="gray" icon="i-heroicons-chevron-right" @click.stop="nextMonth" class="text-white hover:bg-gray-800" />
                      </div>
                      <div class="grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-wider text-gold-400 font-semibold mb-2">
                        <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</span>
                      </div>
                      <div class="grid grid-cols-7 gap-1">
                        <button
                          v-for="(day, idx) in calendarDays"
                          :key="idx"
                          :disabled="!day"
                          type="button"
                          class="h-8 w-full rounded-lg flex items-center justify-center text-sm transition-all duration-200"
                          :class="[
                            !day ? 'opacity-0 cursor-default' : 'hover:bg-gray-800 text-gray-200 cursor-pointer',
                            day && isSelectedDate(day) ? 'bg-[#e3b04a] !text-black font-bold shadow-md hover:bg-gold-500' : ''
                          ]"
                          @click="day && selectDate(day)"
                        >
                          {{ day ? day.getDate() : '' }}
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </UFormField>
              
              <UFormField label="Time">
                <UInput v-model="form.timeLabel" placeholder="11:00 AM – 4:00 PM" size="lg" class="w-full">
                  <template #leading><UIcon name="i-heroicons-clock" style="color: #e3b04a;" class="w-5 h-5" /></template>
                </UInput>
              </UFormField>
            </div>
            
            <div class="space-y-5">
              <UFormField label="Venue Name">
                <UInput v-model="form.venueName" placeholder="e.g. Grand Ballroom, Dewan Perdana" size="lg" class="w-full">
                  <template #leading><UIcon name="i-heroicons-building-office-2" style="color: #e3b04a;" class="w-5 h-5" /></template>
                </UInput>
              </UFormField>
              <UFormField label="Venue Address">
                <UInput v-model="form.venueAddress" placeholder="Full address" size="lg" class="w-full">
                  <template #leading><UIcon name="i-heroicons-map-pin" style="color: #e3b04a;" class="w-5 h-5" /></template>
                </UInput>
              </UFormField>
              <UFormField label="Google Maps Link">
                <UInput v-model="form.mapUrl" placeholder="https://goo.gl/maps/..." size="lg" class="w-full">
                  <template #leading><UIcon name="i-heroicons-link" style="color: #e3b04a;" class="w-5 h-5" /></template>
                </UInput>
              </UFormField>
            </div>

            <div class="grid sm:grid-cols-2 gap-5">
              <UFormField label="RSVP Deadline">
                <UInput v-model="form.rsvpDeadlineLabel" placeholder="27 July 2026" size="lg" class="w-full">
                  <template #leading><UIcon name="i-heroicons-calendar-days" style="color: #e3b04a;" class="w-5 h-5" /></template>
                </UInput>
              </UFormField>
              <UFormField label="Hashtag (Optional)">
                <UInput v-model="form.hashtag" placeholder="#AisyahDanial2026" size="lg" class="w-full">
                  <template #leading><UIcon name="i-heroicons-hashtag" style="color: #e3b04a;" class="w-5 h-5" /></template>
                </UInput>
              </UFormField>
            </div>

            <!-- Optional Gift Toggle -->
            <div class="p-5 rounded-xl bg-[#111827] border border-gray-800 space-y-4 mt-4 shadow-inner">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 text-gold-300">
                  <UIcon name="i-heroicons-gift" class="w-5 h-5" style="color: #e3b04a;" />
                  <span class="font-medium tracking-wide">Gift / Money Transfer Details</span>
                </div>
                <button 
                  type="button" 
                  @click="form.enableGift = !form.enableGift"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                  :class="form.enableGift ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.enableGift ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <Transition name="fade-down">
                <div v-if="form.enableGift" class="space-y-4 pt-4 border-t border-gray-800">
                  <div class="grid sm:grid-cols-3 gap-4">
                    <UFormField label="Bank Name">
                      <UInput v-model="form.bank.name" size="md" class="w-full" placeholder="e.g. Maybank" />
                    </UFormField>
                    <UFormField label="Account Name">
                      <UInput v-model="form.bank.accountName" size="md" class="w-full" />
                    </UFormField>
                    <UFormField label="Account Number">
                      <UInput v-model="form.bank.accountNumber" size="md" class="w-full" />
                    </UFormField>
                  </div>
                  
                  <div class="pt-4 border-t border-gray-800 mt-4">
                    <p class="text-sm font-medium text-gray-300 mb-3">Transfer QR Code <span class="text-xs text-gray-500 font-normal ml-1">(Optional)</span></p>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div v-if="form.bank.qrCodeUrl" class="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 shrink-0 shadow-md">
                        <img :src="form.bank.qrCodeUrl" class="w-full h-full object-cover" />
                      </div>
                      <div class="flex flex-col gap-2">
                        <input ref="qrInput" type="file" accept="image/*" class="hidden" @change="handleQrSelect">
                        <div class="flex flex-wrap gap-2">
                          <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-qr-code" :loading="qrUploading" :disabled="!cloudinaryConfigured" @click="qrInput?.click()">
                            {{ form.bank.qrCodeUrl ? 'Change QR' : 'Upload QR Code' }}
                          </UButton>
                          <UButton v-if="form.bank.qrCodeUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.bank.qrCodeUrl = ''" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Photo & Canvas Overrides -->
          <div v-if="activeSection === 'photo'" class="space-y-6 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="panel-header">
              <h2 class="text-lg font-semibold text-white">Hero Photo (Inner Card)</h2>
              <p class="text-xs text-white/50">This sets the mood behind your invitation's main text inside the envelope.</p>
              <p class="text-xs text-indigo-300/80 mt-1 flex items-center gap-1">
                <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 shrink-0" />
                This is separate from your envelope/cover screen's background — that one lives on the
                <NuxtLink to="/dashboard/opening" class="underline hover:text-indigo-200">Opening Design</NuxtLink> page.
              </p>
            </div>

            <!-- Hide System Text Toggle -->
            <div class="p-4 rounded-xl border border-gold-400/30 bg-gold-400/5 mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-gold-300 mb-1">Use Full Custom Canva Image</h3>
                  <p class="text-xs text-gray-400 max-w-[280px]">Turn this on to completely hide our system's names and text. Perfect if you designed all your typography directly inside Canva!</p>
                </div>
                <button 
                  type="button" 
                  @click="form.hideSystemText = !form.hideSystemText"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                  :class="form.hideSystemText ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.hideSystemText ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>

            <UAlert
              v-if="!cloudinaryConfigured"
              icon="i-heroicons-exclamation-triangle"
              color="warning"
              variant="soft"
              title="Photo upload isn't configured yet"
              description="Add NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env to enable this."
            />

            <!-- Drag & Drop / Upload Zone Look -->
            <div class="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-300"
                 :class="form.coverPhotoUrl ? 'border-transparent' : 'border-gray-700 hover:border-gold-400/50 bg-gray-900/50'"
                 @click="!uploading && cloudinaryConfigured ? fileInput?.click() : null">
                 
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect">
              
              <div v-if="form.coverPhotoUrl" class="aspect-[4/3] w-full relative">
                <img :src="form.coverPhotoUrl" alt="Cover photo" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <UButton variant="solid" color="white" icon="i-heroicons-arrow-path" class="pointer-events-none text-black">
                    Change Photo
                  </UButton>
                </div>
              </div>
              
              <div v-else class="aspect-[4/3] w-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
                  <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-500 group-hover:text-gold-400 transition-colors" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-300">Click to upload a photo</p>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                </div>
                <UButton v-if="uploading" loading variant="ghost" color="gray">Uploading...</UButton>
              </div>
            </div>

            <div v-if="form.coverPhotoUrl" class="flex justify-end gap-2">
              <UButton variant="soft" color="neutral" icon="i-heroicons-scissors" size="sm" :loading="bgRemoving" :disabled="!cloudinaryConfigured" @click="handleRemoveBackground">
                {{ bgRemoving ? 'Removing background…' : 'Remove background' }}
              </UButton>
              <UButton variant="ghost" color="error" icon="i-heroicons-trash" size="sm" @click="removePhoto">
                Remove photo
              </UButton>
            </div>
            <p v-if="form.coverPhotoUrl" class="text-[11px] text-white/40 -mt-2">
              Runs entirely in your browser — first use downloads a small AI model, so it may take a moment.
            </p>

            <div class="p-5 rounded-xl bg-indigo-900/20 border border-indigo-800">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-indigo-800/40 shrink-0">
                  <UIcon name="i-heroicons-paint-brush" class="w-5 h-5 text-indigo-300" />
                </div>
                <div class="w-full">
                  <p class="text-sm font-semibold text-white mb-1">Design your Template in Canva</p>
                  <p class="text-xs text-gray-400 mb-3 leading-relaxed">
                    Click the button below to open your shareable Canva template. <br/>
                    <em>(Note: Canva's security prevents automatic syncing back to external websites. You must click "Download" in Canva, and upload the image here.)</em>
                  </p>
                  
                  <div class="flex flex-col gap-3">
                    <UButton size="sm" variant="soft" color="primary" icon="i-heroicons-arrow-top-right-on-square" :to="dynamicCanvaLink" target="_blank" external class="w-fit">
                      Open Template in Canva
                    </UButton>
                    
                    <div class="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                        <p class="text-xs text-gray-400 mb-1"><strong>App Owner:</strong> Paste your Canva Template "View Link" below. We will automatically append the Bride & Groom names into the URL.</p>
                        <UInput v-model="adminCanvaTemplate" placeholder="https://www.canva.com/design/DA.../view" size="xs" icon="i-heroicons-link" class="w-full mt-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Theme -->
          <div v-if="activeSection === 'theme'" class="space-y-8 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <!-- Curated Themes -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-white">Curated Themes</h2>
                <UBadge color="primary" variant="subtle" size="xs">Premium</UBadge>
              </div>
              <ThemePicker v-model="selectedThemeId" />
            </div>

            <!-- Custom Colors -->
            <div class="pt-6 border-t border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-sm font-semibold text-white">Custom Palette</h3>
                  <p class="text-xs text-gray-400">Fine-tune the colors to match your motif perfectly.</p>
                </div>
                <UButton size="xs" variant="ghost" color="gray" icon="i-heroicons-arrow-path" @click="resetColors" title="Reset to theme defaults" />
              </div>
              
              <div class="grid grid-cols-3 gap-2 sm:gap-4">
                <label class="color-picker-wrapper group">
                  <span class="color-picker-label">Bg Start</span>
                  <div class="color-picker-swatch" :style="{ backgroundColor: form.customBgFrom || currentTheme.palette.bgFrom }">
                    <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :value="form.customBgFrom || currentTheme.palette.bgFrom" @input="form.customBgFrom = ($event.target as HTMLInputElement).value">
                  </div>
                  <span class="text-[0.65rem] font-mono text-gray-500 uppercase tracking-widest mt-1 hidden sm:block">{{ form.customBgFrom || currentTheme.palette.bgFrom }}</span>
                </label>
                <label class="color-picker-wrapper group">
                  <span class="color-picker-label">Bg End</span>
                  <div class="color-picker-swatch" :style="{ backgroundColor: form.customBgTo || currentTheme.palette.bgTo }">
                    <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :value="form.customBgTo || currentTheme.palette.bgTo" @input="form.customBgTo = ($event.target as HTMLInputElement).value">
                  </div>
                  <span class="text-[0.65rem] font-mono text-gray-500 uppercase tracking-widest mt-1 hidden sm:block">{{ form.customBgTo || currentTheme.palette.bgTo }}</span>
                </label>
                <label class="color-picker-wrapper group">
                  <span class="color-picker-label">Accent</span>
                  <div class="color-picker-swatch" :style="{ backgroundColor: form.customAccent || currentTheme.palette.accent }">
                    <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :value="form.customAccent || currentTheme.palette.accent" @input="form.customAccent = ($event.target as HTMLInputElement).value">
                  </div>
                  <span class="text-[0.65rem] font-mono text-gray-500 uppercase tracking-widest mt-1 hidden sm:block">{{ form.customAccent || currentTheme.palette.accent }}</span>
                </label>
              </div>
            </div>

            <!-- Typography & Google Fonts Toggle -->
            <div class="pt-6 border-t border-gray-800">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-sm font-semibold text-white mb-1">Typography</h3>
                  <p class="text-xs text-gray-400">Select a curated font, or link any font from Google Fonts.</p>
                </div>
              </div>

              <div class="flex bg-gray-900 border border-gray-700 rounded-lg p-1 mb-6">
                <button 
                  type="button" 
                  @click="toggleFontMode(false)" 
                  class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300"
                  :class="!useCustomFont ? 'bg-gray-700 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-white'"
                >
                  Curated Defaults
                </button>
                <button 
                  type="button" 
                  @click="toggleFontMode(true)" 
                  class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2"
                  :class="useCustomFont ? 'bg-gray-700 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-white'"
                >
                  <UIcon name="i-heroicons-link" class="w-4 h-4" /> Custom Google Font
                </button>
              </div>
              
              <div v-show="!useCustomFont" class="animate-in fade-in duration-300">
                <USelect
                  v-model="fontSelectValue"
                  :items="fontSelectItems"
                  size="xl"
                  class="w-full shadow-inner"
                />
              </div>

              <!-- Google Fonts Integration Fields -->
              <div v-show="useCustomFont" class="p-4 sm:p-5 rounded-xl bg-gold-400/5 border border-gold-400/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="p-3 sm:p-4 rounded-lg bg-black/40 border border-white/5 text-sm text-white/70">
                  <p class="font-semibold text-gold-300 mb-2 flex items-center gap-2"><UIcon name="i-heroicons-sparkles" /> Auto-Magic Font Setup!</p>
                  <p class="text-xs mb-3">Just paste the website link from Google Fonts and we will extract the correct code for you automatically.</p>
                  <ul class="list-disc pl-4 space-y-2 text-xs">
                    <li><strong>Example Paste:</strong> <code class="text-emerald-400 bg-emerald-400/10 px-1 rounded break-all">https://fonts.google.com/specimen/Edu+VIC+WA+NT+Hand+Precursive</code></li>
                  </ul>
                </div>

                <UFormField label="Google Font Stylesheet URL">
                  <UInput v-model="form.customFontUrl" placeholder="Paste URL here..." size="md" class="w-full">
                    <template #leading><UIcon name="i-heroicons-link" style="color: #e3b04a;" class="w-4 h-4" /></template>
                  </UInput>
                </UFormField>
                
                <UFormField label="CSS Font Family Name">
                  <UInput v-model="form.customFontFamily" placeholder="Auto-filled..." size="md" class="w-full">
                    <template #leading><UIcon name="i-heroicons-code-bracket" style="color: #e3b04a;" class="w-4 h-4" /></template>
                  </UInput>
                </UFormField>
              </div>
              
              <!-- Live Preview of Font -->
              <div class="mt-6 p-6 rounded-xl bg-gray-900 border border-gray-800 text-center overflow-hidden flex items-center justify-center min-h-[100px] shadow-inner">
                <span class="text-3xl sm:text-4xl transition-all duration-300 drop-shadow-md" 
                      :style="{ 
                        fontFamily: activeFontFamily,
                        color: form.customAccent || currentTheme.palette.accent 
                      }">
                  {{ form.brideName || 'Aisyah' }} <span class="text-[0.6em] mx-1 opacity-80" style="color: #e3b04a;">&amp;</span> {{ form.groomName || 'Danial' }}
                </span>
              </div>
            </div>

            <!-- Ornaments & Petals Toggle -->
            <div class="pt-6 border-t border-gray-800 space-y-6">
              <div>
                <h3 class="text-sm font-semibold text-white mb-1">Aesthetic Ornaments</h3>
                <p class="text-xs text-gray-400 mb-4">Choose a decorative frame or flourish for your card.</p>
                
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="opt in ornamentOptions"
                    :key="opt.value"
                    type="button"
                    class="ornament-card group"
                    :class="{ 'ornament-card-active': form.ornamentStyle === opt.value }"
                    @click="form.ornamentStyle = opt.value"
                  >
                    <div class="h-16 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                         :style="{ color: form.ornamentStyle === opt.value ? (form.customAccent || currentTheme.palette.accent) : 'currentColor' }">
                      <UIcon :name="opt.icon" class="w-8 h-8 drop-shadow" />
                    </div>
                    <span class="text-xs font-medium">{{ opt.label }}</span>
                    <UIcon v-if="form.ornamentStyle === opt.value" name="i-heroicons-check-circle" class="absolute top-2 right-2 w-4 h-4 text-current" />
                  </button>
                </div>
              </div>

              <!-- Petals Toggle -->
              <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-white mb-1">Falling Petals Animation</h3>
                  <p class="text-xs text-gray-400">Add a beautiful falling petals effect to the background.</p>
                </div>
                <button 
                  type="button" 
                  @click="form.enablePetals = !form.enablePetals"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                  :class="form.enablePetals ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.enablePetals ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Column: Live Preview Frame -->
        <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 lg:sticky lg:top-8 lg:self-start order-1 lg:order-2">
          
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <div class="flex bg-gray-900 border border-gray-700 rounded-lg p-1">
              <button 
                type="button" 
                @click="previewMode = 'cover'" 
                :class="previewMode === 'cover' ? 'bg-gray-700 text-gold-300' : 'text-gray-400 hover:text-white'" 
                class="px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-colors"
              >Cover</button>
              <button 
                type="button" 
                @click="previewMode = 'details'" 
                :class="previewMode === 'details' ? 'bg-gray-700 text-gold-300' : 'text-gray-400 hover:text-white'" 
                class="px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-colors"
              >Inner Card</button>
            </div>
            
            <UButton variant="link" color="gray" size="xs" :to="wedding ? `/w/${wedding.slug}` : undefined" target="_blank" external padded={false}>
              Open Live <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-1 w-3 h-3"/>
            </UButton>
          </div>
          
          <!-- Smartphone Mockup Wrapper -->
          <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0 relative group">
            <div class="phone-notch z-50"></div>
            
            <!-- Draggable Hint Overlay -->
            <div v-if="previewMode === 'cover' && !form.hideSystemText" class="absolute top-10 inset-x-0 z-50 pointer-events-none flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span class="bg-black/60 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-xl border border-white/10">Drag text blocks to move</span>
            </div>

            <!-- The actual preview component -->
            <div class="phone-screen hide-scrollbar relative bg-[#04101f]">
              <WeddingCardPreview v-if="previewMode === 'cover'" :content="form" :theme-id="selectedThemeId" :editable="true" class="min-h-full" />
              <WeddingDetailsPreview v-else :content="form" :theme-id="selectedThemeId" :flow="wedding?.flow || []" class="min-h-full" />
            </div>
          </div>

          <UButton block variant="soft" color="gray" class="mt-6 w-full max-w-[360px] rounded-xl py-3 border border-gray-700 hover:bg-gray-800 transition-colors shrink-0" icon="i-heroicons-printer" :to="wedding ? `/w/${wedding.slug}/print` : undefined" target="_blank" external>
            Generate Printable PDF
          </UButton>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createDefaultContent, type WeddingContent } from '~/composables/useWeddingTypes'
import { onClickOutside } from '@vueuse/core'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { wedding, loading, saving, updateContent, updateTheme } = useMyWedding()
const { isConfigured: cloudinaryConfigured, uploadImage } = useCloudinary()
const { removeBackground, processing: bgRemoving } = useBackgroundRemoval()
const { getTheme, fontOptions } = useThemes()
const toast = useToast()

const sections = [
  { id: 'couple', label: 'The Couple', icon: 'i-heroicons-heart' },
  { id: 'event', label: 'Event Details', icon: 'i-heroicons-map-pin' },
  { id: 'photo', label: 'Inner Card', icon: 'i-heroicons-photo' },
  { id: 'theme', label: 'Aesthetics', icon: 'i-heroicons-swatch' }
] as const

const activeSection = ref<(typeof sections)[number]['id']>('couple')
const previewMode = ref<'cover' | 'details'>('cover') 
const form = reactive<WeddingContent>(createDefaultContent())
const selectedThemeId = ref('timeless-gold')
const savedAt = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const qrInput = ref<HTMLInputElement | null>(null)
const qrUploading = ref(false)

const iconInput = ref<HTMLInputElement | null>(null)
const iconUploading = ref(false)

const adminCanvaTemplate = ref('')

// FIXED: Defined options array here as a standard ref for the Dropdown
const topIconOptions = ref([
  { label: 'None', value: 'none' },
  { label: 'Bismillah (﷽)', value: 'bismillah' },
  { label: 'Interlocking Rings', value: 'rings' },
  { label: 'Heart', value: 'heart' },
  { label: 'Custom Upload', value: 'custom' }
])

const currentTheme = computed(() => getTheme(selectedThemeId.value))

// Custom Bulletproof Calendar Logic
const showCalendar = ref(false)
const calendarRef = ref(null)
onClickOutside(calendarRef, () => showCalendar.value = false)

const calendarDate = ref(new Date())
const currentMonth = computed(() => calendarDate.value.getMonth())
const currentYear = computed(() => calendarDate.value.getFullYear())
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function prevMonth() {
  calendarDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}
function nextMonth() {
  calendarDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentYear.value, currentMonth.value, i))
  return days
})

function isSelectedDate(day: Date) {
  if (!form.dateISO) return false
  const selected = new Date(form.dateISO)
  return day.getDate() === selected.getDate() && 
         day.getMonth() === selected.getMonth() && 
         day.getFullYear() === selected.getFullYear()
}

function selectDate(day: Date) {
  const existingTime = form.dateISO ? form.dateISO.slice(11, 16) : '11:00'
  const yyyy = day.getFullYear()
  const mm = String(day.getMonth() + 1).padStart(2, '0')
  const dd = String(day.getDate()).padStart(2, '0')
  
  form.dateISO = `${yyyy}-${mm}-${dd}T${existingTime}:00`
  form.dateLabel = day.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  showCalendar.value = false
}

// Typography Controls
const FONT_DEFAULT_SENTINEL = 'default'

const fontSelectItems = computed(() => [
  { label: `Theme default (${currentTheme.value.headingFont})`, value: FONT_DEFAULT_SENTINEL },
  ...fontOptions.map((f) => ({ label: f.label, value: f.id }))
])

const fontSelectValue = computed({
  get: () => form.fontFamily || FONT_DEFAULT_SENTINEL,
  set: (value: string) => {
    form.fontFamily = value === FONT_DEFAULT_SENTINEL ? '' : value
  }
})

function getFontFamilyName(val: string) {
  if (val === FONT_DEFAULT_SENTINEL || !val) {
    return currentTheme.value.headingFont
  }
  return val
}

const useCustomFont = ref(false)

function toggleFontMode(isCustom: boolean) {
  useCustomFont.value = isCustom
  if (!isCustom) {
    form.customFontUrl = ''
    form.customFontFamily = ''
  }
}

const activeFontFamily = computed(() => {
  if (useCustomFont.value && form.customFontFamily) return form.customFontFamily
  return getFontFamilyName(fontSelectValue.value)
})

watch(() => form.customFontUrl, (newVal) => {
  if (newVal && newVal.includes('fonts.google.com/specimen/')) {
    try {
      const urlObj = new URL(newVal)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)
      const rawFontName = pathSegments[pathSegments.length - 1] 
      
      if (rawFontName) {
        const cleanFontNameEncoded = rawFontName.split('?')[0]
        form.customFontUrl = `https://fonts.googleapis.com/css2?family=${cleanFontNameEncoded}&display=swap`
        if (!form.customFontFamily) {
          const fontNameDecoded = decodeURIComponent(cleanFontNameEncoded).replace(/\+/g, ' ')
          form.customFontFamily = `'${fontNameDecoded}', cursive`
        }
        toast.add({ title: 'Google Font auto-formatted!', color: 'success' })
      }
    } catch (e) {
      console.error(e)
    }
  }
})

useHead({
  link: computed(() => {
    if (form.customFontUrl && !form.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: form.customFontUrl }]
    }
    return []
  })
})

const ornamentOptions = [
  { label: 'None', value: 'none', icon: 'i-heroicons-no-symbol' },
  { label: 'Botanical Corners', value: 'botanical-corners', icon: 'i-heroicons-sparkles' },
  { label: 'Floral Wreath', value: 'floral-wreath', icon: 'i-heroicons-globe-alt' },
  { label: 'Minimal Arch', value: 'minimal-arch', icon: 'i-heroicons-stop' },
  { label: 'Art Deco', value: 'geometric-deco', icon: 'i-heroicons-viewfinder-circle' }
]

function resetColors() {
  form.customBgFrom = ''
  form.customBgTo = ''
  form.customAccent = ''
}

const dynamicCanvaLink = computed(() => {
  if (adminCanvaTemplate.value) {
    const connector = adminCanvaTemplate.value.includes('?') ? '&' : '?'
    return `${adminCanvaTemplate.value}${connector}clientName=${encodeURIComponent((form.brideName || 'Bride') + ' & ' + (form.groomName || 'Groom'))}`
  }
  return "https://www.canva.com/design?create=true&mediaType=MobileInvitation"
})

let initialized = false
watch(
  wedding,
  (value) => {
    if (!value || initialized) return
    initialized = true
    Object.assign(form, value.content)
    selectedThemeId.value = value.themeId
    
    // Fallbacks
    if (form.enableGift === undefined) form.enableGift = false
    if (form.enablePetals === undefined) form.enablePetals = true
    if (form.hideSystemText === undefined) form.hideSystemText = false
    if (!form.innerTopIcon) form.innerTopIcon = 'none'

    if (!form.innerGreeting) form.innerGreeting = "You're Invited"
    if (!form.innerIntro) form.innerIntro = 'To the wedding celebration of'
    if (!form.btnDetails) form.btnDetails = 'View Details'
    if (!form.btnRsvp) form.btnRsvp = 'RSVP Now'
    if (form.rsvpEnabled === undefined) form.rsvpEnabled = true

    if (form.greetingX === undefined) form.greetingX = 50
    if (form.greetingY === undefined) form.greetingY = 20
    if (form.introX === undefined) form.introX = 50
    if (form.introY === undefined) form.introY = 30
    if (form.namesX === undefined) form.namesX = 50
    if (form.namesY === undefined) form.namesY = 50
    if (form.dateX === undefined) form.dateX = 50
    if (form.dateY === undefined) form.dateY = 68
    if (form.venueX === undefined) form.venueX = 50
    if (form.venueY === undefined) form.venueY = 78
    if (form.iconX === undefined) form.iconX = 50
    if (form.iconY === undefined) form.iconY = 10
    if (form.iconSize === undefined) form.iconSize = 100
    if (!form.namesLayout) form.namesLayout = 'horizontal'

    if (!form.bank) form.bank = { name: '', accountName: '', accountNumber: '', qrCodeUrl: '' }
    if (form.dateISO) {
      calendarDate.value = new Date(form.dateISO)
    }
    if (form.customFontUrl || form.customFontFamily) {
      useCustomFont.value = true
    }
  },
  { immediate: true }
)

async function saveContent() {
  await updateContent({ ...form })
  if (wedding.value && selectedThemeId.value !== wedding.value.themeId) {
    await updateTheme(selectedThemeId.value)
  }
  savedAt.value = Date.now()
  toast.add({ title: 'Card updated successfully', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  uploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}`)
    form.coverPhotoUrl = url
    toast.add({ title: 'Photo uploaded — remember to save', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    uploading.value = false
  }
  if (fileInput.value) fileInput.value.value = ''
}

async function handleRemoveBackground() {
  if (!form.coverPhotoUrl || !wedding.value) return
  try {
    const sourceResponse = await fetch(form.coverPhotoUrl)
    const sourceBlob = await sourceResponse.blob()
    const resultBlob = await removeBackground(sourceBlob)
    const url = await uploadImage(resultBlob, `weddings/${wedding.value.id}`, 'no-bg.png')
    form.coverPhotoUrl = url
    toast.add({ title: 'Background removed — remember to save', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not remove background', description: 'This runs in your browser and needs a modern browser with enough memory. Try a smaller image.', color: 'error' })
  }
}

async function handleQrSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  qrUploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/qr`)
    form.bank.qrCodeUrl = url
    toast.add({ title: 'QR code uploaded — remember to save', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    qrUploading.value = false
  }
  if (qrInput.value) qrInput.value.value = ''
}

async function handleIconSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  iconUploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/icon`)
    form.customIconUrl = url
    toast.add({ title: 'Icon uploaded — remember to save', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    iconUploading.value = false
  }
  if (iconInput.value) iconInput.value.value = ''
}

function removePhoto() {
  form.coverPhotoUrl = ''
  toast.add({ title: 'Photo removed — remember to save', color: 'neutral' })
}

useSeoMeta({ title: 'Design Studio — WeddingCard' })
</script>

<style scoped>
.tab-button {
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.02);
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.tab-button-active {
  border-color: var(--color-gold-400);
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}

.form-panel {
  border-radius: 1.25rem;
  padding: 1.75rem;
  background: #111827; 
  border: 1px solid #374151; 
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.panel-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
}

.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.color-picker-label {
  font-size: 0.75rem;
  color: #9CA3AF;
  font-weight: 500;
}

.color-picker-swatch {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid #374151;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, border-color 0.2s;
  overflow: hidden;
}

.color-picker-wrapper:hover .color-picker-swatch {
  transform: scale(1.1);
  border-color: var(--color-gold-400);
}

.ornament-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-radius: 1rem;
  background: #1F2937;
  border: 1px solid #374151;
  color: #9CA3AF;
  transition: all 0.3s ease;
}

.ornament-card:hover {
  background: #374151; 
  border-color: rgba(212, 160, 23, 0.4);
  color: white;
}

.ornament-card-active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--color-gold-400);
  color: #f3ddaa;
}

.fade-down-enter-active, .fade-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  background: #111;
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