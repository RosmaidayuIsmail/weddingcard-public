<template>
    <div class="space-y-6">
      <div class="form-card space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5 text-gold-300" />
          <h2 class="font-display text-lg">Apply platform template to existing weddings</h2>
        </div>
        <p class="text-sm text-white/50">
          Fills in whatever a wedding is genuinely missing (fields that don't exist on that document at all) using the current Starter Defaults and schema defaults. It never overwrites a field a couple already has, even if that value matches an old default - their own design stays exactly as-is. Catalog-based things (themes, fonts, RSVP/Day Flow presets, Guest List labels, Custom Code) already reach every wedding live and don't need this.
        </p>

        <div v-if="migrationResult" class="result-box">
          Scanned {{ migrationResult.weddingsScanned }} weddings &middot; updated {{ migrationResult.weddingsUpdated }} &middot; backfilled {{ migrationResult.fieldsBackfilled }} field(s).
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UButton variant="soft" color="neutral" icon="i-heroicons-magnifying-glass" :loading="checking" @click="checkMissing">Check for missing fields</UButton>
          <template v-if="missingCount !== null">
            <span v-if="missingCount === 0" class="text-sm text-emerald-400">Nothing missing - every wedding already has every field.</span>
            <template v-else>
              <span class="text-sm text-gold-200">{{ missingCount }} field(s) missing across all weddings.</span>
              <UButton color="primary" icon="i-heroicons-check" :loading="applying" @click="applyDefaults">Apply to existing weddings</UButton>
            </template>
          </template>
        </div>
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
  
      <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search by names or link name..." size="lg" class="max-w-sm" />
  
      <div v-if="loading" class="text-center text-white/50 py-16">Loading...</div>
      <div v-else-if="filteredWeddings.length === 0" class="empty-state">
        <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
          <UIcon name="i-heroicons-magnifying-glass" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
        </div>
        <p class="text-white/50 text-sm">No weddings found.</p>
      </div>
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
  </template>
  
  <script setup lang="ts">
  import { collection, getDocs } from 'firebase/firestore'
  import type { WeddingDoc } from '~/composables/useWeddingTypes'
  
  const { db, isConfigured } = useFirebase()
  const toast = useToast()
  const { previewMissingCount, applyPlatformDefaultsToExistingWeddings } = useAdminMigrations()

  const weddings = ref<WeddingDoc[]>([])
  const loading = ref(true)
  const search = ref('')

  const checking = ref(false)
  const applying = ref(false)
  const missingCount = ref<number | null>(null)
  const migrationResult = ref<{ weddingsScanned: number; weddingsUpdated: number; fieldsBackfilled: number } | null>(null)

  async function checkMissing() {
    checking.value = true
    try {
      missingCount.value = await previewMissingCount()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not check for missing fields', color: 'error' })
    } finally {
      checking.value = false
    }
  }

  async function applyDefaults() {
    if (missingCount.value === null || missingCount.value === 0) return
    const ok = confirm(`This will backfill ${missingCount.value} missing field(s) across your weddings, using current Starter Defaults for anything genuinely missing. It will NOT change any field a couple already has. Continue?`)
    if (!ok) return
    applying.value = true
    try {
      migrationResult.value = await applyPlatformDefaultsToExistingWeddings()
      missingCount.value = 0
      toast.add({ title: 'Platform template applied', description: `${migrationResult.value.weddingsUpdated} wedding(s) updated.`, color: 'success' })
      await loadWeddings()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not apply platform template', color: 'error' })
    } finally {
      applying.value = false
    }
  }
  
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
  </script>
  
  <style scoped>
  .form-card {
    border-radius: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-box {
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-card {
    border-radius: 1rem;
    padding: 1.1rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
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
    font-size: 1.85rem;
    font-weight: 700;
  }
  
  .wedding-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1.1rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  
  .wedding-row:hover {
    border-color: rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.035);
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem 1rem;
    border-radius: 1rem;
    border: 1px dashed rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.015);
  }
  </style>
