<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow p-8">
      <h1 class="text-2xl font-bold text-center mb-6">登录</h1>
      <form @submit.prevent="doLogin" class="space-y-4">
        <input v-model="username" placeholder="用户名" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
        <input v-model="password" type="password" placeholder="密码" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: undefined, layout: false })

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const { isLoggedIn } = useSite()

async function doLogin() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ token: string }>('/api/auth/login', { method: 'POST', body: { username: username.value, password: password.value } })
    localStorage.setItem('auth_token', data.token)
    isLoggedIn.value = true  // 更新全局登录状态
    navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
