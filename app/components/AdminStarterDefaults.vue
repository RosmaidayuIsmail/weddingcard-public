<template>
    <div class="space-y-6 animate-fade-up">
      <UAlert
        icon="i-heroicons-information-circle"
        color="info"
        variant="soft"
        title="This only affects new weddings"
        description="Changing anything here changes what a couple sees the moment they create their card. It never touches an existing wedding's own content - they can still change every one of these themselves afterward."
      />
  
      <div class="form-card space-y-5">
        <div>
          <label class="field-label">Default intro story</label>
          <UTextarea v-model="form.story" :rows="3" class="w-full" placeholder="With humble hearts, we joyfully invite you to..." />
        </div>
  
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="field-label">Default "View Details" button text</label>
            <UInput v-model="form.btnDetails" size="lg" class="w-full" />
          </div>
          <div>
            <label class="field-label">Default "RSVP" button text</label>
            <UInput v-model="form.btnRsvp" size="lg" class="w-full" />
          </div>
        </div>
  
        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="field-label">Falling petals</label>
            <USelect v-model="petalsEnabledValue" :items="[{ label: 'On', value: 'on' }, { label: 'Off', value: 'off' }]" size="lg" class="w-full" />
          </div>
          <div>
            <label class="field-label">Petal style</label>
            <USelect v-model="form.petalStyle" :items="petalStyleOptions" size="lg" class="w-full" :disabled="!form.enablePetals" />
          </div>
          <div>
            <label class="field-label">Text boldness</label>
            <USelect v-model="form.textWeight" :items="textWeightOptions" size="lg" class="w-full" />
          </div>
        </div>
  
        <div>
          <label class="field-label">Ornament style</label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              v-for="opt in ornamentOptions"
              :key="opt.value"
              type="button"
              class="ornament-card"
              :class="{ 'ornament-card-active': form.ornamentStyle === opt.value }"
              @click="form.ornamentStyle = opt.value"
            >
              <UIcon :name="opt.icon" class="w-6 h-6" />
              <span class="text-xs font-medium">{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </div>
  
      <div class="form-card">
        <div class="flex items-center justify-between mb-1">
          <p class="font-semibold">Starter Wedding Day Flow</p>
          <UButton size="xs" variant="soft" color="neutral" icon="i-heroicons-plus" @click="addFlowItem">Add item</UButton>
        </div>
        <p class="text-xs text-white/40 mb-4">Pre-fills a new couple's Wedding Day Flow page - they can edit, reorder, or delete any of these afterward.</p>
  
        <div v-if="form.flow.length === 0" class="empty-state">
          <p class="text-white/40 text-sm">No starter flow items - new weddings start with an empty flow.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="(item, index) in form.flow" :key="index" class="flow-row">
            <UInput v-model="item.time" placeholder="4:00 PM" size="sm" class="w-28 shrink-0" />
            <UInput v-model="item.title" placeholder="Akad Nikah" size="sm" class="flex-1 min-w-[120px]" />
            <UInput v-model="item.description" placeholder="Short description (optional)" size="sm" class="flex-[2] min-w-[160px]" />
            <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.flow.splice(index, 1)" />
          </div>
        </div>
      </div>
  
      <div class="flex items-center gap-3">
        <UButton color="primary" icon="i-heroicons-check" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="saving" @click="save">
          Save starter defaults
        </UButton>
        <button type="button" class="text-xs text-white/40 hover:text-white/70" @click="resetToBuiltIn">Reset to built-in defaults</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defaultStarterDefaults, type StarterDefaults } from '~/composables/useThemes'
  
  const toast = useToast()
  const { starterDefaults, saveStarterDefaults } = useThemes()
  
  const form = ref<StarterDefaults>(structuredClone(toRaw(starterDefaults.value)))
  
  // If the catalog was still loading when this component mounted, pick up
  // the real saved values once they arrive instead of staying on the
  // placeholder defaults.
  watch(starterDefaults, (val) => {
    form.value = structuredClone(toRaw(val))
  }, { once: true })
  
  const petalsEnabledValue = computed({
    get: () => (form.value.enablePetals ? 'on' : 'off'),
    set: (v: string) => { form.value.enablePetals = v === 'on' }
  })
  
  const petalStyleOptions = [
    { label: 'Petals', value: 'petals' },
    { label: 'Confetti', value: 'confetti' },
    { label: 'Hearts', value: 'hearts' },
    { label: 'Sparkle', value: 'sparkles' }
  ]
  
  const textWeightOptions = [
    { label: 'Light', value: '300' },
    { label: 'Regular', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semibold', value: '600' },
    { label: 'Bold', value: '700' }
  ]
  
  const ornamentOptions = [
    { label: 'None', value: 'none', icon: 'i-heroicons-no-symbol' },
    { label: 'Botanical Corners', value: 'botanical-corners', icon: 'i-heroicons-sparkles' },
    { label: 'Floral Wreath', value: 'floral-wreath', icon: 'i-heroicons-globe-alt' },
    { label: 'Minimal Arch', value: 'minimal-arch', icon: 'i-heroicons-stop' },
    { label: 'Art Deco', value: 'geometric-deco', icon: 'i-heroicons-viewfinder-circle' }
  ]
  
  function addFlowItem() {
    form.value.flow.push({ time: '', title: '', description: '' })
  }
  
  const saving = ref(false)
  async function save() {
    saving.value = true
    try {
      await saveStarterDefaults(structuredClone(toRaw(form.value)))
      toast.add({ title: 'Starter defaults saved', description: 'Weddings created from now on will start here.', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save starter defaults', color: 'error' })
    } finally {
      saving.value = false
    }
  }
  
  function resetToBuiltIn() {
    form.value = structuredClone(defaultStarterDefaults)
  }
  </script>
  
  <style scoped>
  .form-card {
    border-radius: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  
  .field-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0.4rem;
  }
  
  .empty-state {
    padding: 1.5rem 1rem;
    border-radius: 0.85rem;
    border: 1px dashed rgba(255, 255, 255, 0.12);
    text-align: center;
  }
  
  .flow-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .ornament-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.85rem 0.5rem;
    border-radius: 0.85rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
  }
  
  .ornament-card:hover {
    border-color: rgba(255, 255, 255, 0.18);
    color: white;
  }
  
  .ornament-card-active {
    border-color: rgba(212, 160, 23, 0.5);
    background: rgba(212, 160, 23, 0.1);
    color: #f3ddaa;
  }
  </style>