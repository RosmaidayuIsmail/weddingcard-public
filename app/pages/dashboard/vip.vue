<template>
  <VipScenesPanel />
</template>

<script setup lang="ts">
// The actual VIP Cinematic scene manager lives in
// app/components/VipScenesPanel.vue, shared with the superadmin editing
// view at /admin/wedding/[id]/vip.vue, so there's only ever one
// implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
