<template>
  <div class="pb-12">
    <div v-if="weddingLoading" class="flex flex-col items-center justify-center min-h-[50vh] text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading Guests...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center min-h-[50vh] text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-users" class="w-12 h-12 text-gold-300/50" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <div v-else class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
          Guest List
        </h1>
        <p class="text-sm text-white/50 mt-2">Manage invitations, RSVPs, and dietary requirements.</p>
      </div>

      <!-- Bento Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 animate-fade-up">
        <div class="stat-card">
          <p class="stat-label flex items-center gap-1.5"><UIcon name="i-heroicons-envelope" class="w-4 h-4"/> Invited</p>
          <p class="stat-number">{{ totalInvited }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label flex items-center gap-1.5"><UIcon name="i-heroicons-chat-bubble-oval-left-ellipsis" class="w-4 h-4"/> Responded</p>
          <p class="stat-number">{{ totalResponded }}</p>
        </div>
        <div class="stat-card border-emerald-500/20 bg-emerald-500/5">
          <p class="stat-label text-emerald-400/70 flex items-center gap-1.5"><UIcon name="i-heroicons-check-circle" class="w-4 h-4"/> Attending</p>
          <p class="stat-number text-emerald-400">{{ totalAttending }}</p>
        </div>
        <div class="stat-card border-gold-400/20 bg-gold-400/5">
          <p class="stat-label text-gold-300/70 flex items-center gap-1.5"><UIcon name="i-heroicons-users" class="w-4 h-4"/> Total Guests</p>
          <p class="stat-number text-gold-300">{{ totalGuestCount }}</p>
        </div>
      </div>

      <!-- Add guest Panel -->
      <div class="form-panel animate-fade-up delay-1">
        <div class="flex items-center gap-2 mb-4 text-white/90">
          <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-gold-300" />
          <h3 class="font-semibold">Add a Guest Manually</h3>
        </div>
        <div class="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-4">
          <UInput v-model="newGuest.name" placeholder="Guest Name" size="lg">
            <template #leading>
              <UIcon name="i-heroicons-user" class="text-gray-500 dark:text-gray-400" />
            </template>
          </UInput>
          <UInput v-model="newGuest.phone" placeholder="+60 12-345 6789 (Optional)" size="lg">
            <template #leading>
              <UIcon name="i-heroicons-phone" class="text-gray-500 dark:text-gray-400" />
            </template>
          </UInput>
          <USelect v-model="newGuest.tier" :items="[{ label: 'General', value: 'general' }, { label: 'VIP', value: 'vip' }]" size="lg" class="w-full sm:w-32" />
          <UButton color="primary" icon="i-heroicons-plus" size="lg" class="w-full sm:w-auto font-semibold px-6 shadow-md hover:-translate-y-0.5 transition-transform" :loading="adding" @click="handleAdd">Add</UButton>
        </div>
      </div>

      <!-- Filters & Actions Bar -->
      <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between animate-fade-up delay-2">
        <div class="flex bg-white/5 p-1 rounded-full border border-white/10">
          <button v-for="t in tierFilters" :key="t.value" type="button" class="filter-pill" :class="{ 'filter-pill-active': tierFilter === t.value }" @click="tierFilter = t.value">
            {{ t.label }}
          </button>
        </div>
        <div class="flex gap-3">
          <UButton size="sm" color="neutral" variant="soft" icon="i-heroicons-printer" class="rounded-full px-4 hover:bg-white/10 border-white/10" @click="printList">Print / PDF</UButton>
          <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-arrow-down-tray" class="rounded-full px-4" @click="exportCSV()">Export CSV</UButton>
        </div>
      </div>

      <!-- List -->
      <div v-if="loading" class="text-center text-white/50 py-16">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2" />
        <p>Loading guest data...</p>
      </div>
      <div v-else-if="filteredGuests.length === 0" class="text-center text-white/50 py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed">
        <UIcon name="i-heroicons-users" class="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No guests in this view.</p>
      </div>
      
      <div v-else id="guest-print-area" class="space-y-3 animate-fade-up delay-3">
        <div v-for="guest in filteredGuests" :key="guest.id" class="guest-row group">
          
          <div class="flex items-center gap-4 min-w-[200px]">
            <button
              type="button"
              class="tier-toggle"
              :class="guest.tier === 'vip' ? 'tier-toggle-vip' : 'tier-toggle-general'"
              :title="guest.tier === 'vip' ? 'Click to change to General' : 'Click to mark as VIP'"
              @click="updateGuestTier(guest.id, guest.tier === 'vip' ? 'general' : 'vip')"
            >
              {{ guest.tier === 'vip' ? 'VIP' : 'Gen' }}
            </button>
            <div>
              <p class="font-medium text-white/90 group-hover:text-gold-200 transition-colors">{{ guest.name }}</p>
              <p class="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                <UIcon name="i-heroicons-phone" class="w-3 h-3" />
                {{ guest.phone || 'No phone' }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 flex-1">
             <div class="hidden md:flex flex-col gap-1 w-40 border-l border-white/10 pl-4">
                 <p class="text-[0.65rem] uppercase tracking-widest text-white/40 font-semibold">Special Seating</p>
                 <p class="text-sm font-medium" :class="guest.specialSeating ? 'text-amber-400' : 'text-white/30'">{{ guest.specialSeating ? 'Required' : 'No' }}</p>
             </div>
             <div class="hidden lg:flex flex-col gap-1 flex-1 border-l border-white/10 pl-4">
                 <p class="text-[0.65rem] uppercase tracking-widest text-white/40 font-semibold">Dietary Needs</p>
                 <p class="text-sm text-white/70 truncate max-w-[200px]">{{ guest.dietary || '—' }}</p>
             </div>
          </div>

          <div class="flex items-center gap-3">
            <UBadge
              :color="guest.attending === 'Yes' ? 'success' : guest.attending === 'No' ? 'error' : 'neutral'"
              variant="subtle"
              class="px-3 py-1"
            >
              {{ guest.attending === 'Yes' ? `Attending (${guest.guestCount})` : guest.attending === 'No' ? 'Declined' : 'No Response' }}
            </UBadge>
            
            <div class="flex items-center border-l border-white/10 pl-3 ml-1 gap-2 print:hidden">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                :icon="copiedId === guest.id ? 'i-heroicons-check' : 'i-heroicons-link'"
                title="Copy personalized RSVP link"
                class="hover:bg-white/10"
                @click="copyGuestLink(guest)"
              />
              <UButton
                v-if="guest.phone"
                size="xs"
                color="success"
                variant="ghost"
                icon="i-heroicons-chat-bubble-left-right"
                :to="whatsappLink(guest, siteUrl, wedding.slug, wedding.content)"
                target="_blank"
                external
                title="Send WhatsApp Invite"
                class="hover:bg-emerald-500/20"
              />
              <UButton 
                size="xs" 
                color="neutral" 
                variant="ghost" 
                icon="i-heroicons-trash" 
                title="Remove Guest"
                class="hover:bg-red-500/20 hover:text-red-400 transition-colors" 
                @click="removeGuest(guest.id)" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GuestDoc } from '~/composables/useWeddingTypes'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { wedding, loading: weddingLoading } = useMyWedding()
const {
  guests,
  loading,
  totalInvited,
  totalResponded,
  totalAttending,
  totalGuestCount,
  addGuest,
  removeGuest,
  updateGuestTier,
  whatsappLink,
  personalizedLink,
  exportCSV
} = useGuests(() => wedding.value?.id)

const toast = useToast()
const config = useRuntimeConfig()
const siteUrl = computed(() => config.public.siteUrl || (import.meta.client ? window.location.origin : ''))

const copiedId = ref<string | null>(null)

async function copyGuestLink(guest: GuestDoc) {
  if (!wedding.value) return
  const link = personalizedLink(guest, siteUrl.value, wedding.value.slug)
  try {
    await navigator.clipboard.writeText(link)
    copiedId.value = guest.id
    toast.add({ title: 'Link copied', description: `Personalized for ${guest.name} \u2014 share it anywhere.`, color: 'success' })
    setTimeout(() => {
      if (copiedId.value === guest.id) copiedId.value = null
    }, 2000)
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}

const newGuest = reactive({ name: '', phone: '', tier: 'general' as 'vip' | 'general' })
const adding = ref(false)

async function handleAdd() {
  if (!newGuest.name.trim()) return
  adding.value = true
  try {
    await addGuest({ ...newGuest })
    newGuest.name = ''
    newGuest.phone = ''
    newGuest.tier = 'general'
  } finally {
    adding.value = false
  }
}

const tierFilters = [
  { label: 'All Guests', value: 'all' as const },
  { label: 'VIPs Only', value: 'vip' as const },
  { label: 'General', value: 'general' as const }
]
const tierFilter = ref<'all' | 'vip' | 'general'>('all')

const filteredGuests = computed(() => {
  if (tierFilter.value === 'all') return guests.value
  return guests.value.filter((g) => g.tier === tierFilter.value)
})

function printList() {
  if (import.meta.client) window.print()
}

useSeoMeta({ title: 'Guest List — WeddingCard' })
</script>

<style scoped>
/* Stat Cards matching Dashboard overview */
.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Glass Panels */
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
}

/* Tab Pills */
.filter-pill {
  padding: 0.4rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-pill:hover {
  color: white;
}

.filter-pill-active {
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}

/* Rows */
.tier-toggle {
  width: 3.5rem;
  padding: 0.3rem 0;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tier-toggle-general {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}

.tier-toggle-general:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.tier-toggle-vip {
  background: rgba(212, 160, 23, 0.18);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.3);
}

.tier-toggle-vip:hover {
  background: rgba(212, 160, 23, 0.28);
}

.guest-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.guest-row:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

@media print {
  .stat-card, .form-panel, .filter-pill, .flex.gap-3 {
    display: none !important;
  }
  
  .guest-row {
    background: transparent;
    border: none;
    border-bottom: 1px solid #ccc;
    border-radius: 0;
    color: black;
    transform: none !important;
    padding: 0.5rem 0;
  }
  
  .text-white\/90, .text-white\/50, .text-white\/70, .text-white\/40, .text-white {
    color: black !important;
  }
}
</style>