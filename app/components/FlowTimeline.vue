<template>
  <ol class="flow-timeline">
    <li v-for="item in items" :key="item.id" class="flow-item">
      <div class="flow-time">{{ item.time }}</div>
      <div class="flow-dot" />
      <div class="flow-body">
        <p class="flow-title">{{ item.title }}</p>
        <p v-if="item.description" class="flow-description">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { FlowItem } from '~/composables/useWeddingTypes'

defineProps<{ items: FlowItem[] }>()
</script>

<style scoped>
.flow-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.flow-item {
  display: grid;
  grid-template-columns: 3.5rem auto 1fr;
  align-items: start;
  gap: 0.5rem;
}

.flow-time {
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-gold-300, #ecc973);
  padding-top: 0.15rem;
}

.flow-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-gold-400, #e3b04a);
  margin-top: 0.35rem;
}

.flow-title {
  font-weight: 600;
  font-size: 0.85rem;
}

.flow-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.1rem;
}
</style>
