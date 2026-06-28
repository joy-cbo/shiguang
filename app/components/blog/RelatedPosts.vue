<template>
  <div v-if="posts.length" class="border-t dark:border-gray-700 pt-6 mt-6">
    <h3 class="font-semibold mb-4">相关文章</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink v-for="p in posts" :key="p.id" :to="`/posts/${p.slug}`" :class="'group block bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300'">
        <img v-if="p.cover" :src="p.cover" :alt="p.title" loading="lazy" class="w-full h-24 object-cover" />
        <div class="p-3">
          <p class="text-sm font-medium group-hover:text-purple-600 line-clamp-2">{{ p.title }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ formatDate(p.created_at, 'yyyy-MM-dd') }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RelatedPost } from '~/types'

const props = defineProps<{ postId: number }>()
const { formatDate } = useFormat()

const posts = ref<RelatedPost[]>([])

watch(() => props.postId, async (id) => {
  if (!id) return
  try {
    const data = await $fetch<{ related: RelatedPost[] }>(`/api/posts/${id}/related`)
    posts.value = data.related || []
  } catch {}
}, { immediate: true })
</script>
