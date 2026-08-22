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
          <h1 class="text-3xl font-display font-bold text-white">Your Scenes</h1>
          <p class="text-sm text-white/50 mt-1">Your own story, in whatever order you add it. Each one plays as its own stop in the fly-through.</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <UButton size="lg" variant="soft" color="neutral" icon="i-heroicons-play-circle" :loading="previewing" @click="previewLive">
            Preview Live
          </UButton>
          <UButton size="lg" color="primary" class="font-semibold shadow-xl shadow-gold-500/20" :loading="saving" @click="save">
            Save changes
          </UButton>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 xl:gap-10">

        <!-- Left: editing -->
        <div class="flex-1 min-w-0 space-y-6">

          <div class="form-panel">
            <h2 class="text-base font-semibold text-white mb-4 border-b border-gray-700 pb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-plus-circle" style="color: #e3b04a;" class="w-5 h-5" />
              Add a Scene
            </h2>
            <div class="space-y-4">
              <UInput v-model="draft.title" placeholder="Scene title, e.g. With Humble Hearts" size="lg" icon="i-heroicons-bookmark" class="w-full" />
              <UTextarea v-model="draft.body" placeholder="Scene text - your own words, as long or short as you like" :rows="3" size="lg" class="w-full" />
              <div class="flex items-center gap-4">
                <div v-if="draft.imageUrl" class="w-16 h-16 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md">
                  <img :src="draft.imageUrl" class="w-full h-full object-cover" />
                </div>
                <input ref="draftImageInput" type="file" accept="image/*" class="hidden" @change="(e) => handleImageSelect(e, 'draft')">
                <div class="flex flex-wrap gap-2">
                  <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-photo" :loading="uploadingFor === 'draft'" :disabled="!cloudinaryConfigured" @click="draftImageInput?.click()">
                    {{ draft.imageUrl ? 'Change Image' : 'Add Image (optional)' }}
                  </UButton>
                  <UButton v-if="draft.imageUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="draft.imageUrl = ''" />
                </div>
              </div>

              <div class="camera-controls">
                <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-video-camera" class="w-3.5 h-3.5" /> Camera for this scene (optional)
                </p>
                <div class="grid grid-cols-3 gap-3">
                  <UFormField label="Position">
                    <USelect v-model="draft.position" :items="positionOptions" size="sm" class="w-full" />
                  </UFormField>
                  <UFormField label="Zoom (%)">
                    <UInput v-model.number="draft.zoomPercent" type="number" min="90" max="140" step="2" placeholder="Auto" size="sm" class="w-full" />
                  </UFormField>
                  <UFormField label="Hold (sec)">
                    <UInput v-model.number="draft.holdSeconds" type="number" min="1.5" max="10" step="0.5" placeholder="Auto" size="sm" class="w-full" />
                  </UFormField>
                </div>
              </div>

              <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-md" @click="addScene">
                Add Scene
              </UButton>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3 ml-1">Your Scenes</h3>
            <div v-if="scenes.length === 0" class="text-center text-gray-500 py-12 bg-[#111827] border border-dashed border-gray-700 rounded-2xl">
              <UIcon name="i-heroicons-film" class="w-10 h-10 mx-auto mb-2 opacity-50" />
              No scenes yet - add your first one above. The cover and RSVP still show automatically either way.
            </div>
            <div v-else class="space-y-3">
              <TransitionGroup name="list">
                <div v-for="(scene, index) in scenes" :key="scene.id" class="scene-row group">
                  <div class="flex flex-col gap-1 shrink-0 bg-gray-800/50 rounded-lg p-1">
                    <UButton size="2xs" variant="ghost" color="gray" icon="i-heroicons-chevron-up" :disabled="index === 0" class="hover:text-gold-400" @click="move(index, -1)" />
                    <UButton size="2xs" variant="ghost" color="gray" icon="i-heroicons-chevron-down" :disabled="index === scenes.length - 1" class="hover:text-gold-400" @click="move(index, 1)" />
                  </div>
                  <div v-if="scene.imageUrl" class="w-14 h-14 rounded-lg overflow-hidden border border-gray-700 shrink-0">
                    <img :src="scene.imageUrl" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex flex-col flex-1 gap-2 min-w-0">
                    <UInput v-model="scene.title" size="sm" placeholder="Scene title" class="w-full font-medium" />
                    <UTextarea v-model="scene.body" size="xs" placeholder="Scene text..." :rows="2" class="w-full opacity-80" />
                    <div class="flex flex-wrap gap-2">
                      <input :ref="el => setSceneImageInput(scene.id, el)" type="file" accept="image/*" class="hidden" @change="(e) => handleImageSelect(e, scene.id)">
                      <UButton size="2xs" variant="soft" color="gray" icon="i-heroicons-photo" :loading="uploadingFor === scene.id" :disabled="!cloudinaryConfigured" @click="sceneImageInputs[scene.id]?.click()">
                        {{ scene.imageUrl ? 'Change image' : 'Add image' }}
                      </UButton>
                      <UButton v-if="scene.imageUrl" size="2xs" variant="ghost" color="error" @click="scene.imageUrl = ''">Remove image</UButton>
                    </div>
                    <div class="camera-controls-inline">
                      <UFormField label="Position" size="xs">
                        <USelect v-model="scene.position" :items="positionOptions" size="xs" class="w-full" />
                      </UFormField>
                      <UFormField label="Zoom %" size="xs">
                        <UInput v-model.number="scene.zoomPercent" type="number" min="90" max="140" step="2" placeholder="Auto" size="xs" class="w-full" />
                      </UFormField>
                      <UFormField label="Hold sec" size="xs">
                        <UInput v-model.number="scene.holdSeconds" type="number" min="1.5" max="10" step="0.5" placeholder="Auto" size="xs" class="w-full" />
                      </UFormField>
                    </div>
                  </div>
                  <UButton size="sm" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" @click="removeScene(index)" />
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Right: content check -->
        <div class="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2 w-full mb-2 px-1">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Content Check (not animated)
          </p>
          <p class="text-xs text-white/40 mb-4 px-1 leading-relaxed">
            Stacks your text/photos so you can proofread. Not the real animation -
            use <b class="text-gold-300/80">Preview Live</b> above for that.
          </p>
          <div class="phone-bezel w-full max-w-[340px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <div class="phone-screen hide-scrollbar relative flex flex-col p-5" :style="styleVars">
              <div class="absolute inset-0 z-0" :style="{ background: 'linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))' }"></div>
              <div class="relative z-10 space-y-4 pb-8">
                <div class="text-center pt-4 pb-2">
                  <p class="text-[0.6rem] tracking-[0.3em] uppercase mb-2" :style="{ color: 'var(--theme-accent)' }">You're Invited</p>
                  <h2 class="text-2xl italic" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">
                    {{ wedding?.content.brideName }} &amp; {{ wedding?.content.groomName }}
                  </h2>
                </div>
                <div v-if="scenes.length === 0" class="text-center text-sm opacity-50 mt-6 italic" :style="{ color: 'var(--theme-ink)' }">
                  Your scenes will appear here...
                </div>
                <div v-for="scene in scenes" :key="scene.id" class="preview-card">
                  <img v-if="scene.imageUrl" :src="scene.imageUrl" class="w-full h-28 object-cover rounded-t-xl" />
                  <div class="p-3">
                    <h3 v-if="scene.title" class="text-sm font-semibold mb-1" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">{{ scene.title }}</h3>
                    <p v-if="scene.body" class="text-xs opacity-70 leading-relaxed" :style="{ color: 'var(--theme-ink)' }">{{ scene.body }}</p>
                    <p class="camera-badge"><UIcon name="i-heroicons-video-camera" class="w-3 h-3" /> {{ cameraSummary(scene) }}</p>
                  </div>
                </div>
                <div class="text-center pt-2 pb-4">
                  <p class="text-[0.6rem] tracking-[0.3em] uppercase mb-2" :style="{ color: 'var(--theme-accent)' }">Join Our Celebration</p>
                  <span class="inline-block text-xs px-4 py-2 rounded-full" :style="{ background: 'var(--theme-accent)', color: '#150a20' }">RSVP Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'vip-dashboard', middleware: 'vip' })

import type { VipScene } from '~/composables/useWeddingTypes'

const { profile } = useAuth()
const { wedding, loading, saving, updateVip } = useMyWedding()
const { themeStyleVars } = useThemes()
const { isConfigured: cloudinaryConfigured, uploadImage } = useCloudinary()
const toast = useToast()

const vipApprovalStatus = computed(() => profile.value?.vipApprovalStatus || 'pending')

const scenes = ref<VipScene[]>([])
const draft = reactive<{ title: string; body: string; imageUrl: string; position: VipScene['position']; zoomPercent: number | ''; holdSeconds: number | '' }>({
  title: '', body: '', imageUrl: '', position: 'auto', zoomPercent: '', holdSeconds: ''
})
const savedAt = ref<number | null>(null)
const previewing = ref(false)

const positionOptions = [
  { label: 'Auto (alternates)', value: 'auto' },
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' }
]

function cameraSummary(scene: VipScene) {
  const pos = scene.position && scene.position !== 'auto' ? scene.position : 'auto side'
  const zoom = scene.zoomPercent ? `${scene.zoomPercent}% zoom` : 'auto zoom'
  const hold = scene.holdSeconds ? `${scene.holdSeconds}s` : 'auto timing'
  return `${pos} · ${zoom} · ${hold}`
}

const draftImageInput = ref<HTMLInputElement | null>(null)
const sceneImageInputs: Record<string, HTMLInputElement | null> = {}
function setSceneImageInput(id: string, el: Element | null) {
  sceneImageInputs[id] = el as HTMLInputElement | null
}
const uploadingFor = ref<string | null>(null)

const styleVars = computed(() => {
  if (!wedding.value) return {}
  const c = wedding.value.content
  return themeStyleVars(wedding.value.themeId, { bgFrom: c.customBgFrom, bgTo: c.customBgTo, accent: c.customAccent }, c.customFontFamily || c.fontFamily)
})

let initialized = false
watch(wedding, (value) => {
  if (!value || initialized) return
  initialized = true
  scenes.value = [...(value.vipScenes || [])]
}, { immediate: true })

function addScene() {
  if (!draft.title.trim() && !draft.body.trim()) {
    toast.add({ title: 'Add a title or some text first', color: 'warning' })
    return
  }
  scenes.value.push({
    id: `${Date.now()}`,
    title: draft.title.trim(),
    body: draft.body.trim(),
    imageUrl: draft.imageUrl,
    position: draft.position || 'auto',
    zoomPercent: draft.zoomPercent === '' ? undefined : Number(draft.zoomPercent),
    holdSeconds: draft.holdSeconds === '' ? undefined : Number(draft.holdSeconds)
  })
  draft.title = ''
  draft.body = ''
  draft.imageUrl = ''
  draft.position = 'auto'
  draft.zoomPercent = ''
  draft.holdSeconds = ''
}

function removeScene(index: number) {
  scenes.value.splice(index, 1)
}

function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= scenes.value.length) return
  const copy = [...scenes.value]
  ;[copy[index], copy[target]] = [copy[target]!, copy[index]!]
  scenes.value = copy
}

async function handleImageSelect(event: Event, target: string) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  uploadingFor.value = target
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/vip`)
    if (target === 'draft') {
      draft.imageUrl = url
    } else {
      const scene = scenes.value.find((s) => s.id === target)
      if (scene) scene.imageUrl = url
    }
    toast.add({ title: 'Image uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    uploadingFor.value = null
  }
  ;(event.target as HTMLInputElement).value = ''
}

function sanitizedScenes(): VipScene[] {
  return scenes.value.map((scene) => ({
    ...scene,
    position: scene.position || 'auto',
    zoomPercent: scene.zoomPercent === ('' as unknown as number) || !scene.zoomPercent ? undefined : Number(scene.zoomPercent),
    holdSeconds: scene.holdSeconds === ('' as unknown as number) || !scene.holdSeconds ? undefined : Number(scene.holdSeconds)
  }))
}

// Only this page's own slice (scenes) is saved here - the on/off switch
// lives on Preview & Publish, so it's read live off `wedding` and passed
// through unchanged rather than risking clobbering it with a stale value.
async function save() {
  scenes.value = sanitizedScenes()
  await updateVip(!!wedding.value?.vipEnabled, scenes.value)
  savedAt.value = Date.now()
  toast.add({ title: 'Scenes saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

async function previewLive() {
  if (!wedding.value) return
  previewing.value = true
  try {
    await save()
    window.open(`/w/${wedding.value.slug}/vip`, '_blank')
  } finally {
    previewing.value = false
  }
}

useSeoMeta({ title: 'Your Scenes — VIP Cinematic' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}
.camera-controls {
  border-radius: 0.85rem;
  padding: 0.85rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed #374151;
}
.camera-controls-inline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.65rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed #374151;
}
.camera-badge {
  margin-top: 0.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.62rem;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  opacity: 0.55;
}
.scene-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: #1F2937;
  border: 1px solid #374151;
  transition: all 0.3s ease;
}
.scene-row:hover {
  background: #374151;
  border-color: rgba(212, 160, 23, 0.3);
}
.preview-card {
  border-radius: 0.75rem;
  overflow: hidden;
  background: rgba(20, 10, 24, .45);
  border: 1px solid rgba(227, 176, 74, .25);
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
  overflow-y: auto;
  overflow-x: hidden;
  background: #111;
}
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
