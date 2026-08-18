<template>
  <DashboardFlowPanel />
</template>

<script setup lang="ts">
// The actual Wedding Day Flow content lives in
// app/components/DashboardFlowPanel.vue, shared with the superadmin
// editing view at /admin/wedding/[id]/flow.vue, so there's only ever one
// implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
