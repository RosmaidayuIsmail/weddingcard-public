<template>
  <div class="pb-12">
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh] text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading Overview...</p>
    </div>

    <div v-else-if="!wedding" class="max-w-md mx-auto mt-12 animate-fade-up">
      <!-- Unchanged setup form omitted for brevity, keeping it identical to prior -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/20 mb-4">
          <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-gold-300" />
        </div>
        <h1 class="text-3xl font-display font-bold text-white mb-2">Let's create your card</h1>
        <p class="text-white/60 text-sm">You can change everything except your link name later.</p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl space-y-5">
        <UFormField label="Bride's Name">
          <UInput v-model="brideName" placeholder="Aisyah" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Groom's Name">
          <UInput v-model="groomName" placeholder="Danial" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Your Custom Link Name" :error="slugError">
          <UInput v-model="slugInput" placeholder="aisyah-danial" size="lg" class="w-full" @input="onSlugInput" icon="i-heroicons-link" />
          <template #help>
            <span class="text-xs text-gold-300/70">yoursite.com/w/{{ slugPreview || 'your-link' }}</span>
          </template>
        </UFormField>

        <UButton block size="xl" color="primary" class="font-semibold shadow-lg shadow-gold-500/20 mt-4 rounded-full" :loading="creating" @click="handleCreate">
          Generate Wedding Card
        </UButton>
      </div>
    </div>

    <!-- Overview Dashboard -->
    <div v-else class="animate-fade-up space-y-8 max-w-6xl mx-auto">
      
      <!-- Top Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-md">
        <div>
          <p class="text-gold-300 text-sm font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-star" class="w-4 h-4" /> Dashboard Overview
          </p>
          <h1 class="text-3xl sm:text-4xl font-display font-bold text-white">
            {{ wedding.content.brideName || 'Your' }} &amp; {{ wedding.content.groomName || 'Wedding' }}
          </h1>
          <div class="flex items-center gap-3 mt-4">
            <UBadge :color="wedding.status === 'published' ? 'success' : 'neutral'" variant="subtle" size="md" class="px-3">
              {{ wedding.status === 'published' ? '🟢 Published Live' : '⚪ Draft Mode' }}
            </UBadge>
            <span class="text-sm font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {{ wedding.plan === 'premium' ? '✨ Premium Plan' : 'Free Plan' }}
            </span>
          </div>
        </div>
        
        <UButton 
          :color="wedding.status === 'published' ? 'neutral' : 'primary'" 
          :variant="wedding.status === 'published' ? 'soft' : 'solid'" 
          size="lg"
          class="rounded-full px-6 font-semibold shadow-md"
          @click="togglePublish"
        >
          {{ wedding.status === 'published' ? 'Unpublish Card' : 'Publish Card Live' }}
        </UButton>
      </div>

      <!-- Share Link Banner -->
      <div class="rounded-2xl border border-gold-400/20 bg-gradient-to-r from-gold-500/10 to-transparent p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between relative overflow-hidden">
        <div class="absolute left-0 top-0 w-1 h-full bg-gold-400"></div>
        <div class="flex-1 overflow-hidden">
          <p class="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">Your Shareable Link</p>
          <!-- Clickable Link fix here -->
          <a :href="publicUrl" target="_blank" class="text-gold-200 font-medium text-lg tracking-wide hover:underline hover:text-gold-100 transition-colors block truncate">
            {{ publicUrl }}
          </a>
        </div>
        <div class="flex gap-3 shrink-0">
          <UButton size="md" variant="soft" color="neutral" icon="i-heroicons-clipboard-document" class="bg-black/20 hover:bg-black/40 border border-white/10 rounded-full" @click="copyLink">
            {{ copied ? 'Copied!' : 'Copy Link' }}
          </UButton>
          <UButton size="md" variant="solid" color="primary" icon="i-heroicons-arrow-top-right-on-square" :to="publicUrl" target="_blank" external class="rounded-full shadow-md">
            View Live
          </UButton>
        </div>
      </div>

      <!-- Bento Grid: Stats & Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Stats Box -->
        <div class="md:col-span-2 grid grid-cols-2 gap-4">
          <div class="stat-card">
            <div class="p-2 rounded-lg bg-white/5 self-start mb-2"><UIcon name="i-heroicons-envelope" class="w-5 h-5 text-white/60" /></div>
            <div>
              <p class="stat-label">Total Invited</p>
              <p class="stat-number">{{ totalInvited }}</p>
            </div>
          </div>
          <div class="stat-card border-emerald-500/20 bg-emerald-500/5">
            <div class="p-2 rounded-lg bg-emerald-500/10 self-start mb-2"><UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-400" /></div>
            <div>
              <p class="stat-label text-emerald-400/70">Attending</p>
              <p class="stat-number text-emerald-400">{{ totalAttending }}</p>
            </div>
          </div>
          <div class="stat-card border-red-500/20 bg-red-500/5">
            <div class="p-2 rounded-lg bg-red-500/10 self-start mb-2"><UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-400" /></div>
            <div>
              <p class="stat-label text-red-400/70">Not Attending</p>
              <p class="stat-number text-red-400">{{ totalNotAttending }}</p>
            </div>
          </div>
          <div class="stat-card border-gold-400/20 bg-gold-400/5">
            <div class="p-2 rounded-lg bg-gold-400/10 self-start mb-2"><UIcon name="i-heroicons-users" class="w-5 h-5 text-gold-300" /></div>
            <div>
              <p class="stat-label text-gold-300/70">Total Headcount</p>
              <p class="stat-number text-gold-300">{{ totalGuestCount }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions Vertical Stack -->
        <div class="space-y-4">
          <NuxtLink to="/dashboard/editor" class="quick-link group">
            <div class="p-3 rounded-xl bg-gold-400/10 group-hover:bg-gold-400/20 transition-colors">
              <UIcon name="i-heroicons-paint-brush" class="w-6 h-6 text-gold-300" />
            </div>
            <div>
              <p class="font-semibold text-white group-hover:text-gold-200 transition-colors">Design Studio</p>
              <p class="text-xs text-white/50">Edit text, theme, and photos</p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
          </NuxtLink>
          
          <NuxtLink to="/dashboard/guests" class="quick-link group">
            <div class="p-3 rounded-xl bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-colors">
              <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p class="font-semibold text-white group-hover:text-emerald-300 transition-colors">Guest List</p>
              <p class="text-xs text-white/50">Manage RSVPs & VIPs</p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
          </NuxtLink>

          <NuxtLink to="/dashboard/flow" class="quick-link group">
            <div class="p-3 rounded-xl bg-indigo-400/10 group-hover:bg-indigo-400/20 transition-colors">
              <UIcon name="i-heroicons-clock" class="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p class="font-semibold text-white group-hover:text-indigo-300 transition-colors">Day Flow</p>
              <p class="text-xs text-white/50">Plan your event timeline</p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { wedding, loading, createWedding, isSlugAvailable, setPublished } = useMyWedding()
const { totalInvited, totalAttending, totalNotAttending, totalGuestCount } = useGuests(() => wedding.value?.id)
const toast = useToast()
const config = useRuntimeConfig()

const brideName = ref('')
const groomName = ref('')
const slugInput = ref('')
const slugError = ref('')
const creating = ref(false)
const copied = ref(false)

const slugPreview = computed(() => slugify(slugInput.value))

function onSlugInput() {
  slugError.value = ''
}

watch([brideName, groomName], () => {
  if (!slugInput.value) {
    slugInput.value = `${brideName.value}-${groomName.value}`.trim()
  }
})

async function handleCreate() {
  slugError.value = ''
  if (!brideName.value.trim() || !groomName.value.trim()) {
    toast.add({ title: 'Please enter both names', color: 'warning' })
    return
  }
  const clean = slugify(slugInput.value)
  if (!clean) {
    slugError.value = 'Please choose a link name'
    return
  }

  creating.value = true
  try {
    const available = await isSlugAvailable(clean)
    if (!available) {
      slugError.value = 'That link name is already taken'
      return
    }
    await createWedding(clean, brideName.value.trim(), groomName.value.trim())
    toast.add({ title: 'Your wedding card is ready!', color: 'success' })
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Something went wrong'
  } finally {
    creating.value = false
  }
}

const publicUrl = computed(() => {
  if (!wedding.value) return ''
  const base = config.public.siteUrl || (import.meta.client ? window.location.origin : '')
  return `${base}/w/${wedding.value.slug}`
})

async function copyLink() {
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function togglePublish() {
  if (!wedding.value) return
  await setPublished(wedding.value.status !== 'published')
  toast.add({ title: wedding.value.status === 'published' ? 'Card published live' : 'Card reverted to draft', color: 'success' })
}
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.25rem;
  padding: 1.5rem;
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
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
}

.quick-link:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(4px);
  box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
}
</style>