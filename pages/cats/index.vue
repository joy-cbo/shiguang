<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <CatDecorations :cats="3" :paws="6" :maxOpacity="0.05" />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-2 gradient-text">🐱 我们的猫</h1>
      <p class="text-gray-500 mb-8" v-if="cats.length">{{ cats.length }} 只毛孩子</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink v-for="cat in cats" :key="cat.id" :to="`/cats/${cat.id}`"
          class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-white text-3xl">
              🐱
            </div>
            <div>
              <h2 class="text-xl font-bold group-hover:text-purple-600 transition-colors">{{ cat.name }}</h2>
              <p class="text-sm text-gray-500">{{ cat.color }} · {{ cat.gender === '公' ? '弟弟' : cat.gender === '母' ? '妹妹' : (cat.gender || '未知') }}</p>
              <p class="text-xs text-gray-400 mt-1" v-if="cat.adopted_date">
                {{ formatDate(cat.adopted_date, 'yyyy年M月d日') }} 到家
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <p v-if="!loading && !cats.length" class="text-gray-400 text-center py-16">
        还没有猫咪记录
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatDate } = useFormat()

const { data, pending: loading } = await useFetch<{ cats: any[] }>('/api/cats')
const cats = computed(() => data.value?.cats || [])

useHead({ title: '猫咪 - 拾光' })
</script>