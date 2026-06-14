<template>
  <NuxtLayout name="admin">
    <button @click="showForm = !showForm" class="text-blue-500 text-sm mb-4 inline-block">+ 添加用户</button>
    <form v-if="showForm" @submit.prevent="create" class="bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded p-4 mb-4 space-y-3">
      <div class="flex gap-3 flex-wrap">
        <input v-model="form.username" placeholder="用户名" required class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
        <input v-model="form.password" type="password" placeholder="密码（至少8位）" required class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
        <input v-model="form.nickname" placeholder="昵称" class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
        <select v-model="form.role" class="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600">
          <option value="author">作者</option>
          <option value="admin">管理员</option>
        </select>
        <button type="submit" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">创建</button>
      </div>
      <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
    </form>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="u in users" :key="u.id" class="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 text-sm">
        <template v-if="editingId === u.id">
          <div class="flex gap-2 items-center flex-wrap">
            <input v-model="editForm.nickname" placeholder="昵称" class="border rounded px-2 py-1 text-sm w-24 dark:bg-gray-700 dark:border-gray-600" />
            <select v-model="editForm.role" class="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600">
              <option value="admin">管理员</option>
              <option value="author">作者</option>
            </select>
            <button @click="saveEdit(u.id)" class="text-green-500 hover:text-green-700">✓</button>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </template>
        <template v-else>
          <span>{{ u.username }} <span class="text-gray-400 text-xs">({{ u.role }})</span></span>
          <div class="flex gap-2">
            <button @click="startEdit(u)" class="text-gray-400 hover:text-blue-500 text-xs">✎ 编辑</button>
            <button v-if="u.role !== 'admin'" @click="remove(u.id)" class="text-red-400 text-xs">删除</button>
          </div>
        </template>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { User } from '~~/types'
const { fetch, handleError } = useApi()
const users = ref<User[]>([])
const showForm = ref(false)
const error = ref('')
const form = reactive({ username: '', password: '', nickname: '', role: 'author' })
const editingId = ref<number | null>(null)
const editForm = reactive({ nickname: '', role: '' })

onMounted(async () => {
  const data = await fetch<{ users: User[] }>('/api/users')
  users.value = data.users || []
})

async function create() {
  error.value = ''
  try {
    const res = await fetch<any>('/api/users', {
      method: 'POST',
      body: { ...form }
    })
    if (res.success) {
      form.username = ''; form.password = ''; form.nickname = ''
      showForm.value = false
      const data = await fetch<{ users: User[] }>('/api/users')
      users.value = data.users || []
    }
  } catch (e: any) {
    error.value = e.data?.message || '创建失败'
  }
}

function startEdit(u: any) {
  editingId.value = u.id
  editForm.nickname = u.nickname || ''
  editForm.role = u.role
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  await fetch(`/api/users/${id}`, { method: 'PUT', body: { nickname: editForm.nickname, role: editForm.role } })
  editingId.value = null
  const data = await fetch<{ users: User[] }>('/api/users')
  users.value = data.users || []
}

async function remove(id: number) {
  await fetch(`/api/users/${id}`, { method: 'DELETE' })
  users.value = users.value.filter(u => u.id !== id)
}
</script>
