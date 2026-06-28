<template>
  <div class="border rounded dark:border-gray-600">
    <div v-if="editor" class="flex gap-1 p-2 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex-wrap items-center">
      <!-- Markdown 模式切换 -->
      <button @click="toggleMarkdownMode" 
        :class="['px-2 py-1 text-xs rounded font-mono', isMarkdownMode ? 'bg-purple-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700']"
        title="Markdown 模式">
        MD
      </button>
      <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      <!-- 富文本工具栏 -->
      <template v-if="!isMarkdownMode">
        <button v-for="btn in buttons" :key="btn.label" @click="btn.action"
          :class="['px-2 py-1 text-xs rounded', btn.isActive?.() ? 'bg-purple-100 dark:bg-purple-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700']"
          :title="btn.label">
          {{ btn.icon }}
        </button>
      </template>
    </div>
    
    <!-- Markdown 模式：纯文本输入 -->
    <textarea v-if="isMarkdownMode" 
      v-model="markdownContent"
      @input="onMarkdownInput"
      class="w-full p-4 min-h-[300px] font-mono text-sm bg-white dark:bg-gray-900 resize-none focus:outline-none"
      placeholder="输入 Markdown 内容..."></textarea>
    
    <!-- 富文本模式：TipTap 编辑器 -->
    <editor-content v-else :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[300px]" />
    
    <!-- Markdown 预览（可选） -->
    <div v-if="isMarkdownMode && showPreview" class="border-t dark:border-gray-600 p-4">
      <div class="text-xs text-gray-500 mb-2">预览：</div>
      <div v-html="previewHtml" class="prose dark:prose-invert max-w-none"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { marked } from 'marked'
import { sanitizeHtml } from '~/composables/useSanitize'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])

// Markdown 模式状态
const isMarkdownMode = ref(false)
const markdownContent = ref('')
const showPreview = ref(false)

// 将 HTML 转换为 Markdown（简单实现）
function htmlToMarkdown(html: string): string {
  if (!html) return ''
  // 简单的 HTML 到 Markdown 转换
  let md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
    .replace(/<hr[^>]*\/?>/gi, '---\n\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return md
}

// 将 Markdown 转换为 HTML
function markdownToHtml(md: string): string {
  if (!md) return ''
  return sanitizeHtml(marked(md))
}

// 预览 HTML
const previewHtml = computed(() => {
  return markdownToHtml(markdownContent.value)
})

// 切换 Markdown 模式
function toggleMarkdownMode() {
  if (isMarkdownMode.value) {
    // 从 Markdown 切换到富文本
    const html = markdownToHtml(markdownContent.value)
    if (editor.value) {
      editor.value.commands.setContent(html)
      emit('update:modelValue', html)
    }
  } else {
    // 从富文本切换到 Markdown
    const html = editor.value?.getHTML() || ''
    markdownContent.value = htmlToMarkdown(html)
  }
  isMarkdownMode.value = !isMarkdownMode.value
}

// Markdown 输入处理
function onMarkdownInput() {
  const html = markdownToHtml(markdownContent.value)
  emit('update:modelValue', html)
}

// TipTap 编辑器配置
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: '开始写作...' }),
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ],
  onUpdate: ({ editor }) => {
    if (!isMarkdownMode.value) {
      emit('update:modelValue', editor.getHTML())
    }
  },
})

// 同步外部值变化
watch(() => props.modelValue, (val) => {
  if (editor.value && !isMarkdownMode.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val)
  }
})

// 工具栏按钮
const buttons = [
  { icon: 'B', label: '加粗', action: () => editor.value?.chain().focus().toggleBold().run(), isActive: () => editor.value?.isActive('bold') },
  { icon: 'I', label: '斜体', action: () => editor.value?.chain().focus().toggleItalic().run(), isActive: () => editor.value?.isActive('italic') },
  { icon: 'H1', label: '标题1', action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.value?.isActive('heading', { level: 1 }) },
  { icon: 'H2', label: '标题2', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.value?.isActive('heading', { level: 2 }) },
  { icon: 'H3', label: '标题3', action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.value?.isActive('heading', { level: 3 }) },
  { icon: '•', label: '列表', action: () => editor.value?.chain().focus().toggleBulletList().run(), isActive: () => editor.value?.isActive('bulletList') },
  { icon: '1.', label: '编号', action: () => editor.value?.chain().focus().toggleOrderedList().run(), isActive: () => editor.value?.isActive('orderedList') },
  { icon: '>', label: '引用', action: () => editor.value?.chain().focus().toggleBlockquote().run(), isActive: () => editor.value?.isActive('blockquote') },
  { icon: '—', label: '分割线', action: () => editor.value?.chain().focus().setHorizontalRule().run() },
  { icon: '↩', label: '撤销', action: () => editor.value?.chain().focus().undo().run() },
  { icon: '↪', label: '重做', action: () => editor.value?.chain().focus().redo().run() },
]

onBeforeUnmount(() => editor.value?.destroy())
</script>
