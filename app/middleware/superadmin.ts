export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  await waitForAuthReady()
  const { currentUser, profile } = useAuthState()

  if (!currentUser.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (profile.value?.role !== 'superadmin') {
    return navigateTo('/dashboard')
  }

  // Admin is now platform-level only. Do not expose the legacy per-wedding
  // admin routes, even to a superadmin; all supported controls live at /admin.
  if (to.path.startsWith('/admin/wedding/')) {
    return navigateTo('/admin')
  }
})
