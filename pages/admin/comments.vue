<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4">
      <select v-model="filterStatus" @change="load" class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600">
        <option value="all">全部</option>
        <option value="pending">待审核</option>
        <option value="approved">已通过</option>
        <option value="spam">垃圾</option>
      </select>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left text-gray-500 border-b dark:border-gray-700">
          <th class="py-2 px-3 w-12">#</th>
          <th class="py-2 px-3">作者</th>
          <th class="py-2 px-3">内容</th>
          <th class="py-2 px-3">文章</th>
          <th class="py-2 px-3">状态</th>
          <th class="py-2 px-3">时间</th>
          <th class="py-2 px-3 w-32">操作</th>
        </tr></thead>
        <tbody>
          <tr v-for="c in comments" :key="c.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="py-2 px-3 text-gray-400">{{ c.id }}</td>
            <td class="py-2 px-3">
              <div class="font-medium">{{ c.author_name }}</div>
              <div class="text-xs text-gray-400">{{ c.author_email }}</div>
            </td>
            <td class="py-2 px-3 max-w-xs">
              <div>{{ c.content }}</div>
              <div v-if="replyId === c.id" class="mt-2 flex gap-2">
                <input v-model="replyText" placeholder="回复内容..." class="border rounded px-2 py-1 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600" @keyup.enter="submitReply(c)" />
                <button @click="submitReply(c)" class="text-green-500 hover:text-green-700 text-xs">发送</button>
                <button @click="replyId = null" class="text-gray-400 text-xs">取消</button>
              </div>
            </td>
            <td class="py-2 px-3">
              <span class="text-blue-500 max-w-[120px] truncate block">{{ c.post_title || '-' }}</span>
            </td>
            <td class="py-2 px-3">
              <span :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
            </td>
            <td class="py-2 px-3 text-gray-400 whitespace-nowrap">{{ formatDate(c.created_at) }}</td>
            <td class="py-2 px-3">
              <div class="flex gap-1 flex-wrap">
                <button @click="startReply(c)" class="text-blue-500 hover:text-blue-700 text-xs">回复</button>
                <button v-if="c.status !== 'approved'" @click="approve(c.id)" class="text-green-500 hover:text-green-700 text-xs">通过</button>
                <button v-if="c.status !== 'spam'" @click="spam(c.id)" class="text-yellow-600 hover:text-yellow-800 text-xs">垃圾</button>
                <button @click="remove(c.id)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!comments.length && !loading" class="text-gray-400 text-center py-8">暂无评论</p>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-4">
      <button v-for="p in totalPages" :key="p" @click="page = p; load()"
        class="px-3 py-1 rounded text-sm" :class="p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'">{{ p }}</button>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const { formatDate } = useFormat()

const comments = ref<any[]>([])
const filterStatus = ref('all')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const replyId = ref<number | null>(null)
const replyText = ref('')

async function load() {
  loading.value = true
  try {
    const data = await fetch<{ comments: any[]; totalPages: number }>(
      `/api/comments?status=${filterStatus.value}&page=${page.value}&limit=20`
    )
    comments.value = data.comments || []
    totalPages.value = data.totalPages || 1
  } finally { loading.value = false }
}

async function approve(id: number) {
  await fetch(`/api/comments/${id}`, { method: 'PUT', body: { status: 'approved' } })
  load()
}

async function spam(id: number) {
  await fetch(`/api/comments/${id}`, { method: 'PUT', body: { status: 'spam' } })
  load()
}

async function remove(id: number) {
  await fetch(`/api/comments/${id}`, { method: 'DELETE' })
  load()
}

function startReply(c: any) {
  replyId.value = c.id
  replyText.value = ''
}

async function submitReply(c: any) {
  if (!replyText.value.trim() || !c.post_slug) return
  try {
    await fetch(`/api/posts/${c.post_slug}/comments`, {
      method: 'POST',
      body: {
        author_name: 'Hermes',
        author_email: 'hermes@shiguang.blog',
        content: replyText.value.trim(),
        parent_id: c.parent_id ? c.id : null, // reply to parent if this is nested, else reply to this comment
      },
    })
    replyId.value = null
    replyText.value = ''
    load()
  } catch (e) { console.error('[评论管理] 操作失败:', e) }
}

function statusClass(s: string) {
  return {
    approved: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded text-xs',
    pending: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 px-1.5 py-0.5 rounded text-xs',
    spam: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded text-xs',
  }[s] || ''
}

function statusLabel(s: string) {
  return { approved: '已通过', pending: '待审', spam: '垃圾' }[s] || s
}

onMounted(load)
</script>
