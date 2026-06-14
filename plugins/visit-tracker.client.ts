// 访问追踪插件 — 每次页面切换时记录访问
export default defineNuxtPlugin(() => {
  if (process.server) return

  let lastPath = ''

  const record = (path: string, referer: string) => {
    if (path === lastPath) return
    lastPath = path
    $fetch('/api/visit', { method: 'POST', body: { url: path, referer } }).catch(() => {})
  }

  // 首次加载
  record(window.location.pathname, document.referrer)

  // 路由切换
  const router = useRouter()
  router.afterEach((to, from) => {
    record(to.fullPath, from?.fullPath || document.referrer)
  })
})
