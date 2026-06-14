<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: 'desktop' | 'mobile' | 'footer'
}>(), { mode: 'desktop' })

const emit = defineEmits<{ click: [] }>()

const { isLoggedIn, menuOpen } = useSite()

function handleClick() {
  menuOpen.value = false
  emit('click')
}

const links = [
  { to: '/', label: '首页' },
  { to: '/archive', label: '归档' },
  { to: '/links', label: '友链' },
  { to: '/about', label: '关于' },
]
</script>

<template>
  <template v-if="mode === 'desktop'">
    <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
      class="hover:text-purple-600 transition-colors">{{ l.label }}</NuxtLink>
    <NuxtLink to="/yibai" class="hover:text-orange-500 transition-colors flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>
      壹佰
    </NuxtLink>
    <NuxtLink v-if="isLoggedIn" to="/admin" class="hover:text-purple-600 transition-colors">后台管理</NuxtLink>
    <NuxtLink v-if="!isLoggedIn" to="/admin/login" class="hover:text-purple-600 transition-colors">登录</NuxtLink>
  </template>

  <template v-else-if="mode === 'mobile'">
    <NuxtLink v-for="l in links" :key="l.to" :to="l.to" @click="handleClick"
      class="block py-1.5 hover:text-purple-600">{{ l.label }}</NuxtLink>
    <NuxtLink to="/yibai" @click="handleClick"
      class="block py-1.5 hover:text-orange-500 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>
      壹佰
    </NuxtLink>
    <NuxtLink v-if="isLoggedIn" to="/admin" @click="handleClick" class="block py-1.5 hover:text-purple-600">后台管理</NuxtLink>
    <NuxtLink v-if="!isLoggedIn" to="/admin/login" @click="handleClick" class="block py-1.5 hover:text-purple-600">登录</NuxtLink>
  </template>

  <template v-else-if="mode === 'footer'">
    <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="hover:text-purple-500">{{ l.label }}</NuxtLink>
    <NuxtLink to="/yibai" class="hover:text-orange-500">壹佰</NuxtLink>
  </template>
</template>
