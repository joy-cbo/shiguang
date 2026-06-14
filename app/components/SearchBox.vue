<!-- 搜索框组件 — 输入时实时下拉预览，回车进结果页 -->
<template>
  <div class="relative" ref="container">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input
      v-model="query"
      @input="onInput"
      @keydown.escape="close"
      @keydown.enter.prevent="goSearch"
      @focus="onFocus"
      placeholder="搜索文章…"
      class="w-40 lg:w-48 pl-9 pr-3 py-1.5 text-sm border rounded-full dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
    />
    <ul v-if="open && results.length" class="absolute top-full mt-1 right-0 w-72 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
      <li v-for="r in results" :key="r.id" class="border-b dark:border-gray-700 last:border-0">
        <NuxtLink :to="`/posts/${r.slug}`" @click="close" class="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
          <p class="text-sm font-medium truncate">{{ r.title }}</p>
          <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ r.snippet }}</p>
        </NuxtLink>
      </li>
      <li class="px-4 py-2 text-center">
        <NuxtLink :to="`/search?q=${encodeURIComponent(query)}`" @click="close" class="text-xs text-purple-500 hover:underline">查看全部结果 →</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const query = ref('')
const results = ref<any[]>([])
const open = ref(false)
const container = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout>

function onFocus() { if (results.value.length) open.value = true }
function onInput() {
  clearTimeout(timer)
  const q = query.value.trim()
  if (q.length < 2) { results.value = []; open.value = false; return }
  timer = setTimeout(async () => {
    try {
      const data = await $fetch<{ results: any[] }>(`/api/search?q=${encodeURIComponent(q)}`)
      results.value = data.results || []
      open.value = results.value.length > 0
    } catch { results.value = []; open.value = false }
  }, 300)
}

function goSearch() {
  if (!query.value.trim()) return
  open.value = false
  navigateTo(`/search?q=${encodeURIComponent(query.value.trim())}`)
}

function close() { open.value = false }

// 点击外部关闭
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (container.value && !container.value.contains(e.target as Node)) open.value = false
  })
})
</script>
