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
})
