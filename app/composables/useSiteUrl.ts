/**
 * Single source of truth for "what's our public base URL" on the client.
 *
 * Exists because NUXT_PUBLIC_SITE_URL is an environment variable scoped
 * PER VERCEL ENVIRONMENT (Production / Preview / Development) even though
 * it shares one name in the dashboard. If Production's value is ever left
 * at the Development default (http://localhost:3000) - as happened once
 * already - every WhatsApp/RSVP/guest-intake link generated on the live
 * site silently becomes an unclickable localhost link, with no error
 * anywhere. This composable can't fix a wrong env var, but it stops that
 * one misconfiguration from cascading into every link-building call site:
 * if the configured value is a *localhost* URL while the page is actually
 * running on a real domain, we trust the browser's own location instead.
 */
export function useSiteUrl() {
  const config = useRuntimeConfig()
  return computed(() => {
    const configured = String(config.public.siteUrl || '').replace(/\/$/, '')

    if (import.meta.client) {
      const isConfiguredLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)
      const isActuallyLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
      if (!configured || (isConfiguredLocalhost && !isActuallyLocalhost)) {
        return window.location.origin
      }
      return configured
    }

    return configured
  })
}
