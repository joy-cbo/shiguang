// 文章详情页 — 上一篇/下一篇导航 composable
export function usePostNav() {
  const prev = ref<{ slug: string; title: string } | null>(null)
  const next = ref<{ slug: string; title: string } | null>(null)

  async function fetchNav(currentId: number) {
    try {
      const [prevData, nextData] = await Promise.all([
        $fetch<{ posts: Array<{ id: number; slug: string; title: string }> }>(
          `/api/posts?status=published&limit=1&before=${currentId}`
        ),
        $fetch<{ posts: Array<{ id: number; slug: string; title: string }> }>(
          `/api/posts?status=published&limit=1&after=${currentId}`
        ),
      ])
      prev.value = prevData.posts?.[0] ? { slug: prevData.posts[0].slug, title: prevData.posts[0].title } : null
      next.value = nextData.posts?.[0] ? { slug: nextData.posts[0].slug, title: nextData.posts[0].title } : null
    } catch {}
  }

  return { prev, next, fetchNav }
}
