<template>
  <NuxtLayout name="default">
    <h1 class="text-2xl font-bold mb-6">标签：{{ route.params.name }}</h1>
    <div class="grid gap-6">
      <article v-for="post in posts" :key="post.id" class="border-b dark:border-gray-700 pb-4">
        <h2 class="text-lg font-semibold"><NuxtLink :to="`/posts/${post.slug}`" class="hover:text-purple-600">{{ post.title }}</NuxtLink></h2>
        <p class="text-sm text-gray-500">{{ formatDate(post.created_at) }}</p>
      </article>
    </div>
    <p v-if="!posts.length && !loading" class="text-gray-400 text-center py-20">暂无文章</p>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { formatDate } = useFormat()
const posts = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const data = await $fetch<{ posts: any[] }>(`/api/posts?tag=${route.params.name}`)
  posts.value = data.posts || []
  loading.value = false
})
</script>
