<template>
  <nav v-if="headings.length" class="toc text-sm">
    <p class="font-semibold mb-2 text-gray-500 dark:text-gray-400">目录</p>
    <ul class="space-y-1 border-l-2 dark:border-gray-700 pl-3">
      <li v-for="h in headings" :key="h.id" :style="{ paddingLeft: (h.level - 1) * 12 + 'px' }">
        <a :href="`#${h.id}`" class="block py-0.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate" :class="{ 'text-purple-600 font-medium': h.id === activeId }">
          {{ h.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const headings = ref<{ id: string; text: string; level: number }[]>([])
const activeId = ref('')

function extractHeadings() {
  const hs = document.querySelector('.prose')?.querySelectorAll('h1,h2,h3,h4') || []
  return Array.from(hs).map((h, i) => {
    const id = h.id || `toc-${i}`
    if (!h.id) h.id = id
    return { id, text: h.textContent || '', level: parseInt(h.tagName[1]) }
  })
}

function onScroll() {
  const hs = document.querySelectorAll('.prose h1[id],.prose h2[id],.prose h3[id],.prose h4[id]')
  let current = ''
  hs.forEach(h => {
    const top = (h as HTMLElement).offsetTop
    if (window.scrollY >= top - 100) current = h.id
  })
  activeId.value = current
}

onMounted(() => {
  nextTick(() => {
    headings.value = extractHeadings()
    window.addEventListener('scroll', onScroll, { passive: true })
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
