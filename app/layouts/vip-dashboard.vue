<template>
  <div class="min-h-screen bg-ink-950 text-white relative">
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gold-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    </div>

    <header class="relative z-10 border-b border-white/5 bg-ink-900/40 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg bg-white/5 border border-white/10">
            <UIcon name="i-heroicons-film" class="w-4 h-4 text-gold-300" />
          </div>
          <span class="font-display font-semibold text-lg text-gold-100 tracking-wide">VIP Cinematic</span>
        </div>
        <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" class="hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-xl" @click="handleLogout">
          Sign out
        </UButton>
      </div>
    </header>

    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { logOut } = useAuth()

async function handleLogout() {
  await logOut()
  await navigateTo('/vip/login')
}
</script>
