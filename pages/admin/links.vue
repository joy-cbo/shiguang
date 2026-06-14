<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4">
      <input v-model="linkName" placeholder="名称" class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
      <input v-model="linkUrl" placeholder="链接" class="border rounded px-3 py-1.5 text-sm flex-1 dark:bg-gray-800 dark:border-gray-600" />
      <button @click="add" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">添加</button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="l in links" :key="l.id" class="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 text-sm">
        <template v-if="editingId === l.id">
          <div class="flex gap-2 items-center flex-1">
            <input v-model="editName" placeholder="名称" class="border rounded px-2 py-1 text-sm w-24 dark:bg-gray-700 dark:border-gray-600" />
            <input v-model="editUrl" placeholder="链接" class="border rounded px-2 py-1 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600" />
            <button @click="saveEdit(l.id)" class="text-green-500 hover:text-green-700">✓</button>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </template>
        <template v-else>
          <span>{{ l.name }} <a :href="l.url" target="_blank" class="text-blue-400 text-xs">{{ l.url }}</a></span>
          <div class="flex gap-2">
            <button @click="startEdit(l)" class="text-gray-400 hover:text-blue-500 text-xs">✎ 编辑</button>
            <button @click="remove(l.id)" class="text-red-400 text-xs">删除</button>
          </div>
        </template>
      </div>
      <p v-if="!links.length" class="text-gray-400 text-center py-8">暂无友链</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Link } from '~~/types'
const { fetch, handleError } = useApi()

const linkName = ref('')
const linkUrl = ref('')
const links = ref<Link[]>([])
const editingId = ref<number | null>(null)
const editName = ref('')
const editUrl = ref('')

async function load() {
  const data = await fetch<{ links: Link[] }>('/api/links')
  links.value = data.links || []
}

async function add() {
  if (!linkName.value || !linkUrl.value) return
  await fetch('/api/links', { method: 'POST', body: { name: linkName.value, url: linkUrl.value } })
  linkName.value = ''; linkUrl.value = ''
  load()
}

function startEdit(l: Link) {
  editingId.value = l.id
  editName.value = l.name
  editUrl.value = l.url
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  if (!editName.value.trim() || !editUrl.value.trim()) return
  await fetch(`/api/links/${id}`, { method: 'PUT', body: { name: editName.value.trim(), url: editUrl.value.trim() } })
  editingId.value = null
  load()
}

async function remove(id: number) {
  await fetch(`/api/links/${id}`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
