<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
    </div>

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search by name or email..." size="lg" class="max-w-sm" />
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
    <div v-else-if="filteredAccounts.length === 0" class="empty-state">
      <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
        <UIcon name="i-heroicons-film" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-white/50 text-sm">No VIP accounts match this filter.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="acct in filteredAccounts" :key="acct.uid" class="account-row">
        <div class="min-w-0">
          <p class="font-medium truncate">{{ acct.displayName || acct.email || '—' }}</p>
          <p class="text-xs text-white/50 truncate">{{ acct.email }}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge :color="statusColor(acct.vipApprovalStatus)" variant="subtle">{{ acct.vipApprovalStatus }}</UBadge>
          <UButton
            v-if="acct.weddingId"
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-heroicons-arrow-top-right-on-square"
            :to="`/admin/vip/${acct.weddingId}`"
            target="_blank"
            external
          >
            Open Editor
          </UButton>
          <span v-else class="text-xs text-white/30 italic">No invitation created yet</span>

          <template v-if="acct.vipApprovalStatus === 'pending'">
            <UButton size="xs" color="primary" icon="i-heroicons-check" :loading="updatingUid === acct.uid" @click="setStatus(acct, 'approved')">Approve</UButton>
            <UButton size="xs" variant="soft" color="error" icon="i-heroicons-x-mark" :loading="updatingUid === acct.uid" @click="setStatus(acct, 'rejected')">Reject</UButton>
          </template>
          <template v-else-if="acct.vipApprovalStatus === 'approved'">
            <UButton size="xs" variant="soft" color="error" icon="i-heroicons-no-symbol" :loading="updatingUid === acct.uid" @click="setStatus(acct, 'rejected')">Revoke access</UButton>
          </template>
          <template v-else>
            <UButton size="xs" variant="soft" color="primary" icon="i-heroicons-check" :loading="updatingUid === acct.uid" @click="setStatus(acct, 'approved')">Grant access</UButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import type { VipApprovalStatus } from '~/composables/useAuth'
import type { WeddingDoc } from '~/composables/useWeddingTypes'

// VIP Cinematic is its own account tier (role 'vip' on users/{uid}, see
// useAuth.ts) - not a feature a regular couple's wedding can request. This
// is where a superadmin reviews sign-up requests and grants/revokes
// access. Loads every 'vip' user directly (same getDocs-the-whole-
// collection pattern as AdminWeddingsList.vue), plus every wedding once so
// each VIP account's own invitation (if they've created one) can be linked
// to without an extra query per row.
const { db, isConfigured } = useFirebase()
const toast = useToast()

interface VipAccountRow {
  uid: string
  email: string | null
  displayName: string | null
  vipApprovalStatus: VipApprovalStatus
  weddingId: string | null
}

const accounts = ref<VipAccountRow[]>([])
const loading = ref(true)
const search = ref('')
const updatingUid = ref<string | null>(null)

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all'
const filter = ref<FilterTab>('pending')
const tabs: { id: FilterTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' }
]

function statusColor(status: VipApprovalStatus) {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'primary'
  return 'error'
}

async function loadAccounts() {
  if (!isConfigured || !db) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const [usersSnap, weddingsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'weddings'))
    ])

    const weddingByOwner = new Map<string, string>()
    weddingsSnap.docs.forEach((d) => {
      const w = d.data() as WeddingDoc
      weddingByOwner.set(w.ownerUid, d.id)
    })

    accounts.value = usersSnap.docs
      .map((d) => d.data() as { role?: string; email?: string | null; displayName?: string | null; vipApprovalStatus?: VipApprovalStatus })
      .map((data, i) => ({ uid: usersSnap.docs[i]!.id, ...data }))
      .filter((u) => u.role === 'vip')
      .map((u) => ({
        uid: u.uid,
        email: u.email ?? null,
        displayName: u.displayName ?? null,
        vipApprovalStatus: u.vipApprovalStatus || 'pending',
        weddingId: weddingByOwner.get(u.uid) || null
      }))
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not load VIP accounts', description: 'Check that your account has the superadmin role in Firestore.', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(loadAccounts)

const pendingCount = computed(() => accounts.value.filter((a) => a.vipApprovalStatus === 'pending').length)
const approvedCount = computed(() => accounts.value.filter((a) => a.vipApprovalStatus === 'approved').length)
const rejectedCount = computed(() => accounts.value.filter((a) => a.vipApprovalStatus === 'rejected').length)

const filteredAccounts = computed(() => {
  const q = search.value.trim().toLowerCase()
  return accounts.value.filter((a) => {
    if (filter.value !== 'all' && a.vipApprovalStatus !== filter.value) return false
    if (!q) return true
    return [a.displayName, a.email].some((field) => field?.toLowerCase().includes(q))
  })
})

async function setStatus(acct: VipAccountRow, status: VipApprovalStatus) {
  if (!db) return
  updatingUid.value = acct.uid
  try {
    await updateDoc(doc(db, 'users', acct.uid), { vipApprovalStatus: status })
    const target = accounts.value.find((a) => a.uid === acct.uid)
    if (target) target.vipApprovalStatus = status
    toast.add({
      title: status === 'approved' ? 'VIP access granted' : status === 'rejected' ? 'VIP access declined' : 'Status updated',
      color: status === 'approved' ? 'success' : 'neutral'
    })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not update status', color: 'error' })
  } finally {
    updatingUid.value = null
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

.account-row {
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

.account-row:hover {
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
