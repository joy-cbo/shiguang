<template>
  <NuxtLayout name="admin">
    <form @submit.prevent="save" class="space-y-4 max-w-md">
      <div><label class="text-sm text-gray-500 block mb-1">用户名</label><input :value="user?.username" disabled class="w-full border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700" /></div>
      <div><label class="text-sm text-gray-500 block mb-1">昵称</label><input v-model="nickname" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" /></div>
      <div><label class="text-sm text-gray-500 block mb-1">邮箱</label><input v-model="email" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" /></div>
      <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">保存</button>
    </form>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const user = ref<any>(null)
const nickname = ref('')
const email = ref('')

onMounted(async () => {
  const data = await fetch<{ user: any }>('/api/auth/me')
  user.value = data.user
  nickname.value = data.user.nickname
  email.value = data.user.email
})

async function save() {
  await fetch('/api/auth/profile', { method: 'PUT', body: { nickname: nickname.value, email: email.value } })
}
</script>
