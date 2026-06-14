<template>
  <NuxtLayout name="default">
    <div v-if="loading" class="text-center py-20 text-gray-400">加载中...</div>
    <template v-else-if="post">
      <!-- 阅读进度条 -->
      <div class="fixed top-0 left-0 h-0.5 gradient-bg z-50" :style="{ width: progress + '%' }"></div>

      <!-- 面包屑 -->
      <Breadcrumb :items="breadcrumbs" />

      <!-- 封面图 -->
      <img :src="post.cover || `https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev/cover/${post.slug}.svg`" :alt="post.title" loading="lazy" class="w-full h-48 sm:h-64 object-cover rounded-xl mb-6 bg-gray-200 dark:bg-gray-700" />

      <h1 class="text-2xl md:text-3xl font-bold mb-3">{{ post.title }}</h1>
      <p class="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <img v-if="post.author_avatar" :src="post.author_avatar" class="w-5 h-5 rounded-full" />
        <NuxtLink v-if="post.author_id" :to="`/author/${post.author_id}`" class="hover:text-purple-600">{{ post.author_nickname || '匿名' }}</NuxtLink>
        <span>·</span>
        <span>{{ formatDate(post.created_at) }}</span>
        <span>·</span>
        <span>{{ post.view_count || 0 }} 次阅读</span>
        <span>·</span>
        <span>⏱ {{ readingTime(post.content) }}</span>
        <NuxtLink v-if="post.category_name" :to="`/categories/${post.category_slug}`" :class="'text-purple-500 ml-1 inline-flex items-center gap-0.5'" class><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> {{ post.category_name }}</NuxtLink>
      </p>

      <!-- 标签 -->
      <div v-if="post.tags?.length" class="flex gap-1 mb-4 flex-wrap">
        <NuxtLink v-for="t in post.tags" :key="t.id" :to="`/tags/${t.slug}`" :class="'bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-xs hover:bg-purple-100'" class>{{ t.name }}</NuxtLink>
      </div>

      <div class="flex gap-8">
        <!-- 正文 -->
        <div class="flex-1 min-w-0">
          <div v-html="renderedContent" class="prose dark:prose-invert max-w-none mb-10"></div>
        </div>
        <!-- 目录侧边栏 -->
        <aside class="hidden lg:block w-56 shrink-0">
          <div class="sticky top-20">
            <TableOfContents />
          </div>
        </aside>
      </div>

      <!-- 文章系列 -->
      <div v-if="post.series" :class="'mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100'" class>
        <p :class="'text-xs text-purple-500 mb-2'" class><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 本系列</p>
        <NuxtLink :to="`/series/${post.series.slug}`" :class="'font-semibold text-purple-600 hover:underline'" class>{{ post.series.name }}</NuxtLink>
      </div>

      <!-- 作者卡片 -->
      <div class="border-t dark:border-gray-700 pt-6 mt-6 mb-8">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xl">
            {{ (post.author_nickname || '匿')[0] }}
          </div>
          <div>
            <NuxtLink :to="`/author/${post.author_id}`" class="font-semibold hover:text-purple-600">{{ post.author_nickname || '匿名' }}</NuxtLink>
            <p class="text-xs text-gray-500">{{ post.author_nickname ? '博客作者' : '' }}</p>
          </div>
        </div>
      </div>

      <!-- 上一篇/下一篇 -->
      <div v-if="prev || next" class="flex justify-between border-t dark:border-gray-700 pt-4 mb-8 text-sm">
        <NuxtLink v-if="prev" :to="`/posts/${prev.slug}`" class="text-purple-500 hover:underline">← {{ prev.title }}</NuxtLink>
        <span v-else class="text-gray-400"></span>
        <NuxtLink v-if="next" :to="`/posts/${next.slug}`" class="text-purple-500 hover:underline">{{ next.title }} →</NuxtLink>
        <span v-else class="text-gray-400"></span>
      </div>
    </template>

    <!-- 回到顶部 -->
    <button v-if="showTop" @click="scrollTop" aria-label="回到顶部" class="fixed bottom-6 right-6 w-10 h-10 gradient-bg text-white rounded-full shadow-lg hover:shadow-xl text-lg z-40 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M12 5L6 11M12 5L18 11"/></svg></button>

    <!-- 手机端目录按钮 -->
    <button @click="tocOpen = true" class="lg:hidden fixed bottom-20 right-6 w-10 h-10 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-full shadow-lg text-lg z-40 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg></button>

    <!-- 手机端目录面板 -->
    <Teleport to="body">
      <Transition name="toc-slide">
        <div v-if="tocOpen" class="fixed inset-0 z-50 bg-black/50 flex justify-end" @click.self="tocOpen = false">
          <div class="w-72 max-w-[85vw] h-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-sm text-gray-500 uppercase tracking-wider">目录</h3>
              <button @click="tocOpen = false" class="text-gray-400 hover:text-purple-600 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
            </div>
            <nav class="space-y-1 text-sm">
              <a v-for="h in tocHeadings" :key="h.id"
                :href="`#${h.id}`"
                @click.prevent="scrollToHeading(h.id); tocOpen = false"
                :style="{ paddingLeft: (h.level - 1) * 12 + 'px' }"
                class="block py-1.5 text-gray-700 dark:text-gray-300 hover:text-purple-600 transition-colors border-l-2"
                :class="h.level === 1 ? 'font-semibold border-transparent hover:border-purple-400' : 'border-transparent hover:border-purple-300'">
                {{ h.text }}
              </a>
            </nav>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 相关文章 -->
    <RelatedPosts :post-id="post?.id || 0" />

    <!-- 评论区 -->
    <CommentSection :slug="route.params.slug as string" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { Post } from '~/types'

const route = useRoute()
const slug = route.params.slug as string
const { formatDate, readingTime } = useFormat()
const { prev, next, fetchNav } = usePostNav()
const showTop = ref(false)
const progress = ref(0)
const tocOpen = ref(false)
const tocHeadings = ref<Array<{ id: string; text: string; level: number }>>([])

// ===== SSR 数据获取：useFetch 在服务端直出 HTML，爬虫可见 =====
const { data, pending: loading } = await useFetch<{ post: Post }>(`/api/posts/${slug}`)
const post = computed(() => data.value?.post || null)

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  const html = marked(post.value.content)
  // DOMPurify 需要浏览器 DOM，SSR 时跳过（客户端 hydration 后会重新 purify）
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html)
})

const breadcrumbs = computed(() => {
  const items: { label: string; to?: string }[] = []
  if (post.value?.category_name) {
    items.push({ label: post.value.category_name, to: `/categories/${post.value.category_slug}` })
  }
  items.push({ label: post.value?.title || '' })
  return items
})

// 转 D1 UTC 时间为 ISO 8601 北京时间（给 JSON-LD/SEO 用）
function toISO8601(d1Date: string): string {
  if (!d1Date) return ''
  const d = new Date(d1Date.replace(' ', 'T') + 'Z')
  d.setHours(d.getHours() + 8)
  return d.toISOString().slice(0, 19) + '+08:00'
}

// ===== SEO meta：computed 响应 post 数据，SSR 时直接输出到 <head> =====
const articleHead = computed(() => {
  const p = post.value
  if (!p) return { title: '加载中... - 拾光博客' }
  const desc = p.excerpt || p.content?.replace(/<[^>]*>/g, '').slice(0, 160) || ''
  const cover = p.cover || `https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev/cover/${slug}.svg`
  return {
    title: p.title,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: p.title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'article' },
      { property: 'og:image', content: cover },
      { property: 'og:url', content: `https://openxiaobai.work/posts/${slug}` },
      { property: 'article:published_time', content: toISO8601(p.created_at) },
      { property: 'article:author', content: p.author_nickname || '拾光' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: p.title },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: cover },
    ],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: p.title,
        description: desc,
        image: cover,
        datePublished: toISO8601(p.created_at),
        dateModified: toISO8601(p.updated_at || p.created_at),
        author: { '@type': 'Person', name: p.author_nickname || '拾光' },
      }),
    }],
  }
})
useHead(articleHead)

// ===== 客户端专属逻辑 =====
let scrollTicking = false
function handleScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      progress.value = h > 0 ? Math.round((window.scrollY / h) * 100) : 0
      showTop.value = window.scrollY > 500
      scrollTicking = false
    })
    scrollTicking = true
  }
}

onMounted(() => {
  if (post.value?.id) fetchNav(post.value.id)

  window.addEventListener('scroll', handleScroll, { passive: true })

  // 提取正文标题作为手机目录
  nextTick(() => {
    const article = document.querySelector('.prose')
    if (!article) return
    const headings = article.querySelectorAll('h1, h2, h3, h4')
    headings.forEach((h, i) => {
      if (!h.id) h.id = `toc-${i}`
      tocHeadings.value.push({
        id: h.id,
        text: h.textContent || '',
        level: parseInt(h.tagName.charAt(1))
      })
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.toc-slide-enter-active { transition: all 0.25s ease; }
.toc-slide-leave-active { transition: all 0.2s ease; }
.toc-slide-enter-from { opacity: 0; }
.toc-slide-enter-from > div { transform: translateX(100%); transition: transform 0.25s ease; }
.toc-slide-leave-to > div { transform: translateX(100%); transition: transform 0.2s ease; }
.toc-slide-leave-to { opacity: 0; }
</style>
