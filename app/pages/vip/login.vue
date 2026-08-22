<template>
  <div class="min-h-screen invite-backdrop text-white flex items-center justify-center px-6 py-16 relative overflow-hidden">
    <PetalsBackground :count="10" />

    <div class="relative z-10 w-full max-w-sm animate-fade-up">
      <div class="text-center mb-6">
        <NuxtLink to="/vip" class="inline-flex items-center gap-2">
          <UIcon name="i-heroicons-film" class="w-5 h-5 text-gold-300" />
          <span class="font-display font-semibold text-gold-100">VIP Cinematic</span>
        </NuxtLink>
      </div>

      <div class="rounded-2xl border border-gold-400/20 bg-ink-900/60 backdrop-blur p-6 shadow-xl">
        <h1 class="text-xl font-display font-bold text-center text-gold-100 mb-5">VIP member login</h1>

        <UAlert
          v-if="!isConfigured"
          icon="i-heroicons-exclamation-triangle"
          color="warning"
          variant="soft"
          title="Firebase isn't configured yet"
          description="Add your Firebase credentials to .env to enable sign-in."
          class="mb-4"
        />

        <div class="space-y-4">
          <UFormField label="Email">
            <UInput v-model="email" type="email" placeholder="you@example.com" size="lg" class="w-full" @keydown.enter="handleLogin" />
          </UFormField>
          <UFormField label="Password">
            <UInput v-model="password" type="password" placeholder="••••••••" size="lg" class="w-full" @keydown.enter="handleLogin" />
          </UFormField>

          <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>

          <UButton block size="lg" color="primary" class="font-semibold" :loading="loading" @click="handleLogin">
            Log in
          </UButton>
        </div>

        <p class="text-center text-sm text-white/60 mt-6">
          New here? <NuxtLink to="/vip/signup" class="text-gold-300 hover:underline">Request VIP Access</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn, isConfigured, profile, logOut } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const redirectTo = computed(() => {
  const raw = route.query.redirect
  const isSafeInternalPath = typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')
  return isSafeInternalPath ? raw : '/vip/dashboard'
})

async function handleLogin() {
  errorMessage.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  try {
    await signIn(email.value, password.value)
    // This login page is for the VIP tier specifically - a regular couple
    // or admin account signing in here (wrong password manager entry, old
    // bookmark, etc.) gets signed back out with a clear message instead of
    // landing somewhere confusing.
    if (profile.value?.role !== 'vip') {
      await logOut()
      errorMessage.value = 'This login is for VIP accounts only. Use the regular login instead.'
      return
    }
    await navigateTo(redirectTo.value)
  } catch (error) {
    errorMessage.value = 'Could not sign in — check your email and password.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'VIP Login — WeddingCard' })
</script>
