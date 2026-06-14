<!-- SaaS 紫橙主题布局 — 完整源码 -->
<template>
  <div class="min-h-screen bg-[#f8f9fc]">
    <nav class="sticky top-0 z-50 backdrop-blur-xl bg-white/72 border-b border-gray-100/50">
      <div class="h-0.5 gradient-bg"></div>
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img v-if="headerDisplay !== 'title' && siteLogo" :src="siteLogo" class="h-8 rounded-lg" alt="Logo" />
          <span v-if="headerDisplay !== 'logo'" class="text-lg font-bold gradient-text">{{ siteTitle }}</span>
        </NuxtLink>
        <div class="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <SearchBox />
          <NavLinks mode="desktop" />
          <button v-if="isLoggedIn" @click="logout" class="hover:text-red-500 transition-colors">退出</button>
        </div>
        <div class="flex items-center gap-2 md:hidden">
          <SearchBox />
          <button @click="menuOpen = !menuOpen" class="p-1 text-xl flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div v-if="menuOpen" class="md:hidden border-t border-gray-100 bg-white px-6 py-3 space-y-2 text-sm text-gray-500">
        <NavLinks mode="mobile" @click="menuOpen = false" />
        <button v-if="isLoggedIn" @click="logout(); menuOpen = false" class="block py-1.5 text-red-500 w-full text-left">退出</button>
      </div>
    </nav>
    <main class="max-w-5xl mx-auto px-6 py-8">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const {
  siteTitle, siteLogo, headerDisplay,
  isLoggedIn, menuOpen,
  fetchSettings, logout,
} = useSite()

onMounted(() => fetchSettings())
</script>
