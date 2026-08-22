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
        <h1 class="text-xl font-display font-bold text-center text-gold-100 mb-1">Request VIP Access</h1>
        <p class="text-center text-sm text-white/60 mb-5">Create your account - our team will review your request before you can start building.</p>

        <UAlert
          v-if="!isConfigured"
          icon="i-heroicons-exclamation-triangle"
          color="warning"
          variant="soft"
          title="Firebase isn't configured yet"
          description="Add your Firebase credentials to .env to enable sign-up."
          class="mb-4"
        />

        <div class="space-y-4">
          <UFormField label="Your name(s)">
            <UInput v-model="displayName" placeholder="e.g. Aisyah & Danial" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Email">
            <UInput v-model="email" type="email" placeholder="you@example.com" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Password">
            <UInput v-model="password" type="password" placeholder="At least 6 characters" size="lg" class="w-full" @keydown.enter="handleSignup" />
          </UFormField>

          <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>

          <UButton block size="lg" color="primary" class="font-semibold" :loading="loading" @click="handleSignup">
            Request Access
          </UButton>
        </div>

        <p class="text-center text-sm text-white/60 mt-6">
          Already a VIP member? <NuxtLink to="/vip/login" class="text-gold-300 hover:underline">Log in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signUpVip, isConfigured } = useAuth()

const displayName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSignup() {
  errorMessage.value = ''

  if (!email.value || password.value.length < 6) {
    errorMessage.value = 'Please enter a valid email and a password with at least 6 characters.'
    return
  }

  loading.value = true
  try {
    await signUpVip(email.value, password.value, displayName.value)
    await navigateTo('/vip/dashboard')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ''
    errorMessage.value = message.includes('email-already-in-use')
      ? 'An account already exists with that email.'
      : 'Could not create your account. Please try again.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Request VIP Access — WeddingCard' })
</script>
