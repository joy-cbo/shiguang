<template>
  <div v-if="repo" class="mt-8 border-t dark:border-gray-700 pt-6">
    <h3 class="font-semibold mb-4">评论</h3>
    <div ref="giscusContainer"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * Giscus 评论插件 — GitHub Discussions 驱动的评论系统
 *
 * 使用方式：
 *   <GiscusComments repo="joy-cbo/shiguang-blog" repo-id="R_xxx" category="Announcements" category-id="DIC_xxx" />
 *
 * 配置步骤：
 *   1. GitHub 仓库 Settings → Features → 勾选 Discussions
 *   2. 安装 Giscus App: https://github.com/apps/giscus
 *   3. 访问 https://giscus.app/zh-CN 获取 repo-id / category-id
 *   4. 在此组件传入对应 props
 */
const props = defineProps<{
  repo?: string           // 如 "joy-cbo/shiguang-blog"
  repoId?: string          // GitHub API 返回的仓库 ID
  category?: string        // Discussions 分类名
  categoryId?: string      // Discussions 分类 ID
  theme?: string           // 默认 "preferred_color_scheme"
  mapping?: string         // 默认 "pathname"
}>()

const giscusContainer = ref<HTMLElement>()

onMounted(() => {
  if (!props.repo || !props.repoId || !props.categoryId) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', props.repo)
  script.setAttribute('data-repo-id', props.repoId)
  script.setAttribute('data-category', props.category || 'Announcements')
  script.setAttribute('data-category-id', props.categoryId)
  script.setAttribute('data-mapping', props.mapping || 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'bottom')
  script.setAttribute('data-theme', props.theme || 'preferred_color_scheme')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  giscusContainer.value?.appendChild(script)
})
</script>
