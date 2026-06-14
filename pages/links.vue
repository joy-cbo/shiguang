<template>
  <NuxtLayout name="default">
    <h1 class="text-2xl font-bold mb-6">🔗 友情链接</h1>
    <p class="text-gray-500 mb-8 text-sm">一些有趣的朋友和站点</p>

    <div v-if="loading" class="text-center py-10 text-gray-400">加载中...</div>

    <div v-else-if="links.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a v-for="link in links" :key="link.id" :href="link.url" target="_blank" rel="noopener"
        :class="'flex items-start gap-4 p-4 rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]'"
      >
        <img v-if="link.logo" :src="link.logo" :alt="link.name" class="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100" />
        <div v-else class="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xl shrink-0">
          {{ link.name[0] }}
        </div>
        <div class="min-w-0">
          <h3 class="font-semibold group-hover:text-purple-600 transition-colors truncate">{{ link.name }}</h3>
          <p v-if="link.description" class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ link.description }}</p>
        </div>
      </a>
    </div>

    <div v-else class="text-center py-10 text-gray-400">还没有友链，去后台添加吧~</div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const links = ref<Array<{ id: number; name: string; url: string; logo: string; description: string }>>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch<{ links: any[] }>('/api/links')
    links.value = data.links || []
  } catch (e) { console.error('[友链] 加载失败:', e) }
  loading.value = false
})

useHead({ title: '友情链接' })
</script>
