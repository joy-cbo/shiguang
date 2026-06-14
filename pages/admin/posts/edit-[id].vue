<template>
  <NuxtLayout name="admin">
    <form v-if="!loading" @submit.prevent="save" class="space-y-4 max-w-3xl">
      <input v-model="title" class="w-full text-2xl font-bold border-0 border-b pb-2 focus:outline-none dark:bg-gray-900" required />
      <div class="flex gap-4 text-sm">
        <select v-model="status" class="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600">
          <option value="draft">草稿</option><option value="published">发布</option>
        </select>
        <input v-model="slug" placeholder="固定链接" class="border rounded px-2 py-1 flex-1 dark:bg-gray-800 dark:border-gray-600" />
      </div>
      <TipTapEditor v-model="content" />
      <p v-if="savedHint" class="text-green-500 text-xs">草稿已自动保存 {{ savedHint }}</p>
      <button type="submit" :disabled="saving" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </form>
    <p v-else class="text-gray-400">加载中...</p>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const route = useRoute()
const id = route.params.id as string
const title = ref('')
const content = ref('')
const slug = ref('')
const status = ref('draft')
const loading = ref(true)
const saving = ref(false)
const savedHint = ref('')

const draft = useAutoSave(`edit_${id}`)
let autoSaveTimer: ReturnType<typeof setInterval>

onMounted(async () => {
  const data = await fetch<{ post: any }>(`/api/posts/${id}`)
  const p = data.post
  // 优先恢复草稿，其次用服务器数据
  const local = draft.load()
  title.value = local?.title || p.title
  content.value = local?.content || p.content
  slug.value = local?.slug || p.slug
  status.value = local?.status || p.status
  loading.value = false

  autoSaveTimer = setInterval(() => {
    draft.save({ title: title.value, content: content.value, slug: slug.value, status: status.value })
    const now = new Date()
    savedHint.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    setTimeout(() => { savedHint.value = '' }, 2000)
  }, 30000)
})

onUnmounted(() => clearInterval(autoSaveTimer))

async function save() {
  saving.value = true
  await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    body: { title: title.value, content: content.value, slug: slug.value, status: status.value },
  })
  draft.clear()
  navigateTo('/admin/posts')
}
</script>
