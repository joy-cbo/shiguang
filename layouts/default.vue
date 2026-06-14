<template>
  <SaasLayout v-if="activeTheme === 'saas'"><slot /></SaasLayout>

  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
    <CatDecorations />
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold shrink-0 flex items-center gap-2">
          <img v-if="siteLogo && headerDisplay !== 'title'" :src="siteLogo" alt="拾光" class="h-8 w-auto" />
          <span v-if="headerDisplay !== 'logo'">{{ siteTitle }}</span>
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-4 text-sm">
          <SearchBox />
          <NavLinks mode="desktop" />
          <button v-if="isLoggedIn" @click="logout" class="hover:text-red-500">退出</button>
          <button @click="toggleDark" class="text-lg">{{ isDark ? '☀️' : '🌙' }}</button>
        </nav>
        <div class="flex items-center gap-2 md:hidden">
          <SearchBox />
          <button @click="toggleDark" class="text-lg">{{ isDark ? '☀️' : '🌙' }}</button>
          <button @click="menuOpen = !menuOpen" class="p-1 text-xl flex items-center" aria-label="菜单">
            <svg v-if="menuOpen" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </div>
      <transition name="slide">
        <div v-if="menuOpen" class="md:hidden border-t dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 space-y-2 text-sm">
          <NavLinks mode="mobile" @click="menuOpen = false" />
          <button v-if="isLoggedIn" @click="logout(); menuOpen = false" class="block py-1.5 hover:text-red-500 w-full text-left">退出</button>
        </div>
      </transition>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-6"><slot /></main>
    <footer class="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-gray-400 border-t dark:border-gray-800 mt-8">
      <div class="flex justify-center gap-4 mb-3">
        <NavLinks mode="footer" />
      </div>
      <p v-if="siteSubtitle" class="text-gray-500 mb-2 italic">「{{ siteSubtitle }}」</p>
      <div v-if="socialLinks.length" class="flex justify-center gap-4 mb-3">
        <a v-for="sl in socialLinks" :key="sl.id" :href="sl.url" target="_blank" rel="noopener" class="hover:text-purple-600 transition-colors">{{ sl.platform }}</a>
      </div>
      <p v-if="footerInfo">{{ footerInfo }}</p>
    </footer>
  </div>
  <Toast />
</template>

<script setup lang="ts">
import SaasLayout from '~/layouts/saas.vue'

const {
  siteTitle, siteSubtitle, footerInfo, siteLogo, headerDisplay,
  socialLinks, isLoggedIn, menuOpen,
  fetchSettings, logout,
} = useSite()

const { activeTheme } = useTheme()
activeTheme.value = 'saas'

// 暗黑模式 — default 主题独有
const isDark = ref(false)
function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('dark_mode', String(isDark.value))
}

onMounted(async () => {
  await fetchSettings()
  // 暗黑模式初始化
  const stored = localStorage.getItem('dark_mode')
  if (stored === 'true' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true; document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
