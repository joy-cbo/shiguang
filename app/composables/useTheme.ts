// 主题检测 composable
// 优先读 Nuxt 共享状态（由 plugins/theme-init.ts 在应用启动时从 D1 获取）
// 兜底读 localStorage
export function useTheme() {
  const themeState = useState<{ active: string }>('theme', () => ({ active: 'default' }))
  
  const activeTheme = computed({
    get: () => {
      // Nuxt 共享状态优先
      if (themeState.value.active !== 'default') return themeState.value.active
      // 兜底 localStorage
      if (typeof window !== 'undefined') {
        return localStorage.getItem('active_theme') || 'default'
      }
      return 'default'
    },
    set: (val: string) => {
      themeState.value.active = val
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_theme', val)
      }
    }
  })

  const isSaas = computed(() => activeTheme.value === 'saas')
  const isDefault = computed(() => activeTheme.value === 'default' || !activeTheme.value)

  return { activeTheme, isSaas, isDefault }
}
