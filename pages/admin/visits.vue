<template>
  <NuxtLayout name="admin">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left text-gray-500 border-b dark:border-gray-700"><th class="py-2 px-3">IP</th><th>地区</th><th>页面</th><th>来源</th><th>时间</th></tr></thead>
        <tbody>
          <tr v-for="v in visits" :key="v.id" class="border-b dark:border-gray-700">
            <td class="py-2 px-3 font-mono text-xs">{{ v.ip }}</td>
            <td>{{ v.ip_region || '-' }}</td>
            <td class="max-w-xs truncate">{{ v.visited_url }}</td>
            <td class="text-gray-400 text-xs max-w-[120px] truncate">{{ v.referer || '-' }}</td>
            <td class="text-gray-400 text-xs">{{ formatDate(v.created_at, 'yyyy-MM-dd HH:mm') }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!visits.length" class="text-gray-400 text-center py-8">暂无记录</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const { formatDate } = useFormat()
const visits = ref<any[]>([])

onMounted(async () => {
  const data = await fetch<{ visits: any[] }>('/api/visits')
  visits.value = data.visits || []
})
</script>
