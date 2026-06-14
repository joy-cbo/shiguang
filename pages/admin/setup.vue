<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow p-8">
      <h1 class="text-2xl font-bold text-center mb-6">初始化站点</h1>
      <form @submit.prevent="doSetup" class="space-y-4">
        <input v-model="username" placeholder="管理员用户名" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
        <input v-model="password" type="password" placeholder="密码（至少8位）" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
        <input v-model="nickname" placeholder="昵称（可选）" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>
        <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? '初始化中...' : '创建管理员' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: undefined, layout: false })

const username = ref('')
const password = ref('')
const nickname = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function doSetup() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/setup', { method: 'POST', body: { username: username.value, password: password.value, nickname: nickname.value } })
    success.value = '初始化成功！'
    setTimeout(() => navigateTo('/admin/login'), 1500)
  } catch (e: any) {
    error.value = e?.data?.message || '初始化失败'
  } finally {
    loading.value = false
  }
}
</script>
