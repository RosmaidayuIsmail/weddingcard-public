<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center text-white/60 bg-ink-950">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen flex items-center justify-center text-white text-center px-6 bg-ink-950">
    <div>
      <p class="text-xl font-display">We couldn't find that invitation.</p>
      <UButton to="/" class="mt-4" variant="soft">Go home</UButton>
    </div>
  </div>

  <div v-else class="print-page">
    <div class="print-toolbar">
      <UButton :to="`/w/${slug}`" variant="ghost" color="neutral" icon="i-heroicons-arrow-left">Back to invitation</UButton>
      <UButton color="primary" icon="i-heroicons-printer" @click="doPrint" class="shadow-lg">Print this card</UButton>
    </div>

    <div class="print-card" :style="styleVars">
      <CardOrnament :style="wedding.content.ornamentStyle" color="var(--theme-accent)" />
      <div v-if="wedding.content.coverPhotoUrl" class="print-photo" :style="{ backgroundImage: `url(${wedding.content.coverPhotoUrl})` }" />
      <div class="print-overlay">
        
        <div class="flex-1 flex flex-col justify-center items-center w-full mt-8">
          <p class="print-eyebrow">You're Invited</p>
          <p class="print-names font-heading">
            {{ wedding.content.brideName }} <span class="text-[0.6em] mx-1 opacity-90" style="color: var(--theme-accent);">&amp;</span> {{ wedding.content.groomName }}
          </p>
          
          <div class="mt-8 space-y-3">
            <p class="print-meta font-medium text-[1.1rem]">{{ wedding.content.dateLabel }}</p>
            <p class="print-meta opacity-90">{{ wedding.content.timeLabel }}</p>
            <div class="pt-2">
              <p class="print-meta font-semibold">{{ wedding.content.venueName }}</p>
              <p class="print-meta opacity-80 mt-1 max-w-[80%] mx-auto leading-relaxed">{{ wedding.content.venueAddress }}</p>
            </div>
          </div>
        </div>

        <!-- Redesigned Premium QR Code UI -->
        <div v-if="qrCodeUrl" class="print-qr-wrapper">
          <div class="print-qr-container">
            <img :src="qrCodeUrl" alt="Scan to RSVP online" class="print-qr">
          </div>
          <p class="print-caption">Scan to RSVP</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars } = useThemes()
const config = useRuntimeConfig()

// Injects the theme styles and perfectly matches the Custom Google Font
const styleVars = computed(() =>
  themeStyleVars(
    wedding.value?.themeId,
    {
      bgFrom: wedding.value?.content.customBgFrom,
      bgTo: wedding.value?.content.customBgTo,
      accent: wedding.value?.content.customAccent
    },
    wedding.value?.content.customFontFamily || wedding.value?.content.fontFamily
  )
)

// Injects the custom Google Font stylesheet onto the print page
useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value?.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

const qrCodeUrl = computed(() => {
  const base = config.public.siteUrl || (import.meta.client ? window.location.origin : '')
  const url = `${base}/w/${slug}/rsvp`
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=300x300&margin=0`
})

function doPrint() {
  if (import.meta.client) window.print()
}

useSeoMeta({ title: 'Printable Card' })
</script>

<style scoped>
.print-page {
  min-height: 100vh;
  background: #111827;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
}

.print-toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.print-card {
  position: relative;
  width: 5in;
  height: 7in;
  max-width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.print-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.4;
}

.print-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--theme-ink);
  z-index: 2;
  background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.4) 100%);
}

.print-eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--theme-accent);
  margin-bottom: 1rem;
  font-weight: 600;
}

.print-names {
  font-size: clamp(3.5rem, 10vw, 4.5rem);
  line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.print-meta {
  font-size: 0.95rem;
  opacity: 0.9;
  letter-spacing: 0.05em;
}

/* Beautiful Premium QR Code UI */
.print-qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  margin-bottom: 1rem;
}

.print-qr-container {
  background: #ffffff;
  padding: 0.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--theme-accent);
}

.print-qr {
  width: 90px;
  height: 90px;
  display: block;
}

.print-caption {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--theme-accent);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

@media print {
  @page {
    size: 5in 7in;
    margin: 0;
  }

  .print-page {
    background: white;
    padding: 0;
    min-height: auto;
  }

  .print-toolbar {
    display: none;
  }

  .print-card {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
    height: 100vh;
    border: none;
  }
}
</style>