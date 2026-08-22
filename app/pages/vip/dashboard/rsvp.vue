<template>
  <DashboardRsvpEditorPanel />
</template>

<script setup lang="ts">
// Full parity with the classic dashboard's RSVP editor - same shared
// component (app/components/DashboardRsvpEditorPanel.vue), same fields
// (including the Summary/Buttons/Thank-You screens the old VIP-only
// version here was missing), same interactive 4-step preview with
// confetti + a live WishesWall. There's only ever one implementation now,
// same pattern already used by dashboard/rsvp-editor.vue and
// admin/wedding/[id]/rsvp-editor.vue.
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })
useSeoMeta({ title: 'RSVP Text — VIP Cinematic' })
</script>
