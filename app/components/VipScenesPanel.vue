<template>
  <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">

    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" style="color: #e3b04a;" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading VIP Cinematic...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-film" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <!-- Gated tier: VIP Cinematic is admin-approved, not something every
         couple can just switch on themselves - see VipStatus. Everything
         below this block (the scene manager) only renders once approved. -->
    <div v-else-if="vipStatus !== 'approved'" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6 px-4 text-center">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon :name="gateIcon" class="w-12 h-12" :style="{ color: gateIconColor }" />
      </div>
      <div class="max-w-md space-y-2">
        <p class="text-lg text-white">{{ gateTitle }}</p>
        <p class="text-sm text-white/50">{{ gateDescription }}</p>
      </div>
      <UButton
        v-if="vipStatus === 'none' || vipStatus === 'rejected'"
        size="lg"
        color="primary"
        class="font-semibold shadow-lg shadow-gold-500/20"
        :loading="saving"
        @click="requestVipAccess"
      >
        {{ vipStatus === 'rejected' ? 'Request again' : 'Request VIP Access' }}
      </UButton>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pt-4 lg:pt-0">
        <div>
          <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            VIP Cinematic
          </h1>
          <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
            <UIcon name="i-heroicons-film" class="w-4 h-4" style="color: #e3b04a;" />
            A separate invitation page with an automatic camera that pans and zooms across your story on its own - no scrolling needed.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <UButton
            size="lg"
            color="primary"
            class="font-semibold shadow-xl shadow-gold-500/20 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/30 w-full sm:w-auto"
            :loading="saving"
            @click="save"
          >
            Save changes
          </UButton>
        </div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">

        <!-- Left Column: Controls & List -->
        <div class="flex-1 w-full lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-6 order-2 lg:order-1">

          <!-- Enable/disable + live link panel -->
          <div class="form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <UIcon name="i-heroicons-power" style="color: #e3b04a;" class="w-5 h-5" />
                  VIP page is {{ vipEnabled ? 'on' : 'off' }}
                </h2>
                <p class="text-xs text-gray-400 mt-1">
                  {{ vipEnabled ? 'Guests visiting the VIP link below will see the automatic cinematic invitation.' : "Turn this on once you're happy with your scenes - the link stays private until then." }}
                </p>
              </div>
              <USwitch v-model="vipEnabled" size="lg" />
            </div>
            <div v-if="wedding" class="mt-4 pt-4 border-t border-gray-800 flex flex-wrap items-center gap-3">
              <code class="text-xs text-gold-300 bg-black/30 px-3 py-1.5 rounded-lg break-all">{{ vipLinkPath }}</code>
              <UButton variant="soft" color="gray" size="xs" icon="i-heroicons-clipboard" @click="copyLink">Copy link</UButton>
              <UButton variant="link" color="gray" size="xs" :to="vipLinkPath" target="_blank" external :padded="false">
                Open Live <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-1 w-3 h-3" />
              </UButton>
            </div>
          </div>

          <!-- Add a Scene Panel -->
          <div class="form-panel animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
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
              <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-md" @click="addScene">
                Add Scene
              </UButton>
            </div>
          </div>

          <!-- Current Scenes List -->
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

                  <!-- Editable Inline Fields -->
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
                  </div>

                  <UButton size="sm" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" @click="removeScene(index)" />
                </div>
              </TransitionGroup>
            </div>
          </div>

        </div>

        <!-- Right Column: Preview -->
        <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Scene Preview
            </p>
          </div>

          <!-- Smartphone Mockup Wrapper - a stacked preview of the scenes in
               order (the real guest page plays them one at a time with the
               automatic camera - see VipCinematicInvite.vue - but the stacked
               view here is enough to check your writing/photos at a glance). -->
          <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0">
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
import type { VipScene } from '~/composables/useWeddingTypes'

// The shared VIP Cinematic scene manager, used by both /dashboard/vip and
// the /admin/wedding/[id]/vip admin page. overrideWeddingId is only ever
// set by the admin page; couples hitting their own dashboard never pass
// it, so useMyWedding() falls back to its normal own-wedding lookup.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading, saving, updateVip, requestVipAccess } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { themeStyleVars } = useThemes()
const { isConfigured: cloudinaryConfigured, uploadImage } = useCloudinary()
const toast = useToast()

// Older wedding docs saved before VIP Cinematic existed have no vipStatus
// field at all yet - treat that the same as 'none' (never requested).
const vipStatus = computed(() => wedding.value?.vipStatus || 'none')

const gateIcon = computed(() => {
  if (vipStatus.value === 'pending') return 'i-heroicons-clock'
  if (vipStatus.value === 'rejected') return 'i-heroicons-x-circle'
  return 'i-heroicons-film'
})
const gateIconColor = computed(() => {
  if (vipStatus.value === 'pending') return '#e3b04a'
  if (vipStatus.value === 'rejected') return 'rgba(248, 113, 113, 0.7)'
  return 'rgba(227, 176, 74, 0.5)'
})
const gateTitle = computed(() => {
  if (vipStatus.value === 'pending') return 'Your VIP request is awaiting approval'
  if (vipStatus.value === 'rejected') return 'Your VIP request was not approved'
  return 'VIP Cinematic is an approved-access tier'
})
const gateDescription = computed(() => {
  if (vipStatus.value === 'pending') {
    return "We've let the team know you're interested - once approved, you'll be able to build your scenes here."
  }
  if (vipStatus.value === 'rejected') {
    return 'You can send another request if you\'d still like VIP Cinematic for your invitation.'
  }
  return 'A separate, cinematic version of your invitation with an automatic camera fly-through. Request access below and our team will review it.'
})

const scenes = ref<VipScene[]>([])
const vipEnabled = ref(false)
const draft = reactive({ title: '', body: '', imageUrl: '' })
const savedAt = ref<number | null>(null)

const draftImageInput = ref<HTMLInputElement | null>(null)
const sceneImageInputs: Record<string, HTMLInputElement | null> = {}
function setSceneImageInput(id: string, el: Element | null) {
  sceneImageInputs[id] = el as HTMLInputElement | null
}
const uploadingFor = ref<string | null>(null)

const vipLinkPath = computed(() => (wedding.value ? `/w/${wedding.value.slug}/vip` : ''))

async function copyLink() {
  if (!vipLinkPath.value) return
  const full = `${window.location.origin}${vipLinkPath.value}`
  try {
    await navigator.clipboard.writeText(full)
    toast.add({ title: 'Link copied', color: 'success' })
  } catch {
    toast.add({ title: 'Could not copy - copy it manually', color: 'error' })
  }
}

const styleVars = computed(() => {
  if (!wedding.value) return {}
  const c = wedding.value.content
  return themeStyleVars(
    wedding.value.themeId,
    { bgFrom: c.customBgFrom, bgTo: c.customBgTo, accent: c.customAccent },
    c.customFontFamily || c.fontFamily
  )
})

useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

let initialized = false
watch(
  wedding,
  (value) => {
    if (!value || initialized) return
    initialized = true
    scenes.value = [...(value.vipScenes || [])]
    vipEnabled.value = !!value.vipEnabled
  },
  { immediate: true }
)

function addScene() {
  if (!draft.title.trim() && !draft.body.trim()) {
    toast.add({ title: 'Add a title or some text first', color: 'warning' })
    return
  }
  scenes.value.push({
    id: `${Date.now()}`,
    title: draft.title.trim(),
    body: draft.body.trim(),
    imageUrl: draft.imageUrl
  })
  draft.title = ''
  draft.body = ''
  draft.imageUrl = ''
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

async function save() {
  await updateVip(vipEnabled.value, scenes.value)
  savedAt.value = Date.now()
  toast.add({ title: 'VIP Cinematic saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'VIP Cinematic — WeddingCard' })
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
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
  height: 720px;
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
  box-shadow: inset 0 -1px 1px rgba(255,255,255,0.05);
}

.phone-screen {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: #111;
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
  border-radius: 10px;
}
</style>
