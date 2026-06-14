<script setup lang="ts">
const { footerInfo, siteSubtitle } = useSite()
</script>

<template>
  <footer class="mt-12">
    <div class="max-w-5xl mx-auto px-6">
      <div class="h-px bg-gradient-to-r from-purple-600/30 via-orange-500/30 to-transparent"></div>
    </div>
    <div class="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
      <div class="flex gap-4">
        <NavLinks mode="footer" />
      </div>
      <div class="text-center">
        <p v-if="siteSubtitle" class="text-gray-500 mb-1 italic">「{{ siteSubtitle }}」</p>
        <p>{{ footerInfo || '© 2026 拾光博客 · 不忘初心，拾起时光' }}</p>
      </div>
    </div>
  </footer>
</template>
