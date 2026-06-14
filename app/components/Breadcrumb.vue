<template>
  <nav v-if="items.length" :class="'flex items-center gap-1.5 text-sm text-gray-400 mb-4 flex-wrap'">
    <NuxtLink to="/" :class="'hover:text-purple-500 transition-colors'">首页</NuxtLink>
    <template v-for="(item, i) in items" :key="i">
      <span class="text-gray-300">/</span>
      <NuxtLink v-if="item.to" :to="item.to" :class="'hover:text-purple-500 transition-colors'">{{ item.label }}</NuxtLink>
      <span v-else class="text-gray-600 dark:text-gray-300">{{ item.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ items: { label: string; to?: string }[] }>()
</script>
