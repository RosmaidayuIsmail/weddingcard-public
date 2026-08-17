<template>
  <DashboardEditor :override-wedding-id="weddingId" />
</template>

<script setup lang="ts">
// This used to be a hand-built, separate copy of the couple-facing Design
// Studio editor - which meant it slowly drifted out of sync with the real
// page as that one kept gaining new features (new theme options, ornament
// styles, and so on), until a superadmin editing a wedding here saw a
// visibly older/plainer screen than a couple sees on their own dashboard.
//
// Fix: render the exact same page component couples use
// (app/pages/dashboard/editor.vue), just pointed at a specific wedding ID
// instead of "whichever wedding the signed-in account owns". There is now
// only one Design Studio implementation, so this can never drift again.
import DashboardEditor from '~/pages/dashboard/editor.vue'

definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
</script>
