<template>
  <!-- Gate on the client-side auth check ourselves, in addition to the
       'superadmin' route middleware. The middleware can't run its check
       during SSR (Firebase Auth only exists client-side), so without this
       guard the page below would briefly render its full content on the
       server before the client redirects an unauthorized visitor away -
       a flash of the real dashboard, not just a layout glitch. -->
  <div v-if="!authReady || !currentUser || profile?.role !== 'superadmin'" class="min-h-screen invite-backdrop flex items-center justify-center text-white/60">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
  </div>

  <!-- Same shell as the couple dashboard (app/layouts/dashboard.vue): sticky
       sidebar, ambient background glow, main content column - just with
       admin-appropriate sections instead of "my wedding" sections. Kept as
       one page with reactive section-switching (not real sub-routes) so it
       can never collide with pages/admin/wedding/* the way admin.vue once
       did as a bare file alongside a same-named folder. -->
  <div v-else class="min-h-screen bg-ink-950 text-white flex flex-col md:flex-row relative">
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-full h-96 bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
      <div class="absolute bottom-0 right-0 w-3/4 h-96 bg-gold-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    </div>

    <aside class="relative z-10 md:w-72 md:min-h-screen md:sticky md:top-0 md:h-screen md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/5 bg-ink-900/40 backdrop-blur-xl p-5 flex flex-col">
      <div class="flex items-center gap-3 px-3 py-4 mb-2">
        <div class="p-2 rounded-lg bg-white/5 border border-white/10">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-gold-300" />
        </div>
        <span class="font-display font-semibold text-xl text-gold-100 tracking-wide">Admin</span>
      </div>
      <p class="px-3 text-xs text-white/40 mb-6 leading-relaxed">Editing what every couple can choose from - not any one couple's own wedding.</p>

      <nav class="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar md:overflow-visible pb-2 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="nav-link group"
          :class="{ 'nav-link-active': section === item.id }"
          @click="section = item.id"
        >
          <UIcon :name="item.icon" class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
          <span class="whitespace-nowrap font-medium">{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-auto pt-6">
        <UButton block variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" class="hover:bg-red-500/10 hover:text-red-400 transition-colors py-2.5 rounded-xl" @click="handleLogout">
          Sign out
        </UButton>
      </div>
    </aside>

    <main class="relative z-10 flex-1 p-4 md:p-8 lg:p-12 w-full mx-auto max-w-6xl overflow-x-hidden">
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
          {{ currentNavItem.label }}
        </h1>
        <p class="text-sm text-white/50 mt-1.5">{{ currentNavItem.description }}</p>
      </div>

      <AdminWeddingsList v-if="section === 'weddings'" />
      <AdminCatalogManager v-else :section="section" />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'superadmin' })

const { logOut } = useAuth()
const { currentUser, profile, authReady } = useAuthState()

type Section = 'weddings' | 'themes' | 'fonts' | 'presets' | 'opening-styles'

const navItems: { id: Section; label: string; icon: string; description: string }[] = [
  { id: 'weddings', label: 'Weddings', icon: 'i-heroicons-users', description: 'All weddings on WeddingCard - view status, plan, and the live link.' },
  { id: 'themes', label: 'Themes', icon: 'i-heroicons-swatch', description: 'Color palettes couples can choose from in the Design Studio.' },
  { id: 'fonts', label: 'Fonts', icon: 'i-heroicons-language', description: 'Fonts available in every font picker across the app.' },
  { id: 'presets', label: 'Text Presets & Languages', icon: 'i-heroicons-pencil-square', description: 'One-click opening text presets, shown as language buttons on the Opening Design page.' },
  { id: 'opening-styles', label: 'Opening Styles', icon: 'i-heroicons-envelope-open', description: 'Choose which opening animations are offered to couples.' }
]

const section = ref<Section>('weddings')
const currentNavItem = computed(() => navItems.find((item) => item.id === section.value)!)

async function handleLogout() {
  await logOut()
  await navigateTo('/login')
}

useSeoMeta({ title: 'Platform Admin \u2014 WeddingCard', robots: 'noindex, nofollow' })
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: white;
  border-color: rgba(255, 255, 255, 0.05);
}

.nav-link-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>