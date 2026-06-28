<template>
  <NuxtLayout name="admin">
    <div class="mb-4 flex gap-2 items-center">
      <input type="file" @change="upload" class="text-sm" />
      <span class="text-xs text-gray-400">{{ media.length }} 个文件</span>
    </div>

    <!-- 网格 -->
    <div v-if="media.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="item in media" :key="item.key"
        class="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">

        <!-- 缩略图 -->
        <div class="aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img v-if="isImage(item.key)" :src="item.url" :alt="item.filename"
            class="w-full h-full object-cover" loading="lazy" />
          <span v-else class="text-4xl"><UiIconShiguang name="folder" size="36" class="text-gray-400"/></span>
        </div>

        <!-- 信息 -->
        <div class="p-3 space-y-1.5">
          <p class="text-xs font-mono text-gray-500 dark:text-gray-400 truncate" :title="item.key">{{ item.key }}</p>
          <p class="text-xs text-gray-400">{{ formatSize(item.size) }}</p>

          <!-- 引用状态 -->
          <div v-if="item.used" class="space-y-1">
            <span class="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
              ✅ 被引用
            </span>
            <div v-for="(ref, i) in item.refs" :key="i" class="text-xs text-gray-500">
              <span class="text-gray-400">{{ ref.type }}：</span>
              <a v-if="ref.link" :href="ref.link" target="_blank" class="text-blue-500 hover:underline">{{ ref.title }}</a>
              <span v-else>{{ ref.title }}</span>
            </div>
          </div>
          <div v-else>
            <span class="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
              ❌ 未引用
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空 -->
    <p v-else class="text-gray-400 text-center py-12">
      <span v-if="loading">加载中...</span>
      <span v-else-if="error">{{ error }}</span>
      <span v-else>暂无文件</span>
    </p>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const media = ref<any[]>([])
const loading = ref(true)
const error = ref('')

function isImage(key: string) {
  return /\.(svg|png|jpe?g|gif|webp|ico)$/i.test(key)
}

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetch<{ media: any[] }>('/api/media')
    media.value = data.media || []
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function upload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('file', file)
  await fetch('/api/upload', { method: 'POST', body: form })
  load()
}

onMounted(load)
</script>
