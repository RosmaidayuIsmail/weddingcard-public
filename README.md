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

- **Payments.** `/dashboard/billing` shows real pricing and an "Upgrade" button, but it's a preview — clicking it shows a toast, not a real charge. Wiring up live Billplz/ToyyibPay checkout needs a webhook that can trust "this was actually paid" and write that back to Firestore, which requires a server-side Firebase Admin SDK (a service account) that this round deliberately doesn't add, to keep this pass dependency-free. Happy to build that next.
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

**Firebase (Hosting + Cloud Functions)** — works, but two things to know upfront:
- This app needs SSR (dynamic wedding pages, auth-gated dashboard), so it needs to run on Cloud Functions, not plain static Firebase Hosting. Cloud Functions require the **Blaze plan** regardless of actual usage — same requirement as Cloud Storage.
- Nuxt's own docs now mark this classic Functions+Hosting path as "deprecated, not recommended" in favor of **Firebase App Hosting**, which is the officially current approach but requires connecting a GitHub repo through the Firebase console (a bigger setup step). The classic path below still works and is a plain CLI deploy with no GitHub needed — useful if you're working locally like this project has been so far.

Steps:
```bash
npm install -g firebase-tools   # if you don't have it
firebase login
```
Check `.firebaserc` has your correct project ID (it's pre-filled, but confirm it matches your actual Firebase project). Then:
```bash
npm run deploy:firebase
```
This runs `nuxt build --preset=firebase`, installs the function's dependencies, and deploys both Hosting and the Functions-based SSR server in one go. Your `.env` values get copied into the deployed function automatically as part of the build step — without that, your Firebase/Cloudinary config would be missing at runtime even though the site "builds" fine.

**Netlify** — a solid alternative if you'd rather not touch the Blaze plan at all. `nitro.preset = 'netlify'` and their free tier doesn't require a card. Not set up in this project yet, but it's a one-line preset change plus a Netlify account if you want to go that route instead.

**About the Vercel issue**: without seeing the exact error, my best guess is you're hitting the Hobby plan's serverless function count/size limits rather than a real "too many files" problem with the code itself — Nitro's default Vercel output can be adjusted to bundle as fewer functions. Happy to help debug that specifically if you paste the actual error next time, as an alternative to switching platforms entirely.

## Customizing themes

Themes live in `app/composables/useThemes.ts` as plain data — add a new entry with a palette and price, and it shows up automatically in the theme picker and public pages (no new components needed, since every themed page reads colors from CSS variables).

## Suggested next round

Given what's built now, the natural next steps in priority order: (1) wire up real Billplz checkout + webhook (needs `firebase-admin`), (2) link VIP invites to their RSVP response via a per-guest token, (3) a dedicated PDF export for the guest list.
