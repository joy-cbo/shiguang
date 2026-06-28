<template>
  <NuxtLayout name="default">
    <!-- ===== 加载动画：Logo 唱片旋转 ===== -->
    <div v-if="showLoading" class="flex flex-col items-center justify-center py-20">
      <img src="/logo-spin.svg" alt="加载中" class="w-40 h-36" />
    </div>

    <!-- ===== 内容区（加载完成后显示） ===== -->
    <template v-if="!showLoading">
      <!-- 英雄区 -->
      <div v-if="heroPost" class="mb-10">
        <NuxtLink :to="`/posts/${heroPost.slug}`" class="group block relative overflow-hidden rounded-2xl h-64 md:h-80 bg-gray-200 dark:bg-gray-700 hover:shadow-xl transition-all duration-300">
          <img :src="heroPost.cover || getCoverUrl(heroPost.slug)" :alt="heroPost.title" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div v-if="heroPost.is_pinned" class="inline-flex items-center gap-1 bg-orange-500/90 text-white text-xs px-2.5 py-1 rounded-full mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg> 置顶</div>
            <div v-if="heroPost.category_name" class="text-xs text-white/80 mb-2 uppercase tracking-wider">{{ heroPost.category_name }}</div>
            <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-orange-400 transition-all duration-300">{{ heroPost.title }}</h2>
            <p class="text-white/70 text-sm md:text-base max-w-2xl">{{ stripHtml(heroPost.excerpt || heroPost.content).slice(0, 160) }}</p>
            <div class="flex items-center gap-3 mt-4 text-xs text-white/60">
              <span>{{ heroPost.author_nickname || '匿名' }}</span>
              <span>·</span>
              <span>{{ formatDate(heroPost.created_at) }}</span>
              <span>·</span>
              <span>⏱ {{ readingTime(heroPost.content) }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 文章卡片网格 -->
        <div class="flex-1 min-w-0">
          <TransitionGroup name="fade" tag="div" class="grid sm:grid-cols-2 gap-5">
            <article v-for="post in gridPosts" :key="post.id" :class="'bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group'">
              <NuxtLink :to="`/posts/${post.slug}`">
                <img :src="post.cover || getCoverUrl(post.slug)" :alt="post.title" class="w-full h-36 object-cover bg-gray-100 dark:bg-gray-700" loading="lazy" />
              </NuxtLink>
              <div class="p-4">
                <div v-if="post.is_pinned" class="text-orange-500 text-xs mb-1 inline-flex items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg> 置顶</div>
                <h2 class="font-semibold mb-2 line-clamp-2">
                  <NuxtLink :to="`/posts/${post.slug}`" class="group-hover:text-purple-600 transition-colors">{{ post.title }}</NuxtLink>
                </h2>
                <p class="text-xs text-gray-500 mb-2">
                  <span>{{ post.author_nickname || '匿名' }}</span>
                  <span v-if="post.category_name"> · <NuxtLink :to="`/categories/${post.category_slug}`" class="text-purple-500">{{ post.category_name }}</NuxtLink></span>
                </p>
                <p class="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-2">{{ stripHtml(post.excerpt || post.content).slice(0, 120) }}</p>
                <div class="flex items-center justify-between text-xs text-gray-400">
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span>⏱ {{ readingTime(post.content) }}</span>
                </div>
              </div>
            </article>
          </TransitionGroup>

          <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-10">
            <button v-for="p in totalPages" :key="p" @click="goPage(p)" :class="page===p ? 'px-3 py-1.5 rounded-lg text-sm text-white gradient-bg transition-all' : 'px-3 py-1.5 rounded text-sm transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'">{{ p }}</button>
          </div>
        </div>

        <!-- 侧边栏 -->
        <aside class="w-full lg:w-64 shrink-0 space-y-6">
          <div v-if="recentPosts.length">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">最新文章</h3>
            <ul class="space-y-2">
              <li v-for="r in recentPosts" :key="r.id">
                <NuxtLink :to="`/posts/${r.slug}`" class="text-sm hover:text-purple-600 line-clamp-1">{{ r.title }}</NuxtLink>
                <p class="text-xs text-gray-400">{{ formatDate(r.created_at) }}</p>
              </li>
            </ul>
          </div>

          <div v-if="tagCloud.length">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">标签云</h3>
            <div class="flex flex-wrap gap-1">
              <NuxtLink v-for="t in tagCloud" :key="t.id" :to="`/tags/${t.slug}`"
                class="px-2 py-0.5 rounded text-xs hover:bg-purple-100"
                :class="[tagSizeClass(t.post_count), tagSaasColor(t.post_count)]">
                {{ t.name }}
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">

const { formatDate, stripHtml, readingTime } = useFormat()
const { tags: tagCloud } = useTagCloud()

const page = ref(1)
const totalPages = ref(1)
const showLoading = ref(true)

// 文章列表（逐个淡入）
const heroPost = ref<any>(null)
const gridPosts = ref<any[]>([])
const recentPosts = ref<Array<{ id: number; title: string; slug: string; created_at: string }>>([])

function getCoverUrl(slug?: string) { return '' }

function tagSizeClass(count: number) {
  if (count >= 10) return 'text-sm font-bold'
  if (count >= 5) return 'text-xs font-semibold'
  if (count >= 2) return 'text-xs'
  return 'text-xs text-gray-500'
}
function tagSaasColor(count: number) { if (count >= 10) return 'bg-purple-100 text-purple-700'; if (count >= 5) return 'bg-purple-50 text-purple-600'; if (count >= 2) return 'bg-gray-50 text-gray-500'; return 'text-gray-400' }
function tagBg(count: number) {
  if (count >= 10) return '#dbeafe'
  if (count >= 5) return '#e0e7ff'
  if (count >= 2) return '#f3f4f6'
  return 'transparent'
}

async function loadPage(p: number) {
  showLoading.value = true
  heroPost.value = null
  gridPosts.value = []
  
  // 一次请求替代原来的 3 次：/api/home 返回 posts + tags + recent
  const data = await $fetch<{ posts: any[]; totalPages: number; tags: any[]; recent: any[] }>(
    `/api/home?page=${p}`
  )
  
  const allPosts = data.posts || []
  totalPages.value = data.totalPages || 1
  
  // 标签云
  tagCloud.value = data.tags || []
  
  // 隐藏加载动画
  showLoading.value = false
  await nextTick()
  
  // 第1页：英雄卡片先出
  if (p === 1 && allPosts.length > 0) {
    heroPost.value = allPosts[0]
    await new Promise(r => setTimeout(r, 120))
  }
  
  // 其余卡片逐个出
  const rest = p === 1 ? allPosts.slice(1) : allPosts
  for (const post of rest) {
    gridPosts.value.push(post)
    await new Promise(r => setTimeout(r, 100))
  }
  
  // 侧边栏最近文章
  recentPosts.value = data.recent || []
}

function goPage(p: number) {
  page.value = p
  loadPage(p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await loadPage(1)
})
</script>

<style scoped>
/* 淡入动画 */
.fade-enter-active { transition: opacity 0.4s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(12px); }
</style>
