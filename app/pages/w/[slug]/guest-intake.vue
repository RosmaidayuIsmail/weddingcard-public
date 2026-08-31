<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
    <p class="animate-pulse tracking-widest uppercase text-xs">Loading...</p>
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <p class="text-xl font-display mb-2">We couldn't find that invitation.</p>
    </div>
  </div>

  <!-- No ?key= at all - an obviously incomplete/mistyped link. The real
       gate is server-side (server/api/guests/intake.post.ts checks the key
       against server/utils/guest-intake.ts on every submit) - this is just
       a friendlier message than letting them fill the form and fail on
       submit for something this page could already tell was wrong. -->
  <div v-else-if="!keyParam" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm">
      <UIcon name="i-heroicons-lock-closed" class="w-10 h-10 text-gold-300/60 mb-4 mx-auto" />
      <p class="text-lg font-display">This link looks incomplete.</p>
      <p class="text-sm text-white/60 mt-2">Please use the exact guest-list link you were given.</p>
    </div>
  </div>

  <section v-else class="min-h-screen theme-surface text-white flex items-center justify-center px-4 py-12" :style="styleVars">
    <UContainer class="max-w-xl w-full relative z-10">
      <div class="text-center space-y-3 mb-8">
        <p class="text-xs uppercase tracking-widest font-medium" :style="{ color: 'var(--theme-accent)' }">
          {{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}
        </p>
        <h1 class="text-4xl font-bold" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">Add Your Guests</h1>
        <p class="text-sm max-w-md mx-auto" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 70%, transparent)' }">
          Add each guest you'd like to invite below - we'll take care of their personal invitation link and RSVP tracking from here.
        </p>
      </div>

      <div class="rounded-3xl border backdrop-blur-xl shadow-2xl px-6 py-8 sm:px-8 space-y-6" :style="{ background: 'color-mix(in srgb, var(--theme-ink) 5%, transparent)', borderColor: 'var(--theme-accent-soft)' }">
        <div class="grid sm:grid-cols-2 gap-4">
          <UFormField label="Guest name">
            <UInput v-model="form.name" placeholder="e.g. Ahmad bin Ali" size="lg" class="w-full" @keyup.enter="submitGuest" />
          </UFormField>
          <UFormField label="Phone (optional)">
            <UInput v-model="form.phone" placeholder="+60 12-345 6789" size="lg" class="w-full" @keyup.enter="submitGuest" />
          </UFormField>
        </div>

        <div>
          <p class="text-sm mb-3 font-medium" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 80%, transparent)' }">Guest type</p>
          <div class="grid grid-cols-2 gap-3">
            <label class="intake-option" :class="{ 'intake-option-active': form.tier === 'general' }">
              <input v-model="form.tier" type="radio" value="general" class="sr-only"> General
            </label>
            <label class="intake-option" :class="{ 'intake-option-active': form.tier === 'vip' }">
              <input v-model="form.tier" type="radio" value="vip" class="sr-only"> VIP
            </label>
          </div>
        </div>

        <p v-if="errorMsg" class="text-sm text-red-400 font-medium">{{ errorMsg }}</p>

        <UButton block size="lg" icon="i-heroicons-user-plus" :loading="submitting" class="rounded-full px-8 accent-btn" @click="submitGuest">
          Add Guest
        </UButton>
      </div>

      <div v-if="addedGuests.length" class="mt-8">
        <p class="text-xs uppercase tracking-widest mb-3 font-medium" :style="{ color: 'var(--theme-accent)' }">
          Added so far ({{ addedGuests.length }})
        </p>
        <ul class="space-y-2">
          <li
            v-for="(g, i) in addedGuests"
            :key="i"
            class="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
            :style="{ background: 'color-mix(in srgb, var(--theme-ink) 5%, transparent)', color: 'var(--theme-ink)' }"
          >
            <span class="font-medium">{{ g.name }}</span>
            <span class="text-xs uppercase tracking-wide opacity-60">{{ g.tier }}</span>
          </li>
        </ul>
        <p class="text-xs mt-4 text-center" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 50%, transparent)' }">
          You can keep adding guests on this page any time - just save this link.
        </p>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars } = useThemes()
const toast = useToast()

// The secret that gates every submission (checked server-side against
// server/utils/guest-intake.ts on each POST to /api/guests/intake - this
// page never verifies it itself, since a client-side check could never be
// trusted anyway). See DashboardGuestsPanel.vue's "Guest List Intake Link"
// panel for where a couple gets a link with this already filled in.
const keyParam = computed(() => (typeof route.query.key === 'string' ? route.query.key : ''))

const styleVars = computed(() =>
  themeStyleVars(
    wedding.value?.themeId,
    {
      bgFrom: wedding.value?.content.customBgFrom,
      bgTo: wedding.value?.content.customBgTo,
      accent: wedding.value?.content.customAccent
    },
    wedding.value?.content.customFontFamily || wedding.value?.content.fontFamily,
    wedding.value?.content.textWeight
  )
)

useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

const form = reactive({ name: '', phone: '', tier: 'general' as 'vip' | 'general' })
const submitting = ref(false)
const errorMsg = ref('')
const addedGuests = ref<{ name: string; tier: 'vip' | 'general' }[]>([])

async function submitGuest() {
  errorMsg.value = ''
  const name = form.name.trim()
  if (name.length < 2) {
    errorMsg.value = 'Please enter the guest’s name.'
    return
  }
  if (!wedding.value) return

  submitting.value = true
  try {
    await $fetch('/api/guests/intake', {
      method: 'POST',
      body: {
        weddingId: wedding.value.id,
        key: keyParam.value,
        name,
        phone: form.phone.trim(),
        tier: form.tier
      }
    })
    addedGuests.value.unshift({ name, tier: form.tier })
    toast.add({ title: 'Guest added', color: 'success' })
    form.name = ''
    form.phone = ''
    form.tier = 'general'
  } catch (error) {
    const statusMessage = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
    errorMsg.value = statusMessage || 'Something went wrong - please try again.'
  } finally {
    submitting.value = false
  }
}

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({ title: `Add Guests — ${value.content.brideName} & ${value.content.groomName}` })
  },
  { immediate: true }
)
</script>

<style scoped>
.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}
.accent-btn:hover {
  filter: brightness(1.08);
}

.intake-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--theme-ink, #000) 15%, transparent);
  background: color-mix(in srgb, var(--theme-ink, #000) 3%, transparent);
  color: var(--theme-ink);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.intake-option:hover {
  border-color: color-mix(in srgb, var(--theme-ink, #000) 30%, transparent);
  background: color-mix(in srgb, var(--theme-ink, #000) 6%, transparent);
}
.intake-option-active {
  border-color: var(--theme-accent, #e3b04a);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15));
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}
</style>
