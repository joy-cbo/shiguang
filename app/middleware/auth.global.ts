// 全局认证中间件 — 拦截 /admin/*，放行 /admin/login 和 /admin/setup
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return

  // 放行登录页和初始化页
  if (to.path === '/admin/login' || to.path === '/admin/setup') {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token && to.path !== '/admin/setup') {
        return navigateTo('/admin')
      }
    }
    return
  }

  // 其他 /admin/* 检查 token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
})
