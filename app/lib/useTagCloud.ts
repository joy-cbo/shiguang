// 标签云 composable
export function useTagCloud() {
  const tags = ref<Array<{ id: number; name: string; slug: string; post_count: number }>>([])

  async function fetchTags() {
    try {
      const data = await $fetch<{ tags: any[] }>('/api/tags')
      tags.value = data.tags || []
    } catch {}
  }

  return { tags, fetchTags }
}
