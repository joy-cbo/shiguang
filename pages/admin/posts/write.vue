<template>
  <NuxtLayout name="admin">
    <form @submit.prevent class="space-y-4 max-w-3xl">
      <input v-model="title" placeholder="文章标题" class="w-full text-2xl font-bold border-0 border-b pb-2 focus:outline-none dark:bg-gray-900" required />
      <div class="flex gap-4 text-sm flex-wrap items-center">
        <select v-model="categoryId" class="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600">
          <option :value="null">无分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <input v-model="slug" placeholder="固定链接（可选）" class="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600" />
        <label class="flex items-center gap-1 text-xs cursor-pointer">
          <input type="checkbox" v-model="isPinned" class="rounded" /> 置顶
        </label>
      </div>
      <TipTapEditor v-model="content" />
      <div class="flex gap-2">
        <input v-model="tagInput" @keyup.enter.prevent="addTag" placeholder="标签（回车添加）" class="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600" />
        <div class="flex flex-wrap gap-1">
          <span v-for="(t, i) in tags" :key="i" class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs flex items-center gap-1">
            {{ t }} <button type="button" @click="tags.splice(i,1)" class="hover:text-red-500">&times;</button>
          </span>
        </div>
      </div>
      <p v-if="savedHint" class="text-green-500 text-xs">草稿已自动保存 {{ savedHint }}</p>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <div class="flex gap-3">
        <button type="button" @click="save('draft')" :disabled="saving" class="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
          {{ saving ? '保存中...' : '保存草稿' }}
        </button>
        <button type="button" @click="save('published')" :disabled="saving" class="gradient-bg text-white px-6 py-2 rounded hover:opacity-90 disabled:opacity-50">
          {{ saving ? '发布中...' : '发布文章' }}
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Category } from '~~/types'
const { fetch, handleError } = useApi()

const title = ref('')
const content = ref('')
const slug = ref('')
const categoryId = ref<number | null>(null)
const isPinned = ref(false)
const categories = ref<Category[]>([])
const tags = ref<string[]>([])
const tagInput = ref('')
const error = ref('')
const saving = ref(false)
const savedHint = ref('')

onMounted(async () => {
  try {
    const catData = await fetch<{ categories: Category[] }>('/api/categories')
    categories.value = catData.categories || []
  } catch (e) { console.error('[写文章] 加载分类失败:', e) }

  const draft = useAutoSave('new')
  const d = draft.load()
  if (d) {
    title.value = d.title || ''
    content.value = d.content || ''
    slug.value = d.slug || ''
    tags.value = d.tags || []
    categoryId.value = d.categoryId ?? null
    isPinned.value = d.isPinned || false
  }
  autoSaveTimer = setInterval(() => {
    draft.save({
      title: title.value, content: content.value, slug: slug.value,
      status: 'draft', tags: tags.value, categoryId: categoryId.value,
      isPinned: isPinned.value
    })
    const now = new Date()
    savedHint.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    setTimeout(() => { savedHint.value = '' }, 2000)
  }, 30000)
})

let autoSaveTimer: ReturnType<typeof setInterval>
onUnmounted(() => clearInterval(autoSaveTimer))

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) tags.value.push(t)
  tagInput.value = ''
}

async function save(status: 'draft' | 'published') {
  saving.value = true
  error.value = ''
  try {
    await fetch('/api/posts', {
      method: 'POST',
      body: {
        title: title.value, content: content.value,
        slug: slug.value || undefined, status,
        tags: tags.value.length ? tags.value : undefined,
        category_id: categoryId.value ?? undefined,
        is_pinned: isPinned.value ? 1 : 0,
      },
    })
    navigateTo('/admin/posts')
  } catch (e) {
    error.value = handleError(e)
  } finally { saving.value = false }
}
</script>
