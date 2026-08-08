<template>
  <div>
    <div
      role="timer"
      :aria-label="ariaLabel"
      class="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto"
    >
      <div v-for="unit in units" :key="unit.label" class="countdown-cell">
        <span class="countdown-number">{{ unit.value }}</span>
        <span class="countdown-label">{{ unit.label }}</span>
      </div>
    </div>
    <p v-if="timeLeft.isPast" class="mt-4 text-sm text-gold-200/80 italic">
      The big day is here — see you at the celebration! 🎉
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ target: string | Date }>()

const { timeLeft } = useCountdown(props.target)

const pad = (n: number) => String(n).padStart(2, '0')

const units = computed(() => [
  { label: 'Days', value: pad(timeLeft.value.days) },
  { label: 'Hours', value: pad(timeLeft.value.hours) },
  { label: 'Minutes', value: pad(timeLeft.value.minutes) },
  { label: 'Seconds', value: pad(timeLeft.value.seconds) }
])

const ariaLabel = computed(() =>
  timeLeft.value.isPast
    ? 'The wedding day has arrived'
    : `${timeLeft.value.days} days, ${timeLeft.value.hours} hours, ${timeLeft.value.minutes} minutes and ${timeLeft.value.seconds} seconds until the wedding`
)
</script>

<style scoped>
.countdown-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.25rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 160, 23, 0.35);
  backdrop-filter: blur(6px);
}

.countdown-number {
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 600;
  color: var(--ui-color-primary-300, #ecc973);
  line-height: 1;
}

.countdown-label {
  margin-top: 0.35rem;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}
</style>
