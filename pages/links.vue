<!-- 友链页面 — 源码在 plugins/friend-links/pages/links.vue -->
<script setup lang="ts">
import LinksPage from '~/plugins/friend-links/pages/links.vue'
useHead({ title: '友情链接' })
</script>
<template>
  <NuxtLayout name="default">
    <LinksPage />
  </NuxtLayout>
</template>
