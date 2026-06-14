<template>
  <NuxtLayout name="admin">
    <h1 class="text-xl font-bold mb-4">操作日志</h1>
    <p class="text-sm text-gray-500 mb-4">谁在什么时候做了什么</p>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b dark:border-gray-700">
            <th class="py-2 px-3">时间</th>
            <th class="py-2 px-3">用户</th>
            <th class="py-2 px-3">操作</th>
            <th class="py-2 px-3">目标</th>
            <th class="py-2 px-3">IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b dark:border-gray-700">
            <td class="py-2 px-3 text-gray-400 whitespace-nowrap">{{ formatDate(log.created_at, 'yyyy-MM-dd HH:mm') }}</td>
            <td class="py-2 px-3">{{ log.username || '-' }}</td>
            <td class="py-2 px-3">
              <span :class="actionClass(log.action)" class="px-1.5 py-0.5 rounded text-xs font-medium">{{ log.action }}</span>
            </td>
            <td class="py-2 px-3 text-gray-500 max-w-xs truncate">{{ log.target || '-' }}</td>
            <td class="py-2 px-3 text-gray-400">{{ log.ip || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!logs.length" class="text-gray-400 py-8 text-center">暂无操作记录</p>
    </div>

    <div v-if="totalPages > 1" class="flex gap-2 mt-4 justify-center">
      <button v-for="p in totalPages" :key="p" @click="page=p;load()"
        class="px-3 py-1 rounded text-sm" :class="p===page?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700'">{{ p }}</button>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch } = useApi()
const { formatDate } = useFormat()

const logs = ref<any[]>([])
const page = ref(1)
const totalPages = ref(1)

function actionClass(action: string) {
  if (action.includes('创建') || action.includes('发布')) return 'bg-green-100 text-green-700'
  if (action.includes('删除')) return 'bg-red-100 text-red-700'
  return 'bg-blue-100 text-blue-700'
}

async function load() {
  try {
    const data = await fetch<{ logs: any[]; totalPages: number }>(
      `/api/audit-logs?page=${page.value}&limit=50`,
    )
    logs.value = data.logs || []
    totalPages.value = data.totalPages
  } catch {}
}

onMounted(() => load())
</script>
