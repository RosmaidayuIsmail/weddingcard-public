<template>
  <div class="min-h-screen invite-backdrop text-white px-6 py-10">
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-display font-bold text-gold-100">Platform Admin</h1>
          <p class="text-sm text-white/50">All weddings on WeddingCard</p>
        </div>
        <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout">
          Sign out
        </UButton>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="stat-card">
          <p class="stat-label">Total Weddings</p>
          <p class="stat-number">{{ weddings.length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Published</p>
          <p class="stat-number text-emerald-300">{{ publishedCount }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Premium Plan</p>
          <p class="stat-number text-gold-200">{{ premiumCount }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Drafts</p>
          <p class="stat-number text-white/60">{{ weddings.length - publishedCount }}</p>
        </div>
      </div>

      <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search by names or link name..." class="max-w-sm" />

      <div v-if="loading" class="text-center text-white/50 py-10">Loading...</div>
      <div v-else-if="filteredWeddings.length === 0" class="text-center text-white/50 py-10">No weddings found.</div>
      <div v-else class="space-y-2">
        <div v-for="w in filteredWeddings" :key="w.id" class="wedding-row">
          <div>
            <p class="font-medium">{{ w.content.brideName || '\u2014' }} &amp; {{ w.content.groomName || '\u2014' }}</p>
            <p class="text-xs text-white/50">/w/{{ w.slug }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge :color="w.status === 'published' ? 'success' : 'neutral'" variant="subtle">{{ w.status }}</UBadge>
            <UBadge :color="w.plan === 'premium' ? 'primary' : 'neutral'" variant="subtle">{{ w.plan }}</UBadge>
            <UButton size="xs" variant="soft" color="neutral" icon="i-heroicons-arrow-top-right-on-square" :to="`/w/${w.slug}`" target="_blank" external>
              View
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import type { WeddingDoc } from '~/composables/useWeddingTypes'

definePageMeta({ middleware: 'superadmin' })

const { db, isConfigured } = useFirebase()
const { logOut } = useAuth()
const toast = useToast()

const weddings = ref<WeddingDoc[]>([])
const loading = ref(true)
const search = ref('')

async function loadWeddings() {
  if (!isConfigured || !db) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const snapshot = await getDocs(collection(db, 'weddings'))
    weddings.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as WeddingDoc)
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not load weddings', description: 'Check that your account has the superadmin role in Firestore.', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(loadWeddings)

const publishedCount = computed(() => weddings.value.filter((w) => w.status === 'published').length)
const premiumCount = computed(() => weddings.value.filter((w) => w.plan === 'premium').length)

const filteredWeddings = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return weddings.value
  return weddings.value.filter((w) =>
    [w.content.brideName, w.content.groomName, w.slug].some((field) => field?.toLowerCase().includes(q))
  )
})

async function handleLogout() {
  await logOut()
  await navigateTo('/login')
}

useSeoMeta({ title: 'Platform Admin \u2014 WeddingCard', robots: 'noindex, nofollow' })
</script>

<style scoped>
.stat-card {
  border-radius: 0.85rem;
  padding: 1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 160, 23, 0.2);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
}

.stat-number {
  margin-top: 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.wedding-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}
</style>
