<template>
  <div class="border rounded dark:border-gray-600">
    <div v-if="editor" class="flex gap-1 p-2 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex-wrap">
      <button v-for="btn in buttons" :key="btn.action" @click="btn.action"
        :class="['px-2 py-1 text-xs rounded', btn.isActive?.() ? 'bg-purple-100 dark:bg-purple-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700']"
        :title="btn.label">
        {{ btn.icon }}
      </button>
    </div>
    <editor-content :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[300px]" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: '开始写作...' }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val)
  }
})

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
