<template>
  <NuxtLayout name="admin">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <NuxtLink v-for="card in cards" :key="card.label" :to="card.link"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all block">
        <p class="text-sm text-gray-500 mb-1">{{ card.label }}</p>
        <p class="text-2xl font-bold" :class="card.color || 'text-gray-800 dark:text-gray-200'">{{ card.value }}</p>
      </NuxtLink>
    </div>

    <!-- 最近文章 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border dark:border-gray-700">
      <h2 class="font-semibold mb-3">最近文章</h2>
      <table class="w-full text-sm">
        <thead><tr class="text-left text-gray-500 border-b dark:border-gray-700"><th class="py-2">标题</th><th>状态</th><th>时间</th></tr></thead>
        <tbody>
          <tr v-for="p in recentPosts" :key="p.id" class="border-b dark:border-gray-700">
            <td class="py-2">
              <NuxtLink :to="`/admin/posts/edit-${p.id}`" class="text-purple-600 hover:underline">{{ p.title }}</NuxtLink>
            </td>
            <td><IconShiguang v-if="p.status === 'published'" name="check" size="16" class="text-green-500 inline"/><IconShiguang v-else name="edit" size="16" class="text-yellow-500 inline"/></td>
            <td class="text-gray-400">{{ formatDate(p.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!recentPosts.length && !loading" class="text-gray-400 py-4 text-center">暂无文章</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from '~/types'
const { fetch } = useApi()
const { formatDate } = useFormat()

const cards = ref([
  { label: '文章总数', value: 0, color: 'text-purple-600', link: '/admin/posts' },
  { label: '已发布', value: 0, color: 'text-green-600', link: '/admin/posts' },
  { label: '草稿', value: 0, color: 'text-orange-600', link: '/admin/posts' },
])
const recentPosts = ref<Post[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [allData, publishedData] = await Promise.all([
      fetch<{ total: number }>('/api/posts?status=all&limit=1'),
      fetch<{ total: number }>('/api/posts?status=published&limit=1'),
    ])
    const total = allData.total || 0
    const published = publishedData.total || 0
    const drafts = total - published
    cards.value = [
      { label: '文章总数', value: total, color: 'text-purple-600', link: '/admin/posts' },
      { label: '已发布', value: published, color: 'text-green-600', link: '/admin/posts' },
      { label: '草稿', value: drafts, color: 'text-orange-600', link: '/admin/posts' },
    ]
  } catch (e) { console.error('仪表盘加载失败:', e) } finally { loading.value = false }
})

// 加载最近文章
onMounted(async () => {
  try {
    const data = await fetch<{ posts: Post[] }>('/api/posts?status=all&limit=5')
    recentPosts.value = data.posts || []
  } catch (e) { console.error('最近文章加载失败:', e) }
})
</script>
