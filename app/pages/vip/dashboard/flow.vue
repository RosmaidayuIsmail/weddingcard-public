<template>
  <div class="pb-12">

    <div v-if="vipApprovalStatus !== 'approved' || loading" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center min-h-[60vh] text-white/60 space-y-4 text-center px-4">
      <UIcon name="i-heroicons-heart" class="w-10 h-10" style="color: rgba(227, 176, 74, 0.5);" />
      <p class="text-white">Set up your wedding details first.</p>
      <UButton to="/vip/dashboard" color="primary">Go to Wedding Details</UButton>
    </div>

    <div v-else class="animate-fade-up">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-display font-bold text-white">Event Flow</h1>
          <p class="text-sm text-white/50 mt-1">Fills the Flow scene in your fly-through.</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <UButton size="lg" color="primary" class="font-semibold shadow-xl shadow-gold-500/20" :loading="saving" @click="save">
            Save changes
          </UButton>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 xl:gap-10">

        <!-- Left: editing -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Ready-Made Templates Panel -->
          <div class="form-panel">
            <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <UIcon name="i-heroicons-bolt" style="color: #e3b04a;" class="w-5 h-5" />
              Quick Start Presets
            </h2>
            <p class="text-xs text-gray-400 mb-4">Choose a ready-made template to auto-fill your timeline, then edit it below.</p>
            <div class="flex flex-wrap gap-3">
              <UButton
                v-for="preset in allDayFlowPresets"
                :key="preset.id"
                variant="soft"
                color="gray"
                class="hover:bg-gray-800 border border-gray-700 transition-colors"
                @click="applyPreset(preset.items)"
              >
                {{ preset.label }}
              </UButton>
            </div>
          </div>

          <!-- Add an Item Panel -->
          <div class="form-panel">
            <h2 class="text-base font-semibold text-white mb-4 border-b border-gray-700 pb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-plus-circle" style="color: #e3b04a;" class="w-5 h-5" />
              Add Custom Event
            </h2>

            <div class="grid sm:grid-cols-[140px_1fr] gap-4 mb-4">
              <UInput v-model="draft.time" placeholder="e.g. 10:00 AM" size="lg" icon="i-heroicons-clock" />
              <UInput v-model="draft.title" placeholder="e.g. Akad Nikah Ceremony" size="lg" icon="i-heroicons-bookmark" />
            </div>
            <UInput v-model="draft.description" placeholder="Optional short description (e.g. Please arrive early for seating)" size="lg" class="w-full mb-4" />
            <UInput v-model="draft.location" placeholder="Optional venue / hall name (e.g. Dewan Utama)" size="lg" icon="i-heroicons-map-pin" class="w-full mb-4" />
            <div class="flex items-center justify-between gap-4">
              <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                <UCheckbox v-model="draft.highlight" />
                Mark as key moment
              </label>
              <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-md" @click="addItem">
                Add to Timeline
              </UButton>
            </div>
          </div>

          <!-- Current Flow List -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3 ml-1">Your Timeline</h3>
            <div v-if="items.length === 0" class="text-center text-gray-500 py-12 bg-[#111827] border border-dashed border-gray-700 rounded-2xl">
              <UIcon name="i-heroicons-queue-list" class="w-10 h-10 mx-auto mb-2 opacity-50" />
              No items yet — add your first event above or use a preset.
            </div>

            <div v-else class="space-y-3">
              <TransitionGroup name="list">
                <div v-for="(item, index) in items" :key="item.id" class="flow-row group" :class="{ 'flow-row-highlight': item.highlight }">
                  <div class="flex flex-col gap-1 shrink-0 bg-gray-800/50 rounded-lg p-1">
                    <UButton size="2xs" variant="ghost" color="gray" icon="i-heroicons-chevron-up" :disabled="index === 0" class="hover:text-gold-400" @click="move(index, -1)" />
                    <UButton size="2xs" variant="ghost" color="gray" icon="i-heroicons-chevron-down" :disabled="index === items.length - 1" class="hover:text-gold-400" @click="move(index, 1)" />
                  </div>

                  <!-- Editable Inline Fields -->
                  <div class="flex flex-col sm:flex-row flex-1 gap-4 items-start sm:items-center">
                    <UInput v-model="item.time" size="sm" class="w-28 shrink-0 font-medium" />
                    <div class="flex-1 w-full space-y-2">
                      <UInput v-model="item.title" size="sm" class="w-full font-medium" />
                      <UInput v-model="item.description" size="xs" placeholder="Description..." class="w-full opacity-80" />
                      <UInput v-model="item.location" size="xs" placeholder="Venue / hall (optional)..." icon="i-heroicons-map-pin" class="w-full opacity-80" />
                    </div>
                  </div>

                  <UButton
                    size="sm"
                    variant="ghost"
                    :color="item.highlight ? 'warning' : 'gray'"
                    icon="i-heroicons-star"
                    :title="item.highlight ? 'Unmark key moment' : 'Mark as key moment'"
                    class="shrink-0"
                    :class="item.highlight ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'"
                    @click="item.highlight = !item.highlight"
                  />
                  <UButton size="sm" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" @click="removeItem(index)" />
                </div>
              </TransitionGroup>
            </div>
          </div>

        </div>

        <!-- Right: live preview - the actual VipCinematicInvite component
             (see its `embedded` prop), fed the couple's real wedding with
             just `flow` swapped for whatever's in the editor on the left
             right now, so edits show up before you even hit Save. Same
             pattern as Your Scenes / Wedding Details - never a second
             reimplementation of the guest view. -->
        <div class="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2 w-full mb-2 px-1">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
          </p>
          <p class="text-xs text-white/40 mb-4 px-1 leading-relaxed">
            The real fly-through, exactly as a guest sees it - tap the phone to open it.
            Reflects your timeline below as you edit, even before you save.
          </p>
          <div class="phone-bezel w-full max-w-[340px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <div class="phone-screen hide-scrollbar relative">
              <VipCinematicInvite
                v-if="previewWedding"
                :key="wedding?.id"
                :wedding="previewWedding"
                :rsvp-link="rsvpLink"
                embedded
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

import type { FlowItem } from '~/composables/useWeddingTypes'

const { profile } = useAuth()
const { wedding, loading, saving, updateFlow } = useMyWedding()
const { allDayFlowPresets } = useThemes()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')

const items = ref<FlowItem[]>([])
const draft = reactive({ time: '', title: '', description: '', location: '', highlight: false })
const savedAt = ref<number | null>(null)

// Feeds the Live Preview panel: the couple's real wedding doc, with only
// `flow` swapped for whatever's in the left-hand editor right now (not
// necessarily saved yet) - so the preview updates as they type, same
// pattern as scenes.vue's previewWedding.
const previewWedding = computed(() => {
  if (!wedding.value) return null
  return { ...wedding.value, flow: items.value }
})
const rsvpLink = computed(() => (wedding.value ? `/w/${wedding.value.slug}/rsvp` : ''))

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  items.value = [...(value.flow || [])]
}, { immediate: true })

function applyPreset(presetItems: Omit<FlowItem, 'id'>[]) {
  if (items.value.length > 0) {
    if (!confirm('This will replace your current timeline events. Do you want to continue?')) return
  }
  items.value = presetItems.map((item, index) => ({
    id: `${Date.now()}-${index}`,
    ...item
  }))
  toast.add({ title: 'Template applied', color: 'success' })
}

function addItem() {
  if (!draft.title.trim() || !draft.time.trim()) {
    toast.add({ title: 'Please add both a time and a title', color: 'warning' })
    return
  }
  items.value.push({
    id: `${Date.now()}`,
    time: draft.time.trim(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    highlight: draft.highlight
  })
  draft.time = ''
  draft.title = ''
  draft.description = ''
  draft.location = ''
  draft.highlight = false
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.value.length) return
  const copy = [...items.value]
  ;[copy[index], copy[target]] = [copy[target]!, copy[index]!]
  items.value = copy
}

async function save() {
  await updateFlow(items.value)
  savedAt.value = Date.now()
  toast.add({ title: 'Event flow saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'Event Flow — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}
.flow-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: #1F2937;
  border: 1px solid #374151;
  transition: all 0.3s ease;
}
.flow-row:hover {
  background: #374151;
  border-color: rgba(212, 160, 23, 0.3);
}
.flow-row-highlight {
  border-color: rgba(212, 160, 23, 0.4);
  box-shadow: inset 0 0 0 1px rgba(212, 160, 23, 0.15);
}
.phone-bezel {
  position: relative;
  height: 660px;
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: translateZ(0);
}
.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
}
.phone-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #111;
}
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
