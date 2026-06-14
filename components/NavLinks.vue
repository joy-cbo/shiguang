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
    <NuxtLink v-if="isLoggedIn" to="/admin" class="hover:text-purple-600 transition-colors">后台管理</NuxtLink>
    <NuxtLink v-if="!isLoggedIn" to="/admin/login" class="hover:text-purple-600 transition-colors">登录</NuxtLink>
  </template>

  <template v-else-if="mode === 'mobile'">
    <NuxtLink v-for="l in links" :key="l.to" :to="l.to" @click="handleClick"
      class="block py-1.5 hover:text-purple-600">{{ l.label }}</NuxtLink>
    <NuxtLink v-if="isLoggedIn" to="/admin" @click="handleClick" class="block py-1.5 hover:text-purple-600">后台管理</NuxtLink>
    <NuxtLink v-if="!isLoggedIn" to="/admin/login" @click="handleClick" class="block py-1.5 hover:text-purple-600">登录</NuxtLink>
  </template>

  <template v-else-if="mode === 'footer'">
    <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="hover:text-purple-500">{{ l.label }}</NuxtLink>
  </template>
</template>
