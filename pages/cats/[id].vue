<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <CatDecorations :cats="2" :paws="4" :maxOpacity="0.05" />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <NuxtLink to="/cats" class="text-purple-600 text-sm mb-4 inline-block">← 返回</NuxtLink>

      <div v-if="loading" class="text-center py-16 text-gray-400">加载中...</div>

      <div v-else-if="cat" class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-24 h-24 rounded-full gradient-bg flex items-center justify-center text-white text-4xl">🐱</div>
            <div>
              <h1 class="text-2xl font-bold">{{ cat.name }}</h1>
              <p class="text-gray-500">{{ cat.color }} · {{ cat.gender === '公' ? '弟弟' : cat.gender === '母' ? '妹妹' : cat.gender }} · {{ cat.breed }}</p>
              <p class="text-xs text-gray-400 mt-1" v-if="cat.adopted_date">到家 {{ formatDate(cat.adopted_date, 'yyyy年M月d日') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-bold mb-4">📅 健康日历</h2>
          <div class="space-y-2">
            <div v-for="r in reminders" :key="r.id" class="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
              <div>
                <span class="font-medium text-sm">{{ reminderLabel(r.type) }}</span>
                <span class="text-xs text-gray-400 ml-2">每 {{ r.interval_days }} 天</span>
              </div>
              <div class="text-sm">
                <span :class="isDue(r.next_date) ? 'text-red-500 font-semibold' : 'text-gray-500'">
                  {{ formatDate(r.next_date, 'M月d日') }}
                </span>
                <span v-if="isDue(r.next_date)" class="text-xs text-red-400 ml-1">即将到期</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-bold mb-4">🩺 健康记录</h2>
          <div class="space-y-3">
            <div v-for="r in healthRecords" :key="r.id" class="flex items-start gap-3 py-2 border-b dark:border-gray-700 last:border-0">
              <span class="text-lg">{{ r.type === '疫苗' ? '💉' : r.type === '驱虫' ? '🪱' : '🏥' }}</span>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ r.detail }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(r.record_date, 'yyyy年M月d日') }} · {{ r.vet || '居家' }} <span v-if="r.cost">· ¥{{ r.cost }}</span></p>
              </div>
              <span v-if="r.next_date" class="text-xs text-purple-500 whitespace-nowrap">下次 {{ formatDate(r.next_date, 'M/d') }}</span>
            </div>
            <p v-if="!healthRecords.length" class="text-gray-400 text-center py-4">暂无健康记录</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm" v-if="weightData.length">
          <h2 class="text-lg font-bold mb-4">📈 体重曲线（克）</h2>
          <div class="relative" style="height: 260px">
            <svg viewBox="0 0 600 220" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#9333ea" />
                  <stop offset="100%" stop-color="#ea580c" />
                </linearGradient>
              </defs>
              <!-- 网格线（6条含0基线） -->
              <line v-for="i in 6" :key="'grid'+i"
                :x1="chartLeft" :y1="20 + (i-1)*36" :x2="chartRight" :y2="20 + (i-1)*36"
                :stroke="i===6 ? '#d1d5db' : '#e5e7eb'" stroke-width="0.5" stroke-dasharray="4,4" />
              <!-- Y轴标签 -->
              <text v-for="i in 6" :key="'yl'+i"
                :x="chartLeft - 6" :y="24 + (i-1)*36"
                text-anchor="end" class="text-[10px]" fill="#9ca3af">
                <template v-if="i === 6">0</template>
                <template v-else>{{ Math.round(maxWeight * (6-i) / 5) }}</template>
              </text>
              <!-- 数据点连线 -->
              <polyline
                :points="linePoints"
                fill="none" stroke="url(#lineGrad)" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" />
              <!-- 渐变填充区域 -->
              <polygon
                :points="areaPoints"
                fill="url(#lineGrad)" opacity="0.08" />
              <!-- 数据点 -->
              <circle v-for="(w, i) in weightData" :key="'dot'+i"
                :cx="xPos(i)" :cy="yPos(w.weightNum)" r="4"
                fill="white" stroke="url(#lineGrad)" stroke-width="2.5" />
              <!-- 数值标签 -->
              <text v-for="(w, i) in weightData" :key="'label'+i"
                :x="xPos(i)" :y="yPos(w.weightNum) - 12"
                text-anchor="middle" class="text-[11px] font-semibold"
                :fill="i === weightData.length - 1 ? '#ea580c' : '#6b7280'">
                {{ w.weightNum }}
              </text>
              <!-- 日期标签 -->
              <text v-for="(w, i) in weightData" :key="'date'+i"
                :x="xPos(i)" :y="216"
                text-anchor="middle" class="text-[10px]" fill="#9ca3af">
                {{ w.date.slice(5) }}
              </text>
            </svg>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-gray-400">猫咪不存在</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { formatDate } = useFormat()
const id = route.params.id as string

const cat = ref<any>(null)
const healthRecords = ref<any[]>([])
const reminders = ref<any[]>([])
const timeline = ref<any[]>([])
const loading = ref(true)

const weightData = computed(() => {
  const map = new Map<string, { date: string, weightNum: number }>()
  // timeline 先入（低优先级），health 后入覆盖
  timeline.value
    .filter((r: any) => r.weight && (r.type === 'weight' || r.type === 'milestone'))
    .forEach((r: any) => {
      map.set(r.event_date, { date: r.event_date, weightNum: parseInt(r.weight) || 0 })
    })
  healthRecords.value
    .filter((r: any) => r.type === '称重')
    .forEach((r: any) => {
      map.set(r.record_date, { date: r.record_date, weightNum: parseInt(r.detail) || 0 })
    })
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
})

const maxWeight = computed(() => Math.max(...weightData.value.map((w: any) => w.weightNum), 1500))

// SVG 坐标计算（viewBox 600x220，图表区域 x:55-580, y:20-200）
const chartLeft = 55; const chartRight = 580; const chartTop = 20; const chartBottom = 200
const xPos = (i: number) => chartLeft + i * (chartRight - chartLeft) / Math.max(weightData.value.length - 1, 1)
const yPos = (w: number) => chartBottom - (w / maxWeight.value) * (chartBottom - chartTop)
const linePoints = computed(() => weightData.value.map((w: any, i: number) => `${xPos(i)},${yPos(w.weightNum)}`).join(' '))
const areaPoints = computed(() => {
  const pts = weightData.value.map((w: any, i: number) => `${xPos(i)},${yPos(w.weightNum)}`).join(' ')
  return `${xPos(0)},${chartBottom} ${pts} ${xPos(weightData.value.length - 1)},${chartBottom}`
})

function reminderLabel(type: string) {
  const m: Record<string, string> = {
    vaccine: '💉 疫苗', deworm_external: '🪱 外驱', deworm_internal: '🪱 内驱',
    weigh: '⚖️ 称重', birthday: '🎂 生日', checkup: '🏥 体检'
  }
  return m[type] || type
}

function isDue(date: string) {
  if (!date) return false
  const diff = (new Date(date).getTime() - Date.now()) / 86400000
  return diff <= 3 && diff >= -1
}

useHead({ title: '猫咪详情 - 拾光' })

onMounted(async () => {
  try {
    const data = await $fetch(`/api/cats/${id}`) as any
    cat.value = data.cat
    healthRecords.value = data.healthRecords || []
    reminders.value = data.reminders || []
    timeline.value = data.timeline || []
    useHead({ title: `${data.cat?.name || '猫咪'} - 拾光` })
  } catch (_) {
    console.error('Failed to load cat detail')
  } finally {
    loading.value = false
  }
})
</script>