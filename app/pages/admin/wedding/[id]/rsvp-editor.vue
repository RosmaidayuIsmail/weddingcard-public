<template>
  <DashboardRsvpEditor :override-wedding-id="weddingId" />
</template>

<script setup lang="ts">
// See app/pages/admin/wedding/[id]/editor.vue for why this renders the real
// couple-facing page instead of a separately maintained copy: it stops the
// two from drifting apart, permanently.
import DashboardRsvpEditor from '~/pages/dashboard/rsvp-editor.vue'

definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
</script>
