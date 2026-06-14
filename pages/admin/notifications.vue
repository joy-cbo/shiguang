<template>
  <NuxtLayout name="admin">
    <h1 class="text-xl font-bold mb-4">通知设置</h1>
    <p class="text-sm text-gray-500 mb-6">配置邮件通知和内容变动提醒</p>

    <form @submit.prevent="save" class="space-y-4 max-w-lg">
      <div>
        <label class="text-sm text-gray-500 block mb-1">管理员邮箱</label>
        <input v-model="form.admin_email" type="email" placeholder="your@email.com" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
      </div>
      <div>
        <label class="text-sm text-gray-500 block mb-1">通知接收邮箱</label>
        <input v-model="form.notify_email" type="email" placeholder="接收通知的邮箱" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
      </div>
      <div>
        <label class="text-sm text-gray-500 block mb-1">Webhook URL（可选）</label>
        <input v-model="form.notify_webhook_url" placeholder="如企业微信/钉钉机器人" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
      </div>

      <hr class="dark:border-gray-700" />

      <div>
        <label class="text-sm text-gray-500 block mb-1">访问统计通知</label>
        <select v-model="form.notify_visit" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
          <option value="off">关闭</option>
          <option value="hourly">每小时</option>
          <option value="daily">每天</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-500 block mb-1">内容变动通知</label>
        <select v-model="form.notify_content" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
          <option value="off">关闭</option>
          <option value="realtime">实时通知</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-500 block mb-1">通知开始时间</label>
          <input v-model="form.notify_time_start" type="time" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label class="text-sm text-gray-500 block mb-1">通知结束时间</label>
          <input v-model="form.notify_time_end" type="time" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        </div>
      </div>

      <div class="flex gap-3">
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">保存设置</button>
        <button type="button" @click="sendTest" :disabled="testing" class="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50">
          {{ testing ? '发送中...' : '📨 发送测试通知' }}
        </button>
      </div>
    </form>

    <p v-if="msg" :class="msgType === 'ok' ? 'text-green-600' : 'text-red-600'" class="mt-3 text-sm">{{ msg }}</p>

    <!-- 通知日志 -->
    <div class="mt-10 border-t dark:border-gray-700 pt-6">
      <h3 class="font-semibold mb-3">通知日志</h3>
      <div v-if="logs.length" class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b dark:border-gray-700">
              <th class="py-2 px-3">类型</th>
              <th class="py-2 px-3">标题</th>
              <th class="py-2 px-3">状态</th>
              <th class="py-2 px-3">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in logs" :key="l.id" class="border-b dark:border-gray-700">
              <td class="py-2 px-3 text-xs">
                <span :class="l.type === 'test' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="px-1.5 py-0.5 rounded">{{ l.type }}</span>
              </td>
              <td class="py-2 px-3">{{ l.title }}</td>
              <td class="py-2 px-3">
                <span :class="l.status === 'sent' ? 'text-green-600' : 'text-red-600'" class="text-xs">● {{ l.status === 'sent' ? '已发送' : '失败' }}</span>
              </td>
              <td class="py-2 px-3 text-gray-400 text-xs">{{ formatDate(l.created_at, 'yyyy-MM-dd HH:mm') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-400 text-sm">暂无通知记录</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch } = useApi()
const { formatDate } = useFormat()

const form = reactive({
  admin_email: '', notify_email: '', notify_webhook_url: '',
  notify_visit: 'off', notify_content: 'realtime',
  notify_time_start: '08:00', notify_time_end: '22:00',
})
const msg = ref('')
const msgType = ref<'ok' | 'err'>('ok')
const testing = ref(false)
const logs = ref<any[]>([])

onMounted(async () => {
  await loadSettings()
  await loadLogs()
})

async function loadSettings() {
  try {
    const data = await fetch<{ settings: Record<string, string> }>('/api/notifications/settings')
    if (data.settings) Object.assign(form, data.settings)
  } catch {}
}

async function loadLogs() {
  try {
    const data = await fetch<{ logs: any[] }>('/api/notifications/logs?limit=20')
    logs.value = data.logs || []
  } catch {}
}

async function save() {
  try {
    await fetch('/api/notifications/settings', {
      method: 'PUT', body: { ...form },
    })
    msg.value = '设置已保存'
    msgType.value = 'ok'
  } catch {
    msg.value = '保存失败'
    msgType.value = 'err'
  }
}

async function sendTest() {
  testing.value = true
  try {
    await fetch('/api/notifications/test', { method: 'POST' })
    msg.value = '测试通知已发送'
    msgType.value = 'ok'
    await loadLogs()
  } catch {
    msg.value = '发送失败'
    msgType.value = 'err'
  } finally { testing.value = false }
}
</script>
