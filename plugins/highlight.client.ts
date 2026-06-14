// 代码高亮插件 — 自动对 <pre><code> 应用 highlight.js
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export default defineNuxtPlugin(() => {
  if (process.server) return

  // 页面加载后高亮
  const highlight = () => {
    document.querySelectorAll('pre code').forEach((block) => {
      if (!(block as HTMLElement).dataset.highlighted) {
        hljs.highlightElement(block as HTMLElement)
      }
    })
  }

  onNuxtReady(() => highlight())

  // 路由切换后也高亮
  const router = useRouter()
  router.afterEach(() => nextTick(() => highlight()))
})
