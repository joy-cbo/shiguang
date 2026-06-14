<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4">
      <input v-model="name" placeholder="分类名" class="border rounded px-3 py-1.5 text-sm flex-1 dark:bg-gray-800 dark:border-gray-600" />
      <input v-model="catSlug" placeholder="别名（可选）" class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
      <button @click="create" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">添加</button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="c in categories" :key="c.id" class="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 text-sm">
        <template v-if="editingId === c.id">
          <div class="flex gap-2 items-center">
            <input v-model="editName" class="border rounded px-2 py-0.5 w-24 text-sm dark:bg-gray-700 dark:border-gray-600" @keyup.enter="saveEdit(c.id)" @keyup.escape="cancelEdit" />
            <button @click="saveEdit(c.id)" class="text-green-500 hover:text-green-700">✓</button>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </template>
        <template v-else>
          <span>
            <span class="cursor-pointer hover:text-blue-500" @click="startEdit(c)">{{ c.name }}</span>
            <span class="text-gray-400"> ({{ c.post_count || 0 }})</span>
          </span>
          <div class="flex gap-2 items-center">
            <button @click="startEdit(c)" class="text-gray-400 hover:text-blue-500 text-xs">✎ 编辑</button>
            <button @click="remove(c.id)" class="text-red-400 text-xs">删除</button>
          </div>
        </template>
      </div>
      <p v-if="!categories.length" class="text-gray-400 text-center py-8">暂无分类</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Category } from '~/types'
const { fetch, handleError } = useApi()

const name = ref('')
const catSlug = ref('')
const categories = ref<Category[]>([])
const editingId = ref<number | null>(null)
const editName = ref('')

async function load() {
  const data = await fetch<{ categories: Category[] }>('/api/categories')
  categories.value = data.categories || []
}

async function create() {
  if (!name.value) return
  await fetch('/api/categories', {
    method: 'POST',
    body: { name: name.value, slug: catSlug.value || undefined },
  })
  name.value = ''; catSlug.value = ''
  load()
}

function startEdit(c: Category) {
  editingId.value = c.id
  editName.value = c.name
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

async function saveEdit(id: number) {
  if (!editName.value.trim()) return
  await fetch(`/api/categories/${id}`, { method: 'PUT', body: { name: editName.value.trim() } })
  editingId.value = null
  editName.value = ''
  load()
}

async function remove(id: number) {
  await fetch(`/api/categories/${id}`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
