<template>
  <div aria-hidden="true" class="petals-container">
    <div
      v-for="i in count"
      :key="i"
      class="petal"
      :style="{ '--i': i - 1, '--duration': `${11 + (i % 6) * 1.6}s` }"
    >
      <svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 0C47 32 48 64 32 96C17 64 16 32 32 0Z"
          :fill="`rgba(212, 160, 23, ${0.3 + (i % 5) * 0.06})`"
          :stroke="`rgba(243, 221, 170, ${0.55 + (i % 5) * 0.06})`"
          stroke-width="2"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 20 })
</script>
