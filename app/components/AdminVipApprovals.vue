<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="stat-card">
        <p class="stat-label">Pending Requests</p>
        <p class="stat-number text-gold-200">{{ pendingCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Approved</p>
        <p class="stat-number text-emerald-300">{{ approvedCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Rejected</p>
        <p class="stat-number text-red-300">{{ rejectedCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Never Requested</p>
        <p class="stat-number text-white/60">{{ noneCount }}</p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search by names or link name..." size="lg" class="max-w-sm" />
      <div class="flex flex-wrap bg-gray-900 border border-gray-700 rounded-full p-1 gap-0.5 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="filter === tab.id ? 'bg-gold-500/15 text-gold-200' : 'hover:bg-gray-800 hover:text-white text-gray-400'"
          @click="filter = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-white/50 py-16">Loading...</div>
    <div v-else-if="filteredWeddings.length === 0" class="empty-state">
      <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
        <UIcon name="i-heroicons-film" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-white/50 text-sm">No weddings match this filter.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="w in filteredWeddings" :key="w.id" class="wedding-row">
        <div class="min-w-0">
          <p class="font-medium truncate">{{ w.content.brideName || '—' }} &amp; {{ w.content.groomName || '—' }}</p>
          <p class="text-xs text-white/50">/w/{{ w.slug }}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge :color="statusColor(effectiveStatus(w))" variant="subtle">{{ effectiveStatus(w) }}</UBadge>
          <UButton size="xs" variant="soft" color="neutral" icon="i-heroicons-arrow-top-right-on-square" :to="`/admin/wedding/${w.id}/vip`" target="_blank" external>
            Open Editor
          </UButton>

          <template v-if="effectiveStatus(w) === 'pending'">
            <UButton size="xs" color="primary" icon="i-heroicons-check" :loading="updatingId === w.id" @click="setStatus(w, 'approved')">Approve</UButton>
            <UButton size="xs" variant="soft" color="error" icon="i-heroicons-x-mark" :loading="updatingId === w.id" @click="setStatus(w, 'rejected')">Reject</UButton>
          </template>
          <template v-else-if="effectiveStatus(w) === 'approved'">
            <UButton size="xs" variant="soft" color="error" icon="i-heroicons-no-symbol" :loading="updatingId === w.id" @click="setStatus(w, 'rejected')">Revoke access</UButton>
          </template>
          <template v-else>
            <UButton size="xs" variant="soft" color="primary" icon="i-heroicons-check" :loading="updatingId === w.id" @click="setStatus(w, 'approved')">Grant access</UButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { VipStatus, WeddingDoc } from '~/composables/useWeddingTypes'

// VIP Cinematic is an admin-approved tier (not something every couple can
// switch on themselves) - see VipStatus in useWeddingTypes.ts. This page is
// where a superadmin reviews requests and grants/revokes access. Loads
// every wedding directly (same pattern as AdminWeddingsList.vue) since this
// spans every couple on the platform, not just one.
const { db, isConfigured } = useFirebase()
const toast = useToast()

const weddings = ref<WeddingDoc[]>([])
const loading = ref(true)
const search = ref('')
const updatingId = ref<string | null>(null)

type FilterTab = 'pending' | 'approved' | 'rejected' | 'none' | 'all'
const filter = ref<FilterTab>('pending')
const tabs: { id: FilterTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'none', label: 'Never Requested' },
  { id: 'all', label: 'All' }
]

// Older wedding docs saved before VIP Cinematic existed have no vipStatus
// field at all yet - treat that the same as 'none'.
function effectiveStatus(w: WeddingDoc): VipStatus {
  return w.vipStatus || 'none'
}

function statusColor(status: VipStatus) {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'primary'
  if (status === 'rejected') return 'error'
  return 'neutral'
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

const pendingCount = computed(() => weddings.value.filter((w) => effectiveStatus(w) === 'pending').length)
const approvedCount = computed(() => weddings.value.filter((w) => effectiveStatus(w) === 'approved').length)
const rejectedCount = computed(() => weddings.value.filter((w) => effectiveStatus(w) === 'rejected').length)
const noneCount = computed(() => weddings.value.filter((w) => effectiveStatus(w) === 'none').length)

const filteredWeddings = computed(() => {
  const q = search.value.trim().toLowerCase()
  return weddings.value.filter((w) => {
    if (filter.value !== 'all' && effectiveStatus(w) !== filter.value) return false
    if (!q) return true
    return [w.content.brideName, w.content.groomName, w.slug].some((field) => field?.toLowerCase().includes(q))
  })
})

async function setStatus(w: WeddingDoc, status: VipStatus) {
  if (!db) return
  updatingId.value = w.id
  try {
    await updateDoc(doc(db, 'weddings', w.id), { vipStatus: status, updatedAt: serverTimestamp() })
    const target = weddings.value.find((x) => x.id === w.id)
    if (target) target.vipStatus = status
    toast.add({
      title: status === 'approved' ? 'VIP access granted' : status === 'rejected' ? 'VIP access declined' : 'Status updated',
      color: status === 'approved' ? 'success' : 'neutral'
    })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not update status', color: 'error' })
  } finally {
    updatingId.value = null
  }
}
</script>

<style scoped>
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
