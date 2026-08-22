<template>
  <DashboardOpeningPanel />
</template>

<script setup lang="ts">
// The Opening screen (style, background picture, palette, title/greeting/
// button text, and per-element font/size/color/weight overrides) now has
// its own page here, same shared component the classic dashboard's Opening
// Design page uses (app/components/DashboardOpeningPanel.vue). VIP's
// Wedding Details page used to have a smaller, style-only version of this -
// that's been replaced with a hand-off link to here so it's edited in one
// place. VipCinematicInvite.vue already renders every one of these fields
// via the same <EnvelopeIntro> component the classic guest page uses, so a
// VIP couple can now fully translate/restyle their opening screen too.
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })
useSeoMeta({ title: 'Opening Screen — VIP Cinematic' })
</script>
