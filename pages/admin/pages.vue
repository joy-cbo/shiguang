<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4">
      <input v-model="pageTitle" placeholder="页面标题" class="border rounded px-3 py-1.5 text-sm flex-1 dark:bg-gray-800 dark:border-gray-600" />
      <input v-model="pageSlug" placeholder="别名" class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
      <button @click="create" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">添加</button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="p in pages" :key="p.id" class="px-4 py-2 border-b dark:border-gray-700 text-sm">
        <template v-if="editingId === p.id">
          <div class="space-y-2">
            <div class="flex gap-2 items-center">
              <input v-model="editTitle" class="border rounded px-2 py-1 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600" />
              <input v-model="editSlug" class="border rounded px-2 py-1 text-sm w-32 dark:bg-gray-700 dark:border-gray-600" />
              <button @click="saveEdit(p.id)" class="text-green-500 hover:text-green-700">✓</button>
              <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <textarea v-model="editContent" rows="6" class="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="页面内容（HTML）"></textarea>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between">
            <span>{{ p.title }} <span class="text-gray-400 text-xs">/{{ p.slug }}</span></span>
            <div class="flex gap-2">
              <button @click="startEdit(p)" class="text-gray-400 hover:text-blue-500 text-xs">✎ 编辑</button>
              <button @click="remove(p.id)" class="text-red-400 text-xs">删除</button>
            </div>
          </div>
        </template>
      </div>
      <p v-if="!pages.length" class="text-gray-400 text-center py-8">暂无页面</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Page } from '~~/types'
const { fetch, handleError } = useApi()

const pageTitle = ref('')
const pageSlug = ref('')
const pages = ref<Page[]>([])
const editingId = ref<number | null>(null)
const editTitle = ref('')
const editSlug = ref('')
const editContent = ref('')

async function load() {
  const data = await fetch<{ pages: Page[] }>('/api/pages')
  pages.value = data.pages || []
}

async function create() {
  if (!pageTitle.value) return
  await fetch('/api/pages', { method: 'POST', body: { title: pageTitle.value, slug: pageSlug.value || undefined } })
  pageTitle.value = ''; pageSlug.value = ''
  load()
}

async function startEdit(p: any) {
  editingId.value = p.id
  editTitle.value = p.title
  editSlug.value = p.slug
  // Load full page content
  const data = await fetch<{ page: any }>(`/api/pages/${p.id}`)
  editContent.value = data.page?.content || ''
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  await fetch(`/api/pages/${id}`, {
    method: 'PUT',
    body: { title: editTitle.value, slug: editSlug.value, content: editContent.value },
  })
  editingId.value = null
  load()
}

async function remove(id: number) {
  await fetch(`/api/pages/${id}`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
