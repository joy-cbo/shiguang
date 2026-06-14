<template>
  <NuxtLayout name="default">
    <div v-if="loading" class="text-center py-20 text-gray-400">加载中...</div>
    <template v-else-if="author">
      <!-- 作者卡片 -->
      <div class="max-w-2xl mx-auto mb-10">
        <div class="flex items-start gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <img v-if="author.avatar" :src="author.avatar" class="w-20 h-20 rounded-full object-cover shrink-0" />
          <div v-else class="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-3xl shrink-0">
            {{ (author.nickname || author.username)[0] }}
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ author.nickname || author.username }}</h1>
            <p class="text-sm text-gray-500 mt-1">@{{ author.username }} · {{ author.post_count }} 篇文章 · 加入于 {{ formatDate(author.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- 文章列表 -->
      <div v-if="posts.length" class="grid gap-6 max-w-2xl mx-auto">
        <article v-for="p in posts" :key="p.id" class="border-b dark:border-gray-700 pb-6 flex gap-4">
          <NuxtLink :to="`/posts/${p.slug}`" class="shrink-0 hidden sm:block">
            <img :src="p.cover || `https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev/cover/${p.slug}.svg`" :alt="p.title" class="w-32 h-20 object-cover rounded-lg bg-gray-200 dark:bg-gray-700" />
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold mb-1">
              <NuxtLink :to="`/posts/${p.slug}`" class="hover:text-purple-600">{{ p.title }}</NuxtLink>
            </h2>
            <p class="text-xs text-gray-500 mb-2">{{ formatDate(p.created_at) }} · {{ p.view_count || 0 }} 次阅读</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{{ stripHtml(p.excerpt || '').slice(0, 150) }}</p>
          </div>
        </article>
      </div>
      <div v-else class="text-center py-10 text-gray-400">作者还没有发布文章</div>
    </template>
    <div v-else class="text-center py-20 text-gray-400">作者不存在</div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { formatDate, stripHtml } = useFormat()
const author = ref<any>(null)
const posts = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch<{ author: any; posts: any[] }>(`/api/authors/${route.params.id}`)
    author.value = data.author
    posts.value = data.posts || []
  } catch (e) { console.error('[作者页] 加载失败:', e) }
  loading.value = false
})

useHead(() => ({
  title: author.value ? `${author.value.nickname || author.value.username} - 拾光博客` : '拾光博客'
}))
</script>
