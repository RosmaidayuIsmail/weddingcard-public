<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

    <!-- Approval gate - VIP Cinematic is admin-approved, not something a
         new account can just switch on themselves. Every VIP account
         starts 'pending' the moment they sign up (see signUpVip in
         useAuth.ts). -->
    <div v-if="vipApprovalStatus !== 'approved'" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-6 px-4 text-center">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon :name="gateIcon" class="w-12 h-12" :style="{ color: gateIconColor }" />
      </div>
      <div class="max-w-md space-y-2">
        <p class="text-lg text-white">{{ gateTitle }}</p>
        <p class="text-sm text-white/50">{{ gateDescription }}</p>
      </div>
      <UButton
        v-if="vipApprovalStatus === 'rejected'"
        size="lg"
        color="primary"
        class="font-semibold shadow-lg shadow-gold-500/20"
        :loading="requesting"
        @click="handleRequestAgain"
      >
        Request again
      </UButton>
    </div>

    <!-- Approved but no wedding created yet - same create-your-card pattern
         as the regular dashboard's onboarding (dashboard/index.vue). -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading...</p>
    </div>

    <div v-else-if="!wedding" class="max-w-md mx-auto mt-8 animate-fade-up">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/20 mb-4">
          <UIcon name="i-heroicons-film" class="w-8 h-8 text-gold-300" />
        </div>
        <h1 class="text-3xl font-display font-bold text-white mb-2">You're approved!</h1>
        <p class="text-white/60 text-sm">Let's set up your VIP Cinematic invitation.</p>
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
            <span class="text-xs text-gold-300/70">yoursite.com/w/{{ slugPreview || 'your-link' }}/vip</span>
          </template>
        </UFormField>

        <UButton block size="xl" color="primary" class="font-semibold shadow-lg shadow-gold-500/20 mt-4 rounded-full" :loading="creating" @click="handleCreate">
          Create My VIP Invitation
        </UButton>
      </div>
    </div>

    <VipScenesPanel v-else />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

const { profile, requestVipStatus } = useAuth()
const { wedding, loading, createWedding, isSlugAvailable, setPublished } = useMyWedding()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')

const gateIcon = computed(() => (vipApprovalStatus.value === 'rejected' ? 'i-heroicons-x-circle' : 'i-heroicons-clock'))
const gateIconColor = computed(() => (vipApprovalStatus.value === 'rejected' ? 'rgba(248, 113, 113, 0.7)' : '#e3b04a'))
const gateTitle = computed(() =>
  vipApprovalStatus.value === 'rejected' ? 'Your VIP request was not approved' : 'Your VIP request is awaiting approval'
)
const gateDescription = computed(() =>
  vipApprovalStatus.value === 'rejected'
    ? "You can send another request if you'd still like VIP Cinematic for your invitation."
    : "We've received your request - once our team approves it, you'll be able to build your invitation here."
)

const requesting = ref(false)
async function handleRequestAgain() {
  requesting.value = true
  try {
    await requestVipStatus()
    toast.add({ title: 'Request sent', color: 'success' })
  } finally {
    requesting.value = false
  }
}

// --- Create-the-wedding-doc flow, identical pattern to the regular
// dashboard's onboarding (pages/dashboard/index.vue) - just published
// immediately (instead of staying 'draft' until an explicit publish
// button) since the only page anyone is ever pointed to is the VIP guest
// page, which needs the wedding doc to be readable by guests at all.
const brideName = ref('')
const groomName = ref('')
const slugInput = ref('')
const slugError = ref('')
const creating = ref(false)

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
    await setPublished(true)
    toast.add({ title: 'Your VIP invitation is ready!', color: 'success' })
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Something went wrong'
  } finally {
    creating.value = false
  }
}

useSeoMeta({ title: 'VIP Dashboard — WeddingCard', robots: 'noindex, nofollow' })
</script>
