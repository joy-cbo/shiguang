<template>
  <NuxtPage />
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - 拾光博客` : '拾光博客 - 拾起时光碎片'
  },
  meta: [
    { name: 'description', content: '拾起时光碎片 — 记录生活中的点滴思考与感悟' },
    { name: 'keywords', content: '博客,拾光,随笔,技术,生活' },
    { property: 'og:title', content: '拾光博客' },
    { property: 'og:description', content: '拾起时光碎片 — 记录生活中的点滴思考与感悟' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: '拾光博客' },
    { property: 'og:locale', content: 'zh_CN' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: '拾光博客' },
    { name: 'twitter:description', content: '拾起时光碎片 — 记录生活中的点滴思考与感悟' },
    { name: 'baidu-site-verification', content: 'codeva-46qB8VUdXq' },
  ],
  link: [
    { rel: 'alternate', type: 'application/rss+xml', title: '拾光博客 RSS', href: '/api/rss.xml' },
  ],
})
</script>
