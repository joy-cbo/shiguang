<template>
  <NuxtLayout name="admin">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <NuxtLink v-for="card in cards" :key="card.label" :to="card.link"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all block">
        <p class="text-sm text-gray-500 mb-1">{{ card.label }}</p>
        <p class="text-2xl font-bold" :class="card.color || 'text-gray-800 dark:text-gray-200'">{{ card.value }}</p>
      </NuxtLink>
    </div>

    <!-- 周访问趋势图 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border dark:border-gray-700 mb-6">
      <h2 class="font-semibold mb-3 text-sm text-gray-500">过去7天访问量（含今天）</h2>
      <div class="flex items-end gap-2 h-32">
        <div v-for="(d, i) in weeklyBars" :key="i" class="flex-1 flex flex-col items-center gap-1">
          <span class="text-xs" :class="d.count > 0 ? 'text-gray-600' : 'text-gray-300'">{{ d.count }}</span>
          <div class="w-full rounded-t" :class="d.isToday ? 'bg-orange-500' : 'bg-blue-500'" :style="{ height: d.pct + '%' }" :title="d.day"></div>
          <span class="text-xs" :class="d.isToday ? 'text-orange-600 font-semibold' : 'text-gray-400'">{{ d.label }}</span>
        </div>
      </div>
    </div>

    <!-- 最近文章 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border dark:border-gray-700">
      <h2 class="font-semibold mb-3">最近文章</h2>
      <table class="w-full text-sm">
        <thead><tr class="text-left text-gray-500 border-b dark:border-gray-700"><th class="py-2">标题</th><th>状态</th><th>时间</th></tr></thead>
        <tbody>
          <tr v-for="p in recentPosts" :key="p.id" class="border-b dark:border-gray-700">
            <td class="py-2">
              <NuxtLink :to="`/admin/posts/edit-${p.id}`" class="text-blue-500 hover:underline">{{ p.title }}</NuxtLink>
            </td>
            <td>{{ p.status === 'published' ? '✅' : '📝' }}</td>
            <td class="text-gray-400">{{ formatDate(p.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!recentPosts.length && !loading" class="text-gray-400 py-4 text-center">暂无文章</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from '~~/types'
const { fetch } = useApi()
const { formatDate } = useFormat()

const cards = ref([
  { label: '文章总数', value: 0, color: 'text-blue-600', link: '/admin/posts' },
  { label: '已发布', value: 0, color: 'text-green-600', link: '/admin/posts' },
  { label: '今日访问', value: 0, color: 'text-orange-600', link: '/admin/visits' },
  { label: '总访问量', value: 0, color: 'text-purple-600', link: '/admin/visits' },
])
const recentPosts = ref<Post[]>([])
const loading = ref(true)
const weeklyBars = ref<{ day: string; label: string; count: number; pct: number; isToday: boolean }[]>([])

function buildBars(weekly: { day: string; count: number }[]) {
  const todayKey = new Date().toISOString().slice(0, 10)
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const found = weekly.find(w => w.day === key)
    result.push({ day: key, label: labels[d.getDay()], count: found?.count || 0, pct: 0, isToday: key === todayKey })
  }
  const max = Math.max(...result.map(r => r.count), 1)
  result.forEach(r => { r.pct = Math.max(3, (r.count / max) * 100) })
  weeklyBars.value = result
}

onMounted(async () => {
  try {
    const [statsData, postsData] = await Promise.all([
      fetch<{ stats: Record<string, number>; weekly?: { day: string; count: number }[] }>('/api/stats'),
      fetch<{ posts: Post[] }>('/api/posts?status=all&limit=5'),
    ])
    const s = statsData.stats
    cards.value = [
      { label: '文章总数', value: s.posts, color: 'text-blue-600', link: '/admin/posts' },
      { label: '已发布', value: s.postsPublished, color: 'text-green-600', link: '/admin/posts' },
      { label: '今日访问', value: s.todayVisits, color: 'text-orange-600', link: '/admin/visits' },
      { label: '总访问量', value: s.totalVisits, color: 'text-purple-600', link: '/admin/visits' },
    ]
    recentPosts.value = postsData.posts || []
    if (statsData.weekly) buildBars(statsData.weekly)
  } catch {} finally { loading.value = false }
})
</script>
