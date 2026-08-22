<template>
  <VipScenesPanel :override-wedding-id="weddingId" />
</template>

<script setup lang="ts">
// See app/pages/admin/wedding/[id]/flow.vue for the full explanation: this
// renders the shared VipScenesPanel component (also used by the real
// couple-facing dashboard) instead of a separately maintained copy.
definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
</script>
