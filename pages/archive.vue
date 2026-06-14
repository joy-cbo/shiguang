<template>
  <NuxtLayout name="default">
    <h1 class="text-2xl font-bold mb-6">归档</h1>
    <div v-if="loading" class="text-gray-400">加载中...</div>
    <div v-else-if="!groups.length" class="text-gray-400">暂无文章</div>
    <div v-else v-for="g in groups" :key="g.year" class="mb-8">
      <h2 :class="'text-xl font-semibold mb-3 gradient-text'">{{ g.year }}</h2>
      <div v-for="m in g.months" :key="m.month" class="mb-4">
        <h3 class="text-sm text-purple-400 mb-2 ml-1">{{ m.month }}月</h3>
        <div class="space-y-2">
          <NuxtLink v-for="p in m.posts" :key="p.id" :to="`/posts/${p.slug}`" :class="'flex items-baseline justify-between group hover:bg-purple-50 px-3 py-2 rounded-xl transition-colors'">
            <span :class="'group-hover:text-purple-600 truncate mr-4'">{{ p.title }}</span>
            <span class="text-xs text-orange-400 shrink-0">{{ formatDate(p.created_at, 'M月d日') }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { formatDate } = useFormat()
const groups = ref<{ year: string; months: { month: string; posts: any[] }[] }[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch<{ posts: any[] }>('/api/posts?limit=500')
    const all = data.posts || []
    const map: Record<string, Record<string, any[]>> = {}
    for (const p of all) {
      const d = p.created_at || ''
      const year = d.slice(0, 4) || '未知'
      const month = d.slice(5, 7) || '??'
      if (!map[year]) map[year] = {}
      if (!map[year][month]) map[year][month] = []
      map[year][month].push(p)
    }
    groups.value = Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, months]) => ({
        year,
        months: Object.entries(months)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, posts]) => ({ month, posts })),
      }))
  } catch {} finally { loading.value = false }
})
</script>
