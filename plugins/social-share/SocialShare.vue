<!--
  插件：社交分享 (social-share)
  功能：文章页底部显示分享按钮（复制链接 / 微博 / Twitter）
  使用：在 posts/[slug].vue 中 import SocialShare from '~/plugins/social-share/SocialShare.vue'
        然后在模板中 <SocialShare />
  依赖：需要 post ref 包含 title 属性
-->
<template>
  <div class="flex items-center gap-2 mb-6 text-sm">
    <span class="text-gray-400">分享：</span>
    <button @click="copyLink" class="px-3 py-1 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 text-xs">
      {{ copied ? '✅ 已复制' : '📋 复制链接' }}
    </button>
    <a :href="shareWeibo" target="_blank" class="px-3 py-1 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 text-xs">📢 微博</a>
    <a :href="shareTwitter" target="_blank" class="px-3 py-1 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 text-xs">🐦 Twitter</a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string }>()
const copied = ref(false)

const shareUrl = computed(() => encodeURIComponent(window?.location?.href || ''))
const shareTitle = computed(() => encodeURIComponent(props.title || ''))
const shareWeibo = computed(() => `https://service.weibo.com/share/share.php?url=${shareUrl.value}&title=${shareTitle.value}`)
const shareTwitter = computed(() => `https://twitter.com/intent/tweet?url=${shareUrl.value}&text=${shareTitle.value}`)

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
