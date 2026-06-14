<template>
  <NuxtLayout name="default">
    <div v-if="loading" class="text-center py-20 text-gray-400">加载中...</div>
    <template v-else-if="series">
      <div class="max-w-3xl mx-auto mb-8">
        <p class="text-sm text-gray-500 mb-2">📚 文章系列</p>
        <h1 class="text-2xl md:text-3xl font-bold mb-2">{{ series.name }}</h1>
        <p v-if="series.description" class="text-gray-600 dark:text-gray-400 text-sm">{{ series.description }}</p>
        <p class="text-xs text-gray-400 mt-2">{{ posts.length || 0 }} 篇文章</p>
      </div>

      <div v-if="posts.length" class="grid gap-4 max-w-3xl mx-auto">
        <article v-for="(p, i) in posts" :key="p.id" class="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-sm transition-shadow">
          <div class="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-white shrink-0">
            {{ i + 1 }}
          </div>
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/posts/${p.slug}`" class="font-semibold hover:text-purple-600">{{ p.title }}</NuxtLink>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(p.created_at) }} · {{ p.view_count || 0 }} 次阅读</p>
          </div>
        </article>
      </div>
      <div v-else class="text-center py-10 text-gray-400">本系列暂无文章</div>
    </template>
    <div v-else class="text-center py-20 text-gray-400">系列不存在</div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { formatDate } = useFormat()
const series = ref<any>(null)
const posts = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch<{ series: any; posts: any[] }>(`/api/series/${route.params.slug}`)
    series.value = data.series
    posts.value = data.posts || []
  } catch (e) { console.error('[系列页] 加载失败:', e) }
  loading.value = false
})

useHead(() => ({
  title: series.value ? `${series.value.name} - 系列 - 拾光博客` : '拾光博客'
}))
</script>
