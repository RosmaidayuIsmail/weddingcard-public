export default defineNuxtRouteMiddleware(async (to) => {
  // Firebase Auth state only exists client-side, so we let the SSR pass
  // through and enforce the redirect once the client has resolved the
  // real auth state - same pattern as middleware/auth.ts and
  // middleware/superadmin.ts.
  if (import.meta.server) return

  await waitForAuthReady()
  const { currentUser, profile } = useAuthState()

  if (!currentUser.value) {
    return navigateTo({ path: '/vip/login', query: { redirect: to.fullPath } })
  }

  // VIP is its own separate tier - a couple or superadmin account signed
  // in on the regular side of the app gets sent back to their own area
  // instead of into the VIP dashboard.
  if (profile.value?.role === 'superadmin') {
    return navigateTo('/admin')
  }
  if (profile.value?.role !== 'vip') {
    return navigateTo('/dashboard')
  }

  // Approval gating itself (pending/rejected vs approved) happens inside
  // /vip/dashboard, not here - so a not-yet-approved VIP account still
  // lands on their dashboard and sees a clear status message, instead of
  // bouncing somewhere else.
})
