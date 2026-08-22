<template>
  <div class="min-h-screen invite-backdrop text-white selection:bg-gold-400 selection:text-ink-950">
    <PetalsBackground :count="14" />

    <header class="fixed top-0 inset-x-0 z-50 py-5">
      <div class="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-gold-400/50 transition-colors">
            <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gold-300" />
          </div>
          <span class="font-display font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gold-100 to-gold-400">WeddingCard</span>
        </NuxtLink>
        <UButton to="/vip/login" variant="ghost" color="neutral" class="text-white/80 hover:text-white font-medium">VIP member? Log in</UButton>
      </div>
    </header>

    <section class="relative z-10 pt-40 pb-24 px-6 max-w-3xl mx-auto text-center flex flex-col items-center">
      <div class="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-200 text-xs font-medium tracking-wider uppercase mb-8 backdrop-blur-sm">
        <UIcon name="i-heroicons-film" class="w-3.5 h-3.5" />
        A separate, approved-access tier
      </div>

      <h1 class="animate-fade-up delay-1 font-display text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
        VIP <span class="italic font-light text-gold-200 drop-shadow-md">Cinematic</span>
      </h1>

      <p class="animate-fade-up delay-2 text-lg sm:text-xl text-white/60 max-w-xl font-light leading-relaxed mb-10">
        Your own invitation with an automatic camera that pans and zooms across your story on its own - no scrolling, no tapping. This is a separate, dedicated experience from the regular WeddingCard, opened by request and approved by our team.
      </p>

      <div class="animate-fade-up delay-3 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <UButton to="/vip/signup" size="xl" color="primary" class="w-full sm:w-auto font-semibold text-base px-8 py-4 rounded-full shadow-[0_0_40px_-10px_rgba(212,160,23,0.5)] hover:scale-105 transition-transform duration-300">
          Request VIP Access
        </UButton>
        <UButton to="/vip/login" size="xl" variant="soft" color="neutral" class="w-full sm:w-auto font-medium text-base px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
          Log In
        </UButton>
      </div>

      <p class="animate-fade-up delay-3 text-sm text-white/40 mt-10">
        Looking for the regular WeddingCard? <NuxtLink to="/" class="text-gold-300 hover:underline">Go back home</NuxtLink>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'VIP Cinematic — WeddingCard',
  description: 'A separate, approved-access invitation tier with an automatic camera fly-through - request access and our team will review it.'
})
</script>
