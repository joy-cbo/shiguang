<!-- 搜索结果页 -->
<template>
  <NuxtLayout name="default">
    <h1 class="text-2xl font-bold mb-2">搜索：{{ q }}</h1>
    <p class="text-sm text-gray-500 mb-6">找到 {{ total }} 篇文章</p>

    <div v-if="loading" class="text-center py-10 text-gray-400">搜索中...</div>
    <div v-else-if="!results.length" class="text-center py-10 text-gray-400">
      <p class="text-lg mb-2">😕 没有找到相关内容</p>
      <p>试试其他关键词，或者 <NuxtLink to="/" class="text-purple-500 underline">回到首页</NuxtLink></p>
    </div>

    <div v-else class="grid sm:grid-cols-2 gap-5">
      <article v-for="r in results" :key="r.id" :class="'bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow'">
        <h2 class="text-lg font-semibold mb-2">
          <NuxtLink :to="`/posts/${r.slug}`" class="hover:text-purple-600" v-html="highlight(r.title)"></NuxtLink>
        </h2>
        <p class="text-xs text-gray-500 mb-2">{{ r.author_nickname || '匿名' }} · {{ formatDate(r.created_at) }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400" v-html="highlight(r.snippet)"></p>
      </article>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { sanitizeHtml } from '~/composables/useSanitize'

const route = useRoute()
const { formatDate } = useFormat()
const q = computed(() => (route.query.q as string || '').trim())
const results = ref<any[]>([])
const total = ref(0)
const loading = ref(true)

// 关键词高亮 + 消毒（防御性安全）
function highlight(text: string): string {
  if (!q.value || !text) return text
  const escaped = q.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const result = text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>')
  // 使用统一的消毒函数，SSR 和客户端都安全
  return sanitizeHtml(result)
}

watchEffect(async () => {
  if (!q.value) { loading.value = false; return }
  loading.value = true
  try {
    const data = await $fetch<{ results: any[]; total: number }>(`/api/search?q=${encodeURIComponent(q.value)}`)
    results.value = data.results || []
    total.value = data.total || 0
  } catch { results.value = [] }
  loading.value = false
})
</script>
