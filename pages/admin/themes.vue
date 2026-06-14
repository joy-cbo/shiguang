<template>
  <NuxtLayout name="admin">
    <h1 class="text-xl font-bold mb-6">主题管理</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="theme in themes"
        :key="theme.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
        :class="activeTheme === theme.id ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'"
      >
        <!-- 预览图占位 -->
        <div class="h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <span class="text-4xl">{{ theme.id === 'saas' ? '🎨' : theme.id === 'halo-style' ? '🖼️' : '🏠' }}</span>
        </div>
        
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ theme.name }}</h3>
            <span v-if="activeTheme === theme.id" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              ✓ 当前使用
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ theme.description }}</p>
          
          <!-- 特性标签 -->
          <div v-if="theme.features?.length" class="flex flex-wrap gap-1 mb-3">
            <span v-for="f in theme.features" :key="f" class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
              {{ f }}
            </span>
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>v{{ theme.version }}</span>
            <button
              v-if="activeTheme !== theme.id"
              @click="switchTheme(theme.id)"
              :disabled="switching === theme.id"
              class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm transition-colors"
            >
              {{ switching === theme.id ? '切换中...' : '启用此主题' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="switchMsg" class="mt-4 p-3 rounded-lg text-sm" :class="switchError ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'">
      {{ switchMsg }}
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
interface ThemeInfo {
  id: string
  name: string
  version: string
  author: string
  description: string
  features?: string[]
}

const themes = ref<ThemeInfo[]>([
  {
    id: 'default',
    name: '默认主题',
    version: '1.0.0',
    author: '拾光',
    description: '拾光博客默认主题，深色/亮色双模式，简洁实用',
    features: ['暗黑模式', '响应式布局', 'Tailwind CSS']
  },
  {
    id: 'halo-style',
    name: 'Halo 风格',
    version: '1.0.0',
    author: '拾光',
    description: '仿 Halo 博客的简洁风格',
    features: ['Halo 风格', '暗黑模式']
  },
  {
    id: 'saas',
    name: 'SaaS',
    version: '1.0.0',
    author: 'Hermes',
    description: '轻科技感 SaaS 风格 — 大面积留白、紫橙渐变、毛玻璃卡片',
    features: ['毛玻璃导航栏', '紫橙渐变光感', '卡片悬停上浮', '柔光阴影']
  }
])

const activeTheme = ref('default')
const switching = ref('')
const switchMsg = ref('')
const switchError = ref(false)

const { fetch } = useApi()

onMounted(async () => {
  try {
    const s = await $fetch<Record<string, string>>('/api/settings')
    activeTheme.value = s.active_theme || 'default'
  } catch (e) { console.error('[主题管理] 加载设置失败:', e) }
})

async function switchTheme(themeId: string) {
  switching.value = themeId
  switchMsg.value = ''
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      body: { active_theme: themeId }
    })
    activeTheme.value = themeId
    localStorage.setItem('active_theme', themeId)
    switchMsg.value = '主题已切换！刷新前台页面即可看到效果'
    switchError.value = false
    // 3秒后刷新当前页面看看
    setTimeout(() => { switchMsg.value = '' }, 5000)
  } catch (e: any) {
    switchMsg.value = e?.data?.message || '切换失败'
    switchError.value = true
  } finally {
    switching.value = ''
  }
}
</script>
