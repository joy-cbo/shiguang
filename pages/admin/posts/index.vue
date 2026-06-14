<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4 flex-wrap">
      <input v-model="search" @keyup.enter="fetchPosts(1)" placeholder="搜索文章..." class="border rounded px-3 py-1.5 text-sm flex-1 min-w-[120px] dark:bg-gray-800 dark:border-gray-600" />
      <select v-model="statusFilter" @change="fetchPosts(1)" class="border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600">
        <option value="all">全部</option><option value="published">已发布</option><option value="draft">草稿</option><option value="deleted">回收站</option>
      </select>
      <NuxtLink to="/admin/posts/write" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">写文章</NuxtLink>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="checked.length" class="flex gap-2 mb-3 items-center text-sm">
      <span class="text-gray-500">已选 {{ checked.length }} 篇</span>
      <button @click="batchAction('publish')" class="px-2 py-1 border rounded hover:bg-green-50 dark:border-gray-600 text-xs"><IconShiguang name="check" size="14" class="inline align-[-2px] mr-0.5 text-green-500"/>批量发布</button>
      <button @click="batchAction('draft')" class="px-2 py-1 border rounded hover:bg-yellow-50 dark:border-gray-600 text-xs"><IconShiguang name="edit" size="14" class="inline align-[-2px] mr-0.5 text-yellow-500"/>转草稿</button>
      <button @click="batchAction('delete')" class="px-2 py-1 border rounded hover:bg-red-50 dark:border-gray-600 text-xs">🗑 批量删除</button>
      <select v-model="batchCategory" class="border rounded px-2 py-1 text-xs dark:bg-gray-800 dark:border-gray-600">
        <option value="">移动分类…</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button v-if="batchCategory" @click="batchAction('category')" class="px-2 py-1 bg-blue-600 text-white rounded text-xs">移动</button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left text-gray-500 border-b dark:border-gray-700">
          <th class="py-2 px-3 w-8"><input type="checkbox" @change="toggleAll" :checked="allChecked" /></th>
          <th class="py-2 px-3">标题</th><th>分类</th><th>系列</th><th>状态</th><th>时间</th><th>操作</th>
        </tr></thead>
        <tbody>
          <tr v-for="p in posts" :key="p.id" class="border-b dark:border-gray-700">
            <td class="py-2 px-3"><input type="checkbox" :value="p.id" v-model="checked" /></td>
            <td class="py-2 px-3 max-w-xs truncate">
              <span v-if="p.is_pinned" class="text-orange-500 mr-1 inline-flex align-[-3px]" title="置顶"><IconShiguang name="pin" size="14"/></span>{{ p.title }}
            </td>
            <td class="text-gray-500">{{ p.category_name || '-' }}</td>
            <td class="text-gray-500">-</td>
            <td>{{ p.status === 'published' ? `<IconShiguang name='check' size='16' class='text-green-500 inline'/>` : `<IconShiguang name='edit' size='16' class='text-yellow-500 inline'/>` }}</td>
            <td class="text-gray-400">{{ formatDate(p.created_at) }}</td>
            <td class="space-x-1">
              <NuxtLink :to="`/admin/posts/edit-${p.id}`" class="text-blue-500 text-xs">编辑</NuxtLink>
              <button v-if="p.status !== 'deleted'" @click="doDelete(p.id)" class="text-red-400 text-xs">删除</button>
              <button v-else @click="doRestore(p.id)" class="text-green-500 text-xs">恢复</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!posts.length" class="text-gray-400 text-center py-8">暂无文章</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from '~~/types'
const { formatDate } = useFormat()
const { fetch, handleError } = useApi()

const search = ref('')
const statusFilter = ref('all')
const posts = ref<Post[]>([])
const checked = ref<number[]>([])
const batchCategory = ref('')
const categories = ref<Array<{ id: number; name: string }>>([])
const allChecked = computed(() => posts.value.length > 0 && checked.value.length === posts.value.length)

function toggleAll(e: Event) {
  const target = e.target as HTMLInputElement
  checked.value = target.checked ? posts.value.map(p => p.id) : []
}

async function fetchPosts() {
  const data = await fetch<{ posts: Post[] }>('/api/posts', {
    params: { status: statusFilter.value, search: search.value || undefined },
  })
  posts.value = data.posts || []
  checked.value = []
}

async function batchAction(action: string) {
  if (!checked.value.length) return
  if (action === 'delete' && !confirm(`确定删除 ${checked.value.length} 篇文章？`)) return
  await fetch('/api/posts/batch', {
    method: 'POST',
    body: { ids: checked.value, action, category_id: action === 'category' ? parseInt(batchCategory.value) : undefined },
  })
  batchCategory.value = ''
  fetchPosts()
}

async function doDelete(id: number) {
  await fetch(`/api/posts/${id}`, { method: 'DELETE' })
  fetchPosts()
}

async function doRestore(id: number) {
  await fetch(`/api/posts/${id}/restore`, { method: 'POST' })
  fetchPosts()
}

onMounted(async () => {
  await fetchPosts()
  // 加载分类列表
  const data = await $fetch<{ categories: any[] }>('/api/categories')
  categories.value = data.categories || []
})
</script>
