<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🐱 壹佰记录</h1>
      <button @click="openForm()" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm">
        + 新增事件
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-10 text-gray-400">加载中...</div>

    <!-- 列表 -->
    <div v-else-if="events.length" class="space-y-3">
      <div v-for="e in events" :key="e.id"
        class="flex items-start justify-between p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="text-xs text-gray-400">{{ e.event_date }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full"
              :class="{
                'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300': e.type === 'milestone',
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': e.type === 'weight',
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300': e.type === 'photo',
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': e.type === 'expense',
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': e.type === 'health',
              }"
            >{{ typeLabel(e.type) }}</span>
            <span v-if="e.weight" class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{{ e.weight }}</span>
          </div>
          <h3 class="font-bold">{{ e.title }}</h3>
          <p v-if="e.content" class="text-sm text-gray-500 mt-1 truncate">{{ e.content }}</p>
        </div>
        <div class="flex items-center gap-2 ml-4 shrink-0">
          <button @click="openForm(e)" class="text-blue-500 hover:underline text-sm">编辑</button>
          <button @click="del(e.id)" class="text-red-500 hover:underline text-sm">删除</button>
        </div>
      </div>
    </div>

    <!-- 空 -->
    <div v-else class="text-center py-10 text-gray-400">暂无记录，点右上角新增</div>

    <!-- 编辑弹窗 -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showForm = false">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
          <h2 class="text-lg font-bold mb-4">{{ editingId ? '编辑事件' : '新增事件' }}</h2>

          <label class="block text-sm mb-1">日期 *</label>
          <input v-model="form.event_date" type="date" class="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600" />

          <label class="block text-sm mb-1">标题 *</label>
          <input v-model="form.title" class="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600" />

          <label class="block text-sm mb-1">类型</label>
          <select v-model="form.type" class="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600">
            <option value="milestone">里程碑</option>
            <option value="weight">体重</option>
            <option value="photo">照片</option>
            <option value="expense">花费</option>
            <option value="health">健康</option>
          </select>

          <label class="block text-sm mb-1">体重（可选）</label>
          <input v-model="form.weight" placeholder="如 500g" class="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600" />

          <label class="block text-sm mb-1">照片 URL（可选）</label>
          <input v-model="form.photo_url" placeholder="https://..." class="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600" />

          <label class="block text-sm mb-1">内容</label>
          <textarea v-model="form.content" rows="3" class="w-full border rounded-lg px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600"></textarea>

          <div class="flex justify-end gap-2">
            <button @click="showForm = false" class="px-4 py-2 text-sm border rounded-lg dark:border-gray-600">取消</button>
            <button @click="save" :disabled="saving" class="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const events = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ events: any[] }>('/api/yibai')
    events.value = res.events || []
  } catch (e) { console.error('[壹佰管理] 加载失败:', e) }
  loading.value = false
}

const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const form = reactive({ event_date: '', title: '', content: '', photo_url: '', weight: '', type: 'milestone' })

function openForm(e?: any) {
  if (e) {
    editingId.value = e.id
    form.event_date = e.event_date
    form.title = e.title
    form.content = e.content || ''
    form.photo_url = e.photo_url || ''
    form.weight = e.weight || ''
    form.type = e.type || 'milestone'
  } else {
    editingId.value = null
    form.event_date = new Date().toISOString().slice(0, 10)
    form.title = ''
    form.content = ''
    form.photo_url = ''
    form.weight = ''
    form.type = 'milestone'
  }
  showForm.value = true
}

async function save() {
  if (!form.event_date || !form.title) return alert('日期和标题不能为空')
  saving.value = true
  try {
    if (editingId.value) {
      await fetch(`/api/yibai/${editingId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      await fetch('/api/yibai', { method: 'POST', body: { ...form } })
    }
    showForm.value = false
    await load()
  } catch (e: any) {
    alert(e?.data?.message || '保存失败')
  }
  saving.value = false
}

async function del(id: number) {
  if (!confirm('确定删除这条记录？')) return
  try {
    await fetch(`/api/yibai/${id}`, { method: 'DELETE' })
    await load()
  } catch (e: any) {
    alert(e?.data?.message || '删除失败')
  }
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    milestone: '里程碑', weight: '体重', photo: '照片', expense: '花费', health: '健康',
  }
  return map[t] || t
}

onMounted(() => load())
</script>
