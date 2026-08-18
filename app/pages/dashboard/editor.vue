<template>
  <DashboardEditorPanel />
</template>

<script setup lang="ts">
// The actual Design Studio content lives in
// app/components/DashboardEditorPanel.vue, shared with the superadmin
// editing view at /admin/wedding/[id]/editor.vue, so there's only ever one
// implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
