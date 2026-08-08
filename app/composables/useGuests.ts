import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, type Unsubscribe } from 'firebase/firestore'
import type { GuestDoc } from './useWeddingTypes'

export function useGuests(weddingIdSource: string | Ref<string | undefined> | (() => string | undefined)) {
  const { db, isConfigured } = useFirebase()
  const toast = useToast()

  const guests = ref<GuestDoc[]>([])
  const loading = ref(true)
  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen(weddingId: string | undefined) {
    stop()
    if (!isConfigured || !db || !weddingId) {
      guests.value = []
      loading.value = false
      return
    }

    loading.value = true
    const guestsQuery = query(collection(db, 'weddings', weddingId, 'guests'), orderBy('submittedAt', 'desc'))
    unsubscribe = onSnapshot(
      guestsQuery,
      (snapshot) => {
        guests.value = snapshot.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          return {
            id: d.id,
            name: String(data.name ?? ''),
            tier: (data.tier === 'vip' ? 'vip' : 'general') as 'vip' | 'general',
            phone: String(data.phone ?? ''),
            attending: (data.attending as 'Yes' | 'No' | '') ?? '',
            guestCount: Number(data.guestCount ?? 0),
            specialSeating: Boolean(data.specialSeating),
            dietary: String(data.dietary ?? ''),
            doa: String(data.doa ?? ''),
            submittedAt: String(data.submittedAt ?? '')
          }
        })
        loading.value = false
      },
      () => {
        loading.value = false
      }
    )
  }

  watch(
    () => (typeof weddingIdSource === 'function' ? weddingIdSource() : unref(weddingIdSource)),
    (weddingId) => listen(weddingId),
    { immediate: true }
  )

  onBeforeUnmount(stop)

  const currentWeddingId = computed(() => (typeof weddingIdSource === 'function' ? weddingIdSource() : unref(weddingIdSource)))

  const totalInvited = computed(() => guests.value.length)
  const totalResponded = computed(() => guests.value.filter((g) => g.attending).length)
  const totalAttending = computed(() => guests.value.filter((g) => g.attending === 'Yes').length)
  const totalNotAttending = computed(() => guests.value.filter((g) => g.attending === 'No').length)
  const totalGuestCount = computed(() =>
    guests.value.filter((g) => g.attending === 'Yes').reduce((sum, g) => sum + (g.guestCount || 0), 0)
  )

  async function addGuest(input: { name: string; phone: string; tier: 'vip' | 'general' }) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await addDoc(collection(db, 'weddings', weddingId, 'guests'), {
      name: input.name.trim(),
      phone: input.phone.trim(),
      tier: input.tier,
      attending: '',
      guestCount: 0,
      specialSeating: false,
      dietary: '',
      doa: '',
      submittedAt: new Date().toISOString(),
      invited: true
    })
    toast.add({ title: 'Guest added', color: 'success' })
  }

  async function updateGuestTier(guestId: string, tier: 'vip' | 'general') {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await updateDoc(doc(db, 'weddings', weddingId, 'guests', guestId), { tier })
  }

  async function removeGuest(guestId: string) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await deleteDoc(doc(db, 'weddings', weddingId, 'guests', guestId))
    toast.add({ title: 'Guest removed', color: 'neutral' })
  }

  function whatsappLink(guest: GuestDoc, siteUrl: string, slug: string) {
    const inviteUrl = `${siteUrl}/w/${slug}/rsvp?to=${encodeURIComponent(guest.name)}`
    const message = `You're invited! Please RSVP here: ${inviteUrl}`
    const phone = guest.phone.replace(/[^0-9]/g, '')
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`
  }

  function exportCSV(filename = 'guests.csv') {
    const header = ['Name', 'Tier', 'Phone', 'Attending', 'Guests', 'Special Seating', 'Dietary Needs', 'Blessings', 'Submitted At']
    const rows = guests.value.map((g) => [
      g.name,
      g.tier,
      g.phone,
      g.attending || 'No response yet',
      String(g.guestCount),
      g.specialSeating ? 'Yes' : 'No',
      g.dietary,
      g.doa.replace(/\n/g, ' '),
      g.submittedAt
    ])
    const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    guests,
    loading,
    totalInvited,
    totalResponded,
    totalAttending,
    totalNotAttending,
    totalGuestCount,
    addGuest,
    updateGuestTier,
    removeGuest,
    whatsappLink,
    exportCSV
  }
}
