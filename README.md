# WeddingCard

A multi-tenant wedding invitation & RSVP platform on **Nuxt 4**, **Nuxt UI 4**, **Tailwind CSS 4** and **Firebase**. Couples sign up, design their own card from a set of themes, manage a VIP + general guest list, plan their wedding-day flow, and get a live RSVP dashboard. A platform-level super-admin can see every wedding on the site.

This started as a single hardcoded wedding invite and was rebuilt into a real platform. If you're looking for the original single-couple version, it's the commit before this restructure.

## What this round added

- **Accounts** — Firebase Auth (email/password + Google), one wedding per couple
- **Card builder** — tabbed editor for couple info, event details, cover photo (via Cloudinary), and theme, with a live preview
- **4 themes** (2 free, 2 premium) applied dynamically via CSS variables — no per-theme rebuild needed
- **Public dynamic pages** at `/w/{slug}` (hero), `/w/{slug}/details`, `/w/{slug}/rsvp` — same animated envelope/countdown/carousel/wizard experience as before, now driven by Firestore instead of hardcoded content
- **Printable card** at `/w/{slug}/print`, sized for a 5×7in card with proper `@page` print CSS
- **Guests page** — VIP/general tiers, add guests manually, per-guest WhatsApp deep link, CSV export, print-to-PDF
- **Day-flow planner** — add/reorder/remove run-of-show items, shown to guests as a timeline slide once you add any
- **Platform super-admin** at `/admin` — lists every wedding, its plan and publish status
- **Billing page** with plan/theme pricing in RM — see [What's not wired up yet](#whats-not-wired-up-yet)

## What's not wired up yet

Being upfront about scope, since you asked me to prioritize the foundation this round:

- **Payments — live.** `/dashboard/billing` takes real ToyyibPay (FPX) payments for the Premium upgrade. The flow: the couple submits payer details, `POST /api/payments/create-bill` creates a ToyyibPay bill and a `weddings/{id}/payments` record, the couple is redirected to ToyyibPay, and on success ToyyibPay calls `POST /api/payments/callback` (hash-validated) which atomically marks the payment paid and flips the wedding to Premium. `GET /api/payments/status` reconciles late/lost callbacks. See [Deployment](#deployment) for the required env vars.
- **VIP invite tracking.** Guests you add manually in the Guests page and guests who RSVP publicly are currently two separate records — a personalized WhatsApp link pre-fills the guest's name in the RSVP form, but doesn't yet mark *that specific* invited guest as responded. Properly linking them needs a per-guest token the public RSVP page can safely look up, which is a reasonable next step but adds real complexity to the security rules.
- **Guest CSV/PDF export** works (CSV is a real file download; "PDF" is a print-optimized view via the browser's print dialog) but there's no dedicated PDF-generation library — fine for most printers/save-as-PDF flows, less fine if you need pixel-perfect PDF layout.

## Project structure

```
app/
  pages/
    index.vue                 # Platform marketing landing page
    login.vue, signup.vue     # Firebase Auth
    admin.vue                 # Platform super-admin (all weddings)
    dashboard/                # Couple's private area (needs 'auth' middleware)
      index.vue                 # Overview + first-time wedding creation
      editor.vue                 # Card builder: content, photo, theme, live preview
      guests.vue                 # VIP/general guest list, WhatsApp links, CSV export
      flow.vue                   # Wedding-day run-of-show planner
      billing.vue                 # Plan/theme pricing (preview only, see above)
    w/[slug]/                 # Public, per-wedding pages
      index.vue, details.vue, rsvp.vue, print.vue
  composables/
    useAuth.ts                # Firebase Auth + Firestore user profile/role
    useThemes.ts               # Theme catalog (palette + pricing)
    useMyWedding.ts            # Couple's own wedding: create (atomic slug reservation), update
    useWeddingBySlug.ts        # Public wedding lookup by slug
    useGuests.ts                # Guest list CRUD + CSV export + WhatsApp link builder
    useWishes.ts                # Live wishes wall (Firestore onSnapshot), scoped per wedding
    useCountdown.ts, useFirebase.ts, useWeddingTypes.ts
  middleware/
    auth.ts                    # Redirects to /login if signed out (client-side only, see below)
    superadmin.ts               # Redirects unless users/{uid}.role == 'superadmin'
  layouts/dashboard.vue        # Sidebar nav for /dashboard/**
firestore.rules                # Multi-tenant security rules (see below)
storage.rules                  # Cover photo upload rules
```

## Data model (Firestore)

```
users/{uid}                        profile + role ('couple' | 'superadmin')
slugs/{slug}                       { weddingId } — reservation + fast slug lookup
weddings/{weddingId}
  ownerUid, slug, themeId, plan, paymentStatus, status ('draft' | 'published')
  content: { brideName, groomName, dateISO, venueName, bank, coverPhotoUrl, ... }
  flow: [ { time, title, description } ]
  guests/{guestId}                 PRIVATE — owner/superadmin read only
    name, tier ('vip' | 'general'), phone, attending, guestCount, dietary, doa
  wishes/{wishId}                  PUBLIC read — only { name, doa, submittedAt }
```

The `guests`/`wishes` split is deliberate: the live Wishes Wall needs public read access to work, but a guest's phone number, dietary needs, and headcount shouldn't be publicly queryable just because someone opens dev tools. Splitting them means the public surface only ever exposes what's meant to be public. See the comments in `firestore.rules` for the full rule set, including how the super-admin role gets elevated read access without needing a service account.

## Setup

Requires **Node 22.12+** (or 24.11+/26+).

```bash
npm install
cp .env.example .env
```

1. **Firebase project** — in the [console](https://console.firebase.google.com):
   - Enable **Authentication** > Sign-in method > Email/Password and Google.
   - Enable **Firestore Database**, then paste [`firestore.rules`](./firestore.rules) into the Rules tab — make sure to click **Publish**, not just save the editor content.
   - Copy the web app config into `NUXT_PUBLIC_FIREBASE_*` in `.env`.
   - You do **not** need to enable Firebase Storage. As of February 2026, Firebase requires the paid Blaze plan for Cloud Storage even at free-tier usage, so cover photo uploads use Cloudinary instead (next step). If you're already on Blaze and would rather use Firebase Storage, `storage.rules` is still here for that.
2. **Cloudinary** (free, no credit card) — for the cover photo uploader on `/dashboard/editor`:
   - Sign up at [cloudinary.com](https://cloudinary.com), grab your **Cloud Name** from the dashboard.
   - Settings (gear icon) > Upload > Upload presets > Add upload preset > set **Signing Mode** to **Unsigned** > Save.
   - Put both values in `NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in `.env`.
3. Set `NUXT_PUBLIC_SITE_URL` to your real domain in production (used to build WhatsApp/QR/share links).
4. **Making yourself a super-admin**: sign up normally through `/signup`, then in the Firestore console open `users/{your-uid}` and change `role` from `couple` to `superadmin`. There's no self-serve way to do this by design — it's a manual, deliberate step.

Restart `npm run dev` after any `.env` change — it's only read at server startup.

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm run preview   # preview the production build locally
```

## Deployment

Production runs on **Vercel** (hosting + serverless functions). **Firebase is the backend only** — Auth, Firestore, and security rules. There is no Firebase Hosting or Cloud Functions involved.

There are two separate deploys:

1. **Code → Vercel (automatic).** Push to `main` on GitHub (or run `vercel --prod`) and Vercel builds with the Nuxt preset (auto-detected — no `vercel.json` needed) and deploys. Static assets are served from the edge; the SSR server and `/api/*` payment routes run as Vercel serverless functions.

2. **Rules/indexes → Firebase CLI (manual).** Firestore rules and indexes live in `firestore.rules` / `firestore.indexes.json` and are deployed separately:
   ```bash
   npm install -g firebase-tools   # if you don't have it
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   `.firebaserc` points at the Firebase project the app actually uses (`onlineinvitation-14480`).

**Vercel environment variables.** In your Vercel project settings, set the server-only vars (never `NUXT_PUBLIC_`):

- `NUXT_FIREBASE_SERVICE_ACCOUNT_JSON` — stringified service-account JSON (Firebase console → Project settings → Service accounts → Generate new private key). Powers the payment routes' Admin SDK writes.
- `NUXT_TOYYIBPAY_SECRET_KEY`, `NUXT_TOYYIBPAY_CATEGORY_CODE`, `NUXT_TOYYIBPAY_BASE_URL` — ToyyibPay credentials. Base URL is `https://dev.toyyibpay.com` (sandbox) or `https://toyyibpay.com` (production).

Plus the public `NUXT_PUBLIC_*` vars (site URL, Firebase web config, Cloudinary, App Check). See `.env.example` for the full annotated list.

**Note on the service account:** the payments routes verify ID tokens and flip `weddings.plan`/`paymentStatus` server-side via the Admin SDK, which bypasses `firestore.rules`. The rules separately block couples from writing those billing fields themselves, so a client can never self-upgrade.

## Customizing themes

Themes live in `app/composables/useThemes.ts` as plain data — add a new entry with a palette and price, and it shows up automatically in the theme picker and public pages (no new components needed, since every themed page reads colors from CSS variables).

## Suggested next round

Given what's built now, the natural next steps in priority order: (1) link VIP invites to their RSVP response via a per-guest token, (2) a dedicated PDF export for the guest list, (3) wire physical-card orders to ToyyibPay the same way as the premium upgrade.
