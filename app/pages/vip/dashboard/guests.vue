<template>
  <DashboardGuestsPanel />
</template>

<script setup lang="ts">
// Guest List was entirely missing from VIP - guests could RSVP but the
// couple had no way to see, search, or manage them. Reusing the exact
// same shared component the classic dashboard and superadmin editing
// view use (app/components/DashboardGuestsPanel.vue) instead of building
// a second implementation - it's already fully self-contained (own
// Firestore listener via useGuests(), own add/edit/export/WhatsApp
// actions) and already styled for this same dark/gold layout.
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })
useSeoMeta({ title: 'Guest List — VIP Cinematic' })
</script>
