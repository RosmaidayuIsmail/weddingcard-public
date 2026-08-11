<template>
    <div class="space-y-4">
      <div class="flex bg-gray-900 border border-gray-700 rounded-lg p-1">
        <button
          type="button"
          class="flex-1 py-2 text-xs font-medium rounded-md transition-all"
          :class="!useCustomFont ? 'bg-gray-700 text-gold-300' : 'text-gray-400 hover:text-white'"
          @click="useCustomFont = false"
        >
          Curated Font
        </button>
        <button
          type="button"
          class="flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1"
          :class="useCustomFont ? 'bg-gray-700 text-gold-300' : 'text-gray-400 hover:text-white'"
          @click="useCustomFont = true"
        >
          <UIcon name="i-heroicons-link" class="w-3 h-3" /> Custom Google Font
        </button>
      </div>
  
      <USelect v-show="!useCustomFont" v-model="fontValue" :items="fontSelectItems" size="md" class="w-full" />
  
      <UInput v-show="useCustomFont" v-model="fontUrlValue" placeholder="Paste Google Fonts URL..." size="md" class="w-full">
        <template #leading><UIcon name="i-heroicons-link" class="w-3.5 h-3.5" style="color: #e3b04a;" /></template>
      </UInput>
  
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-400 mb-2">Color <span class="text-gray-600">(blank = default)</span></p>
          <div class="flex items-center gap-2">
            <input v-model="colorValue" type="color" class="w-9 h-9 rounded-lg border border-gray-700 bg-transparent cursor-pointer shrink-0">
            <UInput v-model="colorValue" placeholder="Default" size="md" class="flex-1" />
            <UButton v-if="colorValue" size="xs" variant="ghost" color="neutral" icon="i-heroicons-x-mark" @click="colorValue = ''" />
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-2">Size</p>
          <div class="flex items-center gap-2 h-9">
            <input v-model.number="sizeValue" type="range" min="50" max="200" step="5" class="flex-1 accent-[#e3b04a]">
            <span class="text-xs text-gray-400 w-9 text-right shrink-0">{{ sizeValue }}%</span>
          </div>
        </div>
      </div>
  
      <div>
        <p class="text-xs text-gray-400 mb-2">Boldness</p>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="opt in weightOptions"
            :key="opt.value"
            type="button"
            class="p-2 rounded-lg border text-xs transition-colors"
            :style="{ fontWeight: opt.value }"
            :class="weightValue === opt.value ? 'border-[#e3b04a] bg-[#e3b04a]/10 text-gold-200' : 'border-gray-700 text-gray-400 hover:border-gray-600'"
            @click="weightValue = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // A generic "style this text" panel. `prefix` picks which set of fields on
  // `form` it reads/writes, e.g. prefix="openingTitle" reads/writes
  // form.openingTitleFont, form.openingTitleFontUrl, form.openingTitleColor,
  // form.openingTitleSize, and form.openingTitleWeight. Used three times in
  // Opening Design (Main Title, Guest Greeting, Action Button Text) so the
  // same UI and Google Font auto-extraction logic isn't duplicated per field.
  const props = defineProps<{
    prefix: string
    form: Record<string, any>
    fontSelectItems: Array<{ label: string; value: string }>
  }>()
  
  const weightOptions = [
    { label: 'Light', value: '300' },
    { label: 'Regular', value: '400' },
    { label: 'Medium', value: '600' },
    { label: 'Bold', value: '700' }
  ]
  
  const useCustomFont = ref(!!props.form[`${props.prefix}FontUrl`])
  
  const fontValue = computed({
    get: () => props.form[`${props.prefix}Font`] || '',
    set: (val: string) => { props.form[`${props.prefix}Font`] = val }
  })
  
  const fontUrlValue = computed({
    get: () => props.form[`${props.prefix}FontUrl`] || '',
    set: (val: string) => { props.form[`${props.prefix}FontUrl`] = val }
  })
  
  const colorValue = computed({
    get: () => props.form[`${props.prefix}Color`] || '',
    set: (val: string) => { props.form[`${props.prefix}Color`] = val }
  })
  
  const sizeValue = computed({
    get: () => props.form[`${props.prefix}Size`] ?? 100,
    set: (val: number) => { props.form[`${props.prefix}Size`] = val }
  })
  
  const weightValue = computed({
    get: () => props.form[`${props.prefix}Weight`] || '',
    set: (val: string) => { props.form[`${props.prefix}Weight`] = val }
  })
  
  // Same Google Font URL auto-extraction pattern used elsewhere in the editor
  // (main Typography section, Monogram) - paste a specimen page link, get the
  // correct stylesheet URL and CSS family name filled in automatically.
  watch(fontUrlValue, (newVal) => {
    if (newVal && newVal.includes('fonts.google.com/specimen/')) {
      try {
        const urlObj = new URL(newVal)
        const pathSegments = urlObj.pathname.split('/').filter(Boolean)
        const rawFontName = pathSegments[pathSegments.length - 1]
        if (rawFontName) {
          const cleanFontNameEncoded = rawFontName.split('?')[0]
          fontUrlValue.value = `https://fonts.googleapis.com/css2?family=${cleanFontNameEncoded}&display=swap`
          const familyKey = `${props.prefix}FontFamily`
          if (!props.form[familyKey]) {
            const fontNameDecoded = decodeURIComponent(cleanFontNameEncoded).replace(/\+/g, ' ')
            props.form[familyKey] = `'${fontNameDecoded}', sans-serif`
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  })
  </script>