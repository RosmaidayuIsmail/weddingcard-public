<template>
  <div class="min-h-screen bg-ink-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <UButton to="/admin" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" size="sm" class="mb-6">
        Back to VIP Approvals
      </UButton>
      <VipScenesPanel :override-wedding-id="weddingId" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Superadmin's view into one specific VIP account's own invitation - opened
// from the "Open Editor" button on each row in Platform Admin > VIP
// Approvals (AdminVipApprovals.vue). VIP accounts are entirely separate
// from regular couple weddings, so this is a standalone route rather than
// living under /admin/wedding/[id]/* like the couple-facing admin pages.
definePageMeta({ middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)

useSeoMeta({ title: 'VIP Cinematic (Admin) — WeddingCard', robots: 'noindex, nofollow' })
</script>
