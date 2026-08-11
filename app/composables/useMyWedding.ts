import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore'
import { createDefaultContent, type FlowItem, type WeddingContent, type WeddingDoc } from './useWeddingTypes'

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function useMyWedding() {
  const { db, isConfigured } = useFirebase()
  const { currentUser } = useAuth()
  const toast = useToast()

  const wedding = ref<WeddingDoc | null>(null)
  const loading = ref(true)
  const saving = ref(false)

  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen() {
    stop()
    if (!isConfigured || !db || !currentUser.value) {
      loading.value = false
      return
    }

    loading.value = true
    const weddingsQuery = query(collection(db, 'weddings'), where('ownerUid', '==', currentUser.value.uid))

    unsubscribe = onSnapshot(
      weddingsQuery,
      (snapshot) => {
        const first = snapshot.docs[0]
        wedding.value = first ? ({ id: first.id, ...first.data() } as WeddingDoc) : null
        loading.value = false
      },
      () => {
        loading.value = false
      }
    )
  }

  watch(currentUser, () => listen(), { immediate: true })
  onBeforeUnmount(stop)

  async function isSlugAvailable(slug: string) {
    if (!db) return false
    const slugDoc = await getDoc(doc(db, 'slugs', slug))
    return !slugDoc.exists()
  }

  async function createWedding(slug: string, brideName: string, groomName: string) {
    if (!db || !currentUser.value) throw new Error('You need to be signed in first')
    const cleanSlug = slugify(slug)
    if (!cleanSlug) throw new Error('Please choose a valid link name')

    const weddingRef = doc(collection(db, 'weddings'))
    const slugRef = doc(db, 'slugs', cleanSlug)

    await runTransaction(db, async (transaction) => {
      const existingSlug = await transaction.get(slugRef)
      if (existingSlug.exists()) {
        throw new Error('That link name is already taken — try another one')
      }

      transaction.set(slugRef, { weddingId: weddingRef.id })
      transaction.set(weddingRef, {
        ownerUid: currentUser.value!.uid,
        slug: cleanSlug,
        themeId: 'timeless-gold',
        plan: 'free',
        paymentStatus: 'unpaid',
        status: 'draft',
        content: createDefaultContent(brideName, groomName),
        flow: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })

    return weddingRef.id
  }

  async function updateContent(partial: Partial<WeddingContent>) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), {
        content: { ...wedding.value.content, ...partial },
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save changes', color: 'error' })
      throw error
    } finally {
      saving.value = false
    }
  }

  async function updateSlug(newSlug: string) {
    if (!db || !wedding.value || !currentUser.value) throw new Error('You need to be signed in first')
    const cleanSlug = slugify(newSlug)
    if (!cleanSlug) throw new Error('Please choose a valid link name')
    if (cleanSlug === wedding.value.slug) return

    const weddingId = wedding.value.id
    const slugRef = doc(db, 'slugs', cleanSlug)
    const weddingRef = doc(db, 'weddings', weddingId)

    saving.value = true
    try {
      await runTransaction(db, async (transaction) => {
        const existingSlug = await transaction.get(slugRef)
        if (existingSlug.exists()) {
          throw new Error('That link name is already taken — try another one')
        }
        // Firestore rules don't allow deleting the old slugs/{slug} doc, so it's
        // left in place rather than removed - it'll keep quietly pointing to
        // this same wedding, which means any link already shared with the old
        // name keeps working instead of breaking.
        transaction.set(slugRef, { weddingId })
        transaction.update(weddingRef, { slug: cleanSlug, updatedAt: serverTimestamp() })
      })
    } finally {
      saving.value = false
    }
  }

  async function updateTheme(themeId: string) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { themeId, updatedAt: serverTimestamp() })
    } finally {
      saving.value = false
    }
  }

  async function updateFlow(flow: FlowItem[]) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { flow, updatedAt: serverTimestamp() })
    } finally {
      saving.value = false
    }
  }

  async function setPublished(published: boolean) {
    if (!db || !wedding.value) return
    await updateDoc(doc(db, 'weddings', wedding.value.id), {
      status: published ? 'published' : 'draft',
      updatedAt: serverTimestamp()
    })
  }

  return {
    wedding,
    loading,
    saving,
    isConfigured,
    isSlugAvailable,
    createWedding,
    updateContent,
    updateSlug,
    updateTheme,
    updateFlow,
    setPublished
  }
}