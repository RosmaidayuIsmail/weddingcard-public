<template>
  <div>
    <h3 class="text-center font-display text-xl text-gold-100 mb-4">
      {{ title }}
    </h3>

    <div v-if="wishes.length" class="grid gap-3 sm:grid-cols-2">
      <TransitionGroup name="wish" tag="div" class="contents">
        <div v-for="wish in wishes" :key="wish.id" class="wish-card">
          <p class="text-sm text-white/90 leading-relaxed">&ldquo;{{ wish.doa }}&rdquo;</p>
          <p class="mt-2 text-xs uppercase tracking-wide text-gold-300/80">
            &mdash; {{ wish.name || 'Anonymous' }}
          </p>
        </div>
      </TransitionGroup>
    </div>

    <p v-else class="text-center text-sm text-white/60 italic">
      {{ emptyText }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ weddingId: string; maxCount?: number; title?: string; emptyText?: string }>(), {
  maxCount: 9,
  title: 'Wishes & Blessings',
  emptyText: 'Be the first to leave a wish 💛'
})
const { wishes } = useWishes(props.weddingId, props.maxCount)
</script>

<style scoped>
.wish-card {
  border-radius: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 160, 23, 0.25);
}

.wish-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.wish-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
