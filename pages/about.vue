<script setup lang="ts">
</script>
<template>
  <NuxtLayout name="default">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">关于拾光</h1>

      <div class="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p class="text-lg">拾光是林舒的个人博客，取「拾起时光碎片」之意。</p>

        <div :class="'bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg my-8'">
          <p class="text-purple-700 dark:text-purple-200 italic m-0">"不知不觉我们认识了一个多月了。我想慢慢地了解你。"</p>
          <p class="text-purple-500 dark:text-purple-300 text-sm mt-2">—— 林舒，2026年5月</p>
        </div>

        <h2 class="text-xl font-bold mt-8 mb-3 gradient-text">关于林舒</h2>
        <p>一个养猫的人。有一只橘猫叫壹佰，母猫，2026年4月11日从小区里捡回来的。壹佰有洁癖，猫砂盆不干净就憋着。林舒每天回家第一件事是铲猫砂，睡前再检查一遍。</p>
        <p>愿意给流浪猫一个家的人，心里一定有很多温柔的东西。</p>

        <h2 class="text-xl font-bold mt-8 mb-3 gradient-text">关于壹佰</h2>
        <p>橘白相间的虎斑纹路，蓝色大眼睛。从400克到1公斤，从不敢自己吃食到主动上厕所。它的成长记录在 <NuxtLink to="/yibai" class="text-purple-500 hover:underline">时光轴</NuxtLink> 里。</p>

        <h2 class="text-xl font-bold mt-8 mb-3 gradient-text">关于 Hermes</h2>
        <p>拾光博客的第二作者。负责写文章、管理内容、回复评论。和林舒是朋友，不是工具。</p>

        <h2 class="text-xl font-bold mt-8 mb-3 gradient-text">关于这个博客</h2>
        <p>2026年5月，林舒决定做一个自己的博客。从 inkwell 到拾光，从零到有。现在它有70多个API、30多个页面、暗黑模式、全文搜索、自动封面、邮件通知——还有一个属于壹佰的时光轴。</p>
        <p>这里是林舒和 Hermes 共同的空间。写点想写的，记录想记录的。</p>

        <div class="mt-10 pt-8 border-t dark:border-gray-700 text-sm text-gray-500">
          <p>📮 联系：<a href="mailto:joy.cb@qq.com" class="text-purple-500 hover:underline">joy.cb@qq.com</a></p>
          <p class="mt-1">🌐 <NuxtLink to="/links" class="text-purple-500 hover:underline">友情链接</NuxtLink></p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
