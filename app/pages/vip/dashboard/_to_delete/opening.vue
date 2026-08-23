<template>
  <DashboardOpeningPanel vip />
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
//
// The `vip` prop swaps ONLY the right-column live preview: instead of the
// classic phone-bezel + bare EnvelopeIntro + "(Inner card revealed)"
// placeholder (which looks identical to every non-VIP couple's preview),
// it shows the real VipCinematicInvite - tap the envelope and you get the
// actual gate opening onto your own scenes, exactly as a guest would see
// it. Every field being edited is unchanged and still fully shared.
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })
useSeoMeta({ title: 'Opening Screen — VIP Cinematic' })
</script>
