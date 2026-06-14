// 插件：应用启动时立即从 D1 获取主题设置，写入共享状态
// SSR 阶段就能确定主题，不再依赖 localStorage
export default defineNuxtPlugin(async () => {
  const state = useState('theme', () => ({ active: 'default' }))
  
  try {
    const data = await $fetch<Record<string, string>>('/api/settings')
    if (data.active_theme) {
      state.value.active = data.active_theme
      // 同步到 localStorage 确保 useTheme() 也能读到
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_theme', data.active_theme)
      }
    }
  } catch (_) {}
})
