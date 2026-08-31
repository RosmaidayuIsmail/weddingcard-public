import type { H3Event } from 'h3'

/**
 * Server-side counterpart to app/composables/useSiteUrl.ts - see that file
 * for why this exists. Used anywhere a server route builds a link that
 * gets shown to (or clicked by) someone outside this server: WhatsApp/RSVP/
 * guest-intake invite links, the Google Sheet export, ToyyibPay payment
 * return/callback URLs, the Google Drive OAuth redirect.
 *
 * If NUXT_PUBLIC_SITE_URL is missing or still pointing at localhost (e.g.
 * because only the Development tab of a Vercel env var got set, not
 * Production), we fall back to the incoming request's own protocol+host -
 * which, for a real visitor hitting the live site, is the real domain.
 */
export function resolveSiteUrl(event: H3Event): string {
  const configured = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
  const isConfiguredLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)

  if (!configured || isConfiguredLocalhost) {
    try {
      const requestUrl = getRequestURL(event)
      const isRequestLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(requestUrl.hostname)
      if (!isRequestLocalhost) {
        return `${requestUrl.protocol}//${requestUrl.host}`
      }
    } catch {
      // fall through to whatever `configured` is
    }
  }

  return configured
}
