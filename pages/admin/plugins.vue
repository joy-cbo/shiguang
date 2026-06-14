<template>
  <NuxtLayout name="admin">
    <h1 class="text-xl font-bold mb-4">插件管理</h1>
    <p class="text-sm text-gray-500 mb-4">启用或禁用插件来开关博客功能</p>

    <div class="grid gap-3">
      <div v-for="p in plugins" :key="p.name" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ p.name }}</span>
            <span class="text-xs text-gray-400">v{{ p.version }}</span>
          </div>
          <p class="text-sm text-gray-500 mt-0.5 truncate">{{ p.description }}</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
          <input type="checkbox" :checked="p.enabled" @change="toggle(p)" class="sr-only peer" />
          <div class="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600"></div>
        </label>
      </div>
    </div>
    <p v-if="!plugins.length" class="text-gray-400 py-8 text-center">暂无插件</p>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Plugin } from '~/types'

const { fetch, handleError } = useApi()
const plugins = ref<Plugin[]>([])

async function load() {
  try {
    const data = await fetch<{ plugins: Plugin[] }>('/api/plugins')
    plugins.value = data.plugins || []
  } catch {}
}

async function toggle(p: Plugin) {
  try {
    const data = await fetch<{ plugins: Plugin[] }>(`/api/plugins/${p.name}`, {
      method: 'PUT',
      body: { enabled: !p.enabled },
    })
    plugins.value = data.plugins || []
  } catch {}
}

onMounted(() => load())
</script>
