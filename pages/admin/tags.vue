<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4">
      <input v-model="name" placeholder="标签名" class="border rounded px-3 py-1.5 text-sm flex-1 dark:bg-gray-800 dark:border-gray-600" />
      <button @click="create" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">添加</button>
    </div>
    <div class="flex flex-wrap gap-2">
      <span v-for="t in tags" :key="t.id" class="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded text-sm flex items-center gap-2">
        <template v-if="editingId === t.id">
          <input v-model="editName" class="border rounded px-2 py-0.5 w-24 text-sm dark:bg-gray-700 dark:border-gray-600" @keyup.enter="saveEdit(t.id)" @keyup.escape="cancelEdit" />
          <button @click="saveEdit(t.id)" class="text-green-500 hover:text-green-700">✓</button>
          <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">✕</button>
        </template>
        <template v-else>
          <span class="cursor-pointer hover:text-blue-500" @click="startEdit(t)">{{ t.name }}</span>
          <span class="text-gray-400">({{ t.post_count || 0 }})</span>
          <button @click="startEdit(t)" class="text-gray-400 hover:text-blue-500 ml-1">✎</button>
          <button @click="remove(t.id)" class="text-red-400 hover:text-red-600">×</button>
        </template>
      </span>
      <p v-if="!tags.length" class="text-gray-400 w-full text-center py-8">暂无标签</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Tag } from '~~/types'
const { fetch, handleError } = useApi()

const name = ref('')
const tags = ref<Tag[]>([])
const editingId = ref<number | null>(null)
const editName = ref('')

async function load() {
  const data = await fetch<{ tags: Tag[] }>('/api/tags')
  tags.value = data.tags || []
}

async function create() {
  if (!name.value) return
  await fetch('/api/tags', { method: 'POST', body: { name: name.value } })
  name.value = ''
  load()
}

function startEdit(t: Tag) {
  editingId.value = t.id
  editName.value = t.name
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

async function saveEdit(id: number) {
  if (!editName.value.trim()) return
  await fetch(`/api/tags/${id}`, { method: 'PUT', body: { name: editName.value.trim() } })
  editingId.value = null
  editName.value = ''
  load()
}

async function remove(id: number) {
  await fetch(`/api/tags/${id}`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
