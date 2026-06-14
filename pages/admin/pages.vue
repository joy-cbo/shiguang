<template>
  <NuxtLayout name="admin">
    <div class="mb-4">
      <button @click="showCreate = !showCreate"
        class="bg-purple-600 text-white px-4 py-1.5 rounded text-sm hover:bg-purple-700">
        {{ showCreate ? '取消' : '新建页面' }}
      </button>
    </div>

    <!-- 新建表单 -->
    <div v-if="showCreate" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-4">
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">页面标题</label>
          <input v-model="createTitle" placeholder="例如：关于本站"
            class="w-full border rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">别名（英文，用于网址）</label>
          <input v-model="createSlug" placeholder="例如：about"
            class="w-full border rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">页面内容（HTML）</label>
          <textarea v-model="createContent" rows="8" placeholder="支持 HTML 标签..."
            class="w-full border rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 font-mono"></textarea>
        </div>
        <button @click="create"
          class="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700">创建</button>
      </div>
    </div>

    <!-- 页面列表 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div v-for="p in pages" :key="p.id" class="px-4 py-3 border-b dark:border-gray-700 last:border-b-0">
        <template v-if="editingId === p.id">
          <div class="space-y-2">
            <div class="flex gap-2 items-center">
              <input v-model="editTitle" class="border rounded px-2 py-1 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600" />
              <input v-model="editSlug" class="border rounded px-2 py-1 text-sm w-32 dark:bg-gray-700 dark:border-gray-600" />
              <button @click="saveEdit(p.id)" class="text-green-500 hover:text-green-700" title="保存">
                <IconShiguang name="check" size="16" />
              </button>
              <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600" title="取消">
                <IconShiguang name="x" size="16" />
              </button>
            </div>
            <textarea v-model="editContent" rows="8"
              class="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 font-mono"></textarea>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium">{{ p.title }}</span>
              <span class="text-gray-400 text-xs ml-2">/page/{{ p.slug }}</span>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="'/page/' + p.slug" target="_blank"
                class="text-gray-400 hover:text-purple-500 text-xs" title="预览">
                <IconShiguang name="external-link" size="14" />
              </NuxtLink>
              <button @click="startEdit(p)" class="text-gray-400 hover:text-purple-500 text-xs" title="编辑">
                <IconShiguang name="edit" size="14" />
              </button>
              <button @click="remove(p.id)" class="text-red-400 hover:text-red-600 text-xs" title="删除">
                <IconShiguang name="trash" size="14" />
              </button>
            </div>
          </div>
        </template>
      </div>
      <p v-if="!pages.length" class="text-gray-400 text-center py-10 text-sm">暂无页面，点击上方「新建页面」创建</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Page } from '~~/types'
const { fetch, handleError } = useApi()

// 列表
const pages = ref<Page[]>([])

// 新建
const showCreate = ref(false)
const createTitle = ref('')
const createSlug = ref('')
const createContent = ref('')

// 编辑
const editingId = ref<number | null>(null)
const editTitle = ref('')
const editSlug = ref('')
const editContent = ref('')

async function load() {
  const data = await fetch<{ pages: Page[] }>('/api/pages')
  pages.value = data.pages || []
}

async function create() {
  if (!createTitle.value || !createSlug.value) return
  await fetch('/api/pages', {
    method: 'POST',
    body: { title: createTitle.value, slug: createSlug.value, content: createContent.value }
  })
  createTitle.value = ''
  createSlug.value = ''
  createContent.value = ''
  showCreate.value = false
  await load()
}

function startEdit(p: Page) {
  editingId.value = p.id
  editTitle.value = p.title
  editSlug.value = p.slug
  editContent.value = p.content
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  if (!editTitle.value || !editSlug.value) return
  await fetch(`/api/pages/${id}`, {
    method: 'PUT',
    body: { title: editTitle.value, slug: editSlug.value, content: editContent.value }
  })
  cancelEdit()
  await load()
}

async function remove(id: number) {
  if (!confirm('确定删除这个页面？')) return
  await fetch(`/api/pages/${id}`, { method: 'DELETE' })
  await load()
}

onMounted(() => load())
</script>
