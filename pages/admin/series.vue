<template>
  <NuxtLayout name="admin">
    <div class="flex gap-2 mb-4">
      <input v-model="name" placeholder="系列名称" class="border rounded px-3 py-1.5 text-sm w-40 dark:bg-gray-800 dark:border-gray-600" />
      <input v-model="slug" placeholder="标识（英文）" class="border rounded px-3 py-1.5 text-sm w-32 dark:bg-gray-800 dark:border-gray-600" />
      <button @click="create" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">添加系列</button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="s in seriesList" :key="s.id" class="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700 text-sm">
        <template v-if="editingId === s.id">
          <div class="flex gap-2 items-center flex-1">
            <input v-model="editName" class="border rounded px-2 py-0.5 w-32 text-sm dark:bg-gray-700 dark:border-gray-600" />
            <input v-model="editSlug" class="border rounded px-2 py-0.5 w-24 text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="slug" />
            <button @click="saveEdit(s.id)" class="text-green-500 hover:text-green-700">✓</button>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </template>
        <template v-else>
          <div>
            <span class="font-medium">{{ s.name }}</span>
            <span class="text-gray-400 ml-2">/{{ s.slug }}</span>
            <span class="text-gray-400 ml-2">({{ s.post_count || 0 }} 篇)</span>
            <p v-if="s.description" class="text-xs text-gray-400 mt-0.5">{{ s.description }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="startEdit(s)" class="text-gray-400 hover:text-blue-500 text-xs">✎ 编辑</button>
            <button @click="remove(s.id)" class="text-red-400 text-xs">删除</button>
          </div>
        </template>
      </div>
      <p v-if="!seriesList.length" class="text-gray-400 text-center py-8">暂无系列</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()

const name = ref('')
const slug = ref('')
const seriesList = ref<any[]>([])
const editingId = ref<number | null>(null)
const editName = ref('')
const editSlug = ref('')

async function load() {
  const data = await fetch<{ series: any[] }>('/api/series')
  seriesList.value = data.series || []
}

async function create() {
  if (!name.value || !slug.value) return
  await fetch('/api/series', { method: 'POST', body: { name: name.value, slug: slug.value } })
  name.value = ''; slug.value = ''
  load()
}

function startEdit(s: any) {
  editingId.value = s.id
  editName.value = s.name
  editSlug.value = s.slug
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
  editSlug.value = ''
}

async function saveEdit(id: number) {
  if (!editName.value.trim()) return
  await fetch(`/api/series/${id}`, { method: 'PUT', body: { name: editName.value.trim(), slug: editSlug.value.trim() } })
  editingId.value = null
  load()
}

async function remove(id: number) {
  await fetch(`/api/series/${id}`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
