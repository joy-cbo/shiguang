<!-- 主题切换器 — 根据 activeTheme 渲染不同主题布局 -->
<script setup lang="ts">
import SaasTheme from '~/themes/saas/layout.vue'
import DefaultTheme from '~/themes/default/layout.vue'

const { activeTheme } = useTheme()
activeTheme.value = 'saas'
</script>
<template>
  <SaasTheme v-if="activeTheme === 'saas'"><slot /></SaasTheme>
  <DefaultTheme v-else><slot /></DefaultTheme>
  <Toast />
</template>
