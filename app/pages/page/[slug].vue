<template>
  <NuxtLayout name="default">
    <div v-if="loading" class="text-center py-20 text-gray-400">加载中...</div>
    <template v-else-if="page">
      <h1 class="text-3xl font-bold mb-6">{{ page.title }}</h1>
      <div v-html="renderedContent" class="prose dark:prose-invert max-w-none"></div>
    </template>
    <div v-else class="text-center py-20 text-gray-400">页面不存在</div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { sanitizeHtml } from '~/composables/useSanitize'

const route = useRoute()
const page = ref<any>(null)
const loading = ref(true)

const renderedContent = computed(() => {
  if (!page.value?.content) return ''
  // 使用统一的消毒函数，SSR 和客户端都安全
  return sanitizeHtml(marked(page.value.content))
})

onMounted(async () => {
  try {
    const data = await $fetch<{ page: any }>(`/api/pages/${route.params.slug}`)
    page.value = data.page
  } catch {}
  loading.value = false
})
</script>
