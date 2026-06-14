<template>
  <NuxtLayout name="admin">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="item in list" :key="item.id" class="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 text-sm">
        <span>{{ item.title }} <span class="text-gray-400" v-if="item.deleted_at">已删除</span></span>
        <span class="space-x-2">
          <button v-if="item.deleted_at" @click="restore(item.id)" class="text-green-500 text-xs">恢复</button>
          <button @click="permanent(item.id)" class="text-red-400 text-xs">永久删除</button>
        </span>
      </div>
      <p v-if="!list.length" class="text-gray-400 text-center py-8">回收站为空</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const list = ref<any[]>([])

async function load() {
  const data = await fetch<{ posts: any[] }>('/api/posts?status=deleted')
  list.value = data.posts || []
}

async function restore(id: number) {
  await fetch(`/api/posts/${id}`, { method: 'PUT', body: { action: 'restore' } })
  load()
}

async function permanent(id: number) {
  if (!confirm('确定永久删除？')) return
  await fetch(`/api/posts/${id}?permanent=true`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
