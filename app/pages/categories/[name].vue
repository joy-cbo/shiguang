<template>
  <NuxtLayout name="default">
    <div v-if="loading" class="text-center py-20 text-gray-400">加载中...</div>
    <template v-else>
      <!-- 标签云 -->
      <div class="flex flex-wrap gap-2 mb-8" v-if="tags.length">
        <NuxtLink v-for="t in tags" :key="t.id" :to="`/tags/${t.slug}`"
          class="px-3 py-1 rounded-full text-sm border dark:border-gray-600" :class="{ 'gradient-bg text-white border-transparent': route.params.name === t.slug, 'hover:bg-purple-50 dark:hover:bg-purple-900/20': route.params.name !== t.slug }">
          {{ t.name }} ({{ t.post_count }})
        </NuxtLink>
      </div>
      <h1 class="text-2xl font-bold mb-6">分类：{{ route.params.name }}</h1>
      <div class="grid gap-6">
        <article v-for="post in posts" :key="post.id" class="border-b dark:border-gray-700 pb-4">
          <h2 class="text-lg font-semibold"><NuxtLink :to="`/posts/${post.slug}`" class="hover:text-purple-600">{{ post.title }}</NuxtLink></h2>
          <p class="text-sm text-gray-500">{{ formatDate(post.created_at) }}</p>
        </article>
      </div>
      <p v-if="!posts.length && !loading" class="text-gray-400 text-center py-20">暂无文章</p>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { formatDate } = useFormat()
const { tags, fetchTags } = useTagCloud()
const posts = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const [postsData] = await Promise.all([
    $fetch<{ posts: any[] }>(`/api/posts?category=${route.params.name}`),
    fetchTags(),
  ])
  posts.value = postsData.posts || []
  loading.value = false
})
</script>
