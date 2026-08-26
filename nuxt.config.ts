export default defineNuxtConfig({
  compatibilityDate: '2026-07-18',

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  fonts: {
    experimental: { processCSSVariables: false },
    providers: {
      google: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      googleicons: false
    }
  },

  // Forces every response to skip HTTP/CDN caching entirely. Added because
  // the VIP dashboard was intermittently showing stale content after
  // deploys - this removes any caching layer as a possible cause, at the
  // cost of a little raw performance (fine for a low-traffic app like this).
  routeRules: {
    '/**': {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    }
  },

  // Only takes effect when building with --preset=firebase (see
  // `npm run build:firebase`) - local `npm run dev`/`build`/`preview` are
  // unaffected and keep using the default node-server preset.
  nitro: {
    firebase: {
      gen: 2,
      nodeVersion: '22'
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'WeddingCard — Design your wedding invitation & manage RSVPs',
      meta: [
        { name: 'description', content: 'Build a beautiful digital and printable wedding invitation, manage VIP and general guest lists, plan your wedding-day flow, and track RSVPs live.' },
        { name: 'theme-color', content: '#04101f' },
        { property: 'og:type', content: 'website' }
      ],
      // Replaces the Nuxt logo with a Wedding Ring Favicon
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💍</text></svg>' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  runtimeConfig: {
    billplzApiKey: process.env.BILLPLZ_API_KEY || '',
    billplzCollectionId: process.env.BILLPLZ_COLLECTION_ID || '',
    billplzXSignatureKey: process.env.BILLPLZ_X_SIGNATURE_KEY || '',
    billplzSandbox: process.env.BILLPLZ_SANDBOX !== 'false',

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
      recaptchaEnterpriseSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY || '',
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
    }
  }
})
