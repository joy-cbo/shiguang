// 导航栏中间件 — Token 检查和暗黑模式初始化（所有页面）
export default defineNuxtRouteMiddleware(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dark_mode')
    if (stored === 'true' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  }
})
