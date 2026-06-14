<template>
  <NuxtLayout name="default">
    <div class="text-center py-20">
      <h1 class="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
      <p class="text-gray-500 mb-6">页面未找到</p>
      <div class="space-x-4">
        <NuxtLink to="/" class="text-purple-500 hover:underline">返回首页</NuxtLink>
        <NuxtLink to="/archive" class="text-purple-500 hover:underline">文章归档</NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>
