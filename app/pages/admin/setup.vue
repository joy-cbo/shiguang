<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow p-8">
      <h1 class="text-2xl font-bold text-center mb-6">初始化站点</h1>
      <form @submit.prevent="doSetup" class="space-y-4">
        <!-- 用户名 -->
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">管理员用户名</label>
          <input v-model="username" placeholder="至少3个字符" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">密码</label>
          <div class="relative">
            <input :type="showPwd ? 'text' : 'password'" v-model="password" placeholder="至少8位" class="w-full border rounded px-3 py-2 pr-10 dark:bg-gray-700 dark:border-gray-600" required @input="checkStrength" />
            <button type="button" @click="showPwd = !showPwd" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
              <IconShiguang :name="showPwd ? 'eye-off' : 'eye'" size="18" />
            </button>
          </div>
          <!-- 密码强度 -->
          <div v-if="password" class="mt-1">
            <div class="flex gap-1 mb-1">
              <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded" :class="strengthBarClass(i)" />
            </div>
            <p class="text-xs" :class="strengthColor">{{ strengthText }}</p>
          </div>
        </div>

        <!-- 确认密码 -->
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">确认密码</label>
          <div class="relative">
            <input :type="showConfirm ? 'text' : 'password'" v-model="confirmPwd" placeholder="再输一遍" class="w-full border rounded px-3 py-2 pr-10 dark:bg-gray-700 dark:border-gray-600" :class="confirmMismatch ? 'border-red-400' : ''" required />
            <button type="button" @click="showConfirm = !showConfirm" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
              <IconShiguang :name="showConfirm ? 'eye-off' : 'eye'" size="18" />
            </button>
          </div>
          <p v-if="confirmMismatch" class="text-red-500 text-xs mt-1">两次密码不一致</p>
        </div>

        <!-- 昵称 -->
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">昵称（可选）</label>
          <input v-model="nickname" placeholder="显示名称" class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>

        <button type="submit" :disabled="loading || !canSubmit" class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
const confirmPwd = ref('')
const nickname = ref('')
const showPwd = ref(false)
const showConfirm = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

// 密码强度
const strengthScore = ref(0)

function checkStrength() {
  let score = 0
  const pwd = password.value
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  strengthScore.value = Math.min(4, score)
}

const strengthBarClass = (i: number) => {
  if (strengthScore.value === 0) return 'bg-gray-200 dark:bg-gray-600'
  if (i <= strengthScore.value) {
    if (strengthScore.value <= 2) return 'bg-red-400'
    if (strengthScore.value === 3) return 'bg-yellow-400'
    return 'bg-green-400'
  }
  return 'bg-gray-200 dark:bg-gray-600'
}

const strengthText = computed(() => {
  if (strengthScore.value === 0) return ''
  if (strengthScore.value <= 1) return '弱 — 太容易被猜到了'
  if (strengthScore.value === 2) return '一般 — 还可以更强'
  if (strengthScore.value === 3) return '不错 — 比较安全了'
  return '强 — 非常安全'
})

const strengthColor = computed(() => {
  if (strengthScore.value <= 1) return 'text-red-500'
  if (strengthScore.value === 2) return 'text-yellow-500'
  if (strengthScore.value === 3) return 'text-lime-500'
  return 'text-green-500'
})

const confirmMismatch = computed(() => confirmPwd.value && confirmPwd.value !== password.value)

const canSubmit = computed(() => {
  return username.value.length >= 3 && password.value.length >= 8 && strengthScore.value >= 2 && !confirmMismatch.value && confirmPwd.value
})

async function doSetup() {
  if (!canSubmit.value) return
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
