<template>
  <DashboardPhysicalCardsPanel />
</template>

<script setup lang="ts">
// The actual Physical Cards content lives in
// app/components/DashboardPhysicalCardsPanel.vue, shared with the
// superadmin editing view at /admin/wedding/[id]/physical-cards.vue, same
// pattern as DashboardBillingPanel.vue.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
