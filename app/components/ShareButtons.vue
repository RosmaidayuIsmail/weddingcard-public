<template>
  <div class="flex items-center justify-center gap-3">
    <UButton
      icon="i-heroicons-chat-bubble-left-right"
      color="success"
      variant="soft"
      :to="whatsappUrl"
      target="_blank"
      external
    >
      Share on WhatsApp
    </UButton>

    <UButton
      icon="i-heroicons-link"
      color="neutral"
      variant="soft"
      @click="copyLink"
    >
      {{ copied ? 'Copied!' : 'Copy Link' }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { buildShareMessage } from '~/composables/useWeddingTypes'

const props = defineProps<{ brideName: string; groomName: string; dateLabel?: string; shareMessage?: string }>()
const toast = useToast()
const copied = ref(false)

const currentUrl = computed(() => {
  if (import.meta.client) return window.location.href
  return ''
})

const DEFAULT_TEMPLATE = "You're invited to {brideName} & {groomName}'s wedding! {date}. RSVP here: {link}"

const whatsappUrl = computed(() => {
  const text = buildShareMessage(props.shareMessage || DEFAULT_TEMPLATE, {
    brideName: props.brideName,
    groomName: props.groomName,
    date: props.dateLabel,
    link: currentUrl.value
  })
  return `https://wa.me/?text=${encodeURIComponent(text)}`
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    copied.value = true
    toast.add({ title: 'Link copied', description: 'Share it with your guests.', color: 'success' })
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}
</script>