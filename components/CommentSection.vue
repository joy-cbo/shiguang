<template>
  <div class="border-t dark:border-gray-700 pt-8 mt-8">
    <h3 class="text-lg font-semibold mb-4">评论 ({{ comments.length }})</h3>

    <!-- 评论列表 -->
    <div v-if="comments.length" class="space-y-4 mb-8">
      <div v-for="c in topComments" :key="c.id" :class="'bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-medium text-sm">{{ c.author_name }}</span>
          <span class="text-xs text-gray-400">{{ timeAgo(c.created_at) }}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ c.content }}</p>
        <button @click="replyTo = c.id; replyName = c.author_name" class="text-xs text-purple-500 mt-2 hover:underline">回复</button>

        <!-- 子回复 -->
        <div v-for="sub in repliesOf(c.id)" :key="sub.id" class="ml-4 mt-3 pl-3 border-l-2 dark:border-gray-600">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-sm">{{ sub.author_name }}</span>
            <span class="text-xs text-gray-400">{{ timeAgo(sub.created_at) }}</span>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ sub.content }}</p>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-400 text-sm mb-6">暂无评论，来说点什么吧</p>

    <!-- 发表表单 -->
    <div :class="'bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'">
      <p v-if="replyTo" class="text-sm text-gray-500 mb-2">
        回复 <span class="font-medium">{{ replyName }}</span>
        <button @click="replyTo = null; replyName = ''" class="text-gray-400 ml-1">✕</button>
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input v-model="form.name" placeholder="昵称 *" maxlength="50" class="w-full px-3 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-purple-400 focus:ring-1 focus:ring-orange-300 transition-colors" />
        <input v-model="form.email" placeholder="邮箱（不公开）" type="email" class="w-full px-3 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-purple-400 focus:ring-1 focus:ring-orange-300 transition-colors" />
      </div>
      <textarea v-model="form.content" placeholder="写下你的想法..." maxlength="2000" rows="3" class="w-full px-3 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm mb-3 resize-none focus:border-purple-400 focus:ring-1 focus:ring-orange-300 transition-colors"></textarea>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-400">{{ form.content.length }}/2000</span>
        <button @click="submit" :disabled="submitting" :class="'px-4 py-1.5 text-white rounded-lg text-sm gradient-bg hover:opacity-90 disabled:opacity-50'">
          {{ submitting ? '提交中...' : '发表评论' }}
        </button>
      </div>
      <p v-if="error" class="text-red-500 text-xs mt-2">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-xs mt-2">{{ success }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { timeAgo } = useFormat()

const props = defineProps<{ slug: string }>()
const slug = computed(() => props.slug)

const comments = ref<any[]>([])
const replyTo = ref<number | null>(null)
const replyName = ref('')
const form = reactive({ name: '', email: '', content: '' })
const submitting = ref(false)
const error = ref('')
const success = ref('')

const topComments = computed(() => comments.value.filter(c => !c.parent_id))
const repliesOf = (id: number) => comments.value.filter(c => c.parent_id === id)

async function load() {
  try {
    const data = await $fetch<{ comments: any[] }>(`/api/posts/${slug.value}/comments`)
    comments.value = data.comments || []
  } catch {}
}

async function submit() {
  error.value = ''
  success.value = ''
  if (!form.name.trim() || form.name.trim().length < 2) { error.value = '昵称至少2个字符'; return }
  if (!form.content.trim() || form.content.trim().length < 2) { error.value = '内容至少2个字符'; return }
  submitting.value = true
  try {
    await $fetch(`/api/posts/${slug.value}/comments`, {
      method: 'POST',
      body: { author_name: form.name.trim(), author_email: form.email.trim(), content: form.content.trim(), parent_id: replyTo.value },
    })
    form.content = ''
    replyTo.value = null
    replyName.value = ''
    success.value = '评论成功！'
    setTimeout(() => success.value = '', 3000)
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || '评论失败，请稍后重试'
  } finally { submitting.value = false }
}

onMounted(() => load())
</script>
