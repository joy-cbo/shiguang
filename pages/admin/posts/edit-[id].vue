<template>
  <NuxtLayout name="admin">
    <form v-if="!loading" @submit.prevent class="space-y-4 max-w-3xl">
      <input v-model="title" class="w-full text-2xl font-bold border-0 border-b pb-2 focus:outline-none dark:bg-gray-900" required />
      <div class="flex gap-4 text-sm">
        <input v-model="slug" placeholder="固定链接" class="border rounded px-2 py-1 flex-1 dark:bg-gray-800 dark:border-gray-600" />
      </div>
      <TipTapEditor v-model="content" />
      <p v-if="savedHint" class="text-green-500 text-xs">草稿已自动保存 {{ savedHint }}</p>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <div class="flex gap-3">
        <button type="button" @click="save('draft')" :disabled="saving" class="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
          {{ saving && mode === 'draft' ? '保存中...' : '保存草稿' }}
        </button>
        <button type="button" @click="save('published')" :disabled="saving" class="gradient-bg text-white px-6 py-2 rounded hover:opacity-90 disabled:opacity-50">
          {{ saving && mode === 'published' ? '发布中...' : '发布文章' }}
        </button>
      </div>
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
const loading = ref(true)
const saving = ref(false)
const mode = ref<'draft' | 'published'>('draft')
const savedHint = ref('')
const error = ref('')

const draft = useAutoSave(`edit_${id}`)
let autoSaveTimer: ReturnType<typeof setInterval>

onMounted(async () => {
  try {
    const data = await fetch<{ post: any }>(`/api/posts/${id}`)
    const p = data.post
    const local = draft.load()
    title.value = local?.title || p.title
    content.value = local?.content || p.content
    slug.value = local?.slug || p.slug
    mode.value = (local?.status || p.status) === 'published' ? 'published' : 'draft'
  } catch (e) {
    error.value = handleError(e)
  }
  loading.value = false

  autoSaveTimer = setInterval(() => {
    draft.save({ title: title.value, content: content.value, slug: slug.value, status: 'draft' })
    const now = new Date()
    savedHint.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    setTimeout(() => { savedHint.value = '' }, 2000)
  }, 30000)
})

onUnmounted(() => clearInterval(autoSaveTimer))

async function save(status: 'draft' | 'published') {
  saving.value = true
  mode.value = status
  error.value = ''
  try {
    await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      body: { title: title.value, content: content.value, slug: slug.value, status },
    })
    draft.clear()
    navigateTo('/admin/posts')
  } catch (e) {
    error.value = handleError(e)
  } finally { saving.value = false }
}
</script>
