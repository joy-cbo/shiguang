<template>
  <NuxtLayout name="default">
    <!-- Hero 区域 -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-white to-orange-50 p-6 md:p-10 mb-8 border border-purple-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <CatDecorations :cats="2" :paws="5" :maxOpacity="0.06" />
      <h1 class="text-2xl md:text-3xl font-bold mb-2 inline-flex items-center gap-2 relative"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg> 壹佰的成长时光</h1>
      <p class="text-gray-500 text-sm relative">一只橘猫的成长故事，用时间轴记录每一个珍贵瞬间</p>
      <!-- 体重/事件统计 -->
      <div class="flex gap-4 mt-4 text-xs text-gray-400 relative" v-if="events.length">
        <span class="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ events.length }} 个瞬间</span>
        <span class="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> {{ photoEvents.length }} 张影像</span>
      </div>
    </div>

    <!-- 标签切换 -->
    <div class="flex gap-1 mb-6 bg-purple-50/50 rounded-lg p-1 w-fit border border-purple-100/30">
      <button
        @click="tab = 'timeline'"
        class="px-4 py-1.5 rounded-md text-sm transition-colors"
        :class="tab === 'timeline' ? ('gradient-bg text-white font-bold') : 'text-gray-500 hover:text-purple-600'"
      ><span class="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 时光轴</span></button>
      <button
        @click="tab = 'photos'"
        class="px-4 py-1.5 rounded-md text-sm transition-colors"
        :class="tab === 'photos' ? ('gradient-bg text-white font-bold') : 'text-gray-500 hover:text-purple-600'"
      ><span class="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> 照片墙</span></button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-10 text-gray-400">加载中...</div>

    <!-- ========== 时光轴视图 ========== -->
    <div v-else-if="tab === 'timeline' && events.length" class="relative pl-8 border-l-2 border-orange-200 dark:border-orange-800">
      <div
        v-for="e in events"
        :key="e.id"
        class="mb-8 relative"
      >
        <div class="absolute -left-[2.15rem] top-1 w-4 h-4 rounded-full border-2 border-orange-400 bg-white dark:bg-gray-900"
          :class="{
            'border-purple-400 bg-purple-100 dark:bg-purple-900': e.type === 'milestone',
            'border-orange-400 bg-orange-100 dark:bg-orange-900': e.type === 'weight',
            'border-pink-300 bg-pink-50 dark:bg-pink-900': e.type === 'photo',
            'border-amber-300 bg-amber-50 dark:bg-amber-900': e.type === 'expense',
            'border-rose-400 bg-rose-50 dark:bg-rose-900': e.type === 'health',
            'border-violet-400 bg-violet-50 dark:bg-violet-900': e.type === 'video',
          }"
        ></div>
        <div class="text-xs text-gray-400 mb-1">{{ formatDate(e.event_date, 'yyyy年M月d日') }}</div>
        <div class="p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:border-purple-200 transition-all duration-300">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <h3 class="font-bold text-lg">{{ e.title }}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full"
              :class="{
                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300': e.type === 'milestone',
                'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300': e.type === 'weight',
                'bg-pink-50 text-pink-600 dark:bg-pink-900 dark:text-pink-300': e.type === 'photo',
                'bg-amber-50 text-amber-600 dark:bg-amber-900 dark:text-amber-300': e.type === 'expense',
                'bg-rose-50 text-rose-600 dark:bg-rose-900 dark:text-rose-300': e.type === 'health',
                'bg-violet-50 text-violet-600 dark:bg-violet-900 dark:text-violet-300': e.type === 'video',
              }"
            >{{ typeLabel(e.type) }}</span>
            <span v-if="e.weight" class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{{ e.weight }}</span>
          </div>
          <p v-if="e.content" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ e.content }}</p>
          <!-- 视频 -->
          <video
            v-if="e.photo_url && e.type === 'video'"
            :src="e.photo_url"
            controls
            preload="metadata"
            class="mt-3 rounded-lg max-w-full max-h-80"
          ></video>
          <!-- 图片 -->
          <img
            v-else-if="e.photo_url"
            :src="e.photo_url"
            :alt="e.title"
            class="mt-3 rounded-lg max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            @click="openLightbox(e.photo_url)"
          />
        </div>
      </div>
    </div>

    <!-- ========== 照片墙视图 ========== -->
    <div v-else-if="tab === 'photos'">
      <div v-if="photoEvents.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(p, idx) in photoEvents"
          :key="p.id"
          class="group cursor-pointer"
          @click="p.type === 'video' ? playVideo(p) : openLightboxByIdx(idx)"
        >
          <div class="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
            <!-- 视频 -->
            <video
              v-if="p.type === 'video'"
              :ref="el => { if (el) videoRefs[p.id] = el }"
              :src="p.photo_url"
              class="w-full h-full object-cover"
              preload="metadata"
              muted
              playsinline
            ></video>
            <div v-if="p.type === 'video'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" class="drop-shadow-lg opacity-80"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
            </div>
            <!-- 图片 -->
            <img
              v-else
              :src="p.photo_url"
              :alt="p.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="mt-2 text-xs text-gray-400">{{ formatDate(p.event_date, 'yyyy年M月d日') }}</div>
          <div class="text-sm font-medium truncate">{{ p.title }}</div>
        </div>
      </div>
      <div v-else class="text-center py-10 text-gray-400">
        <p class="mb-2 opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></p>
        <p>还没有照片，敬请期待～</p>
      </div>
    </div>

    <!-- 没有事件 -->
    <div v-else-if="tab === 'timeline'" class="text-center py-10 text-gray-400">
      <p class="text-3xl mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg></p>
      <p>还没有成长记录，敬请期待～</p>
    </div>

    <!-- ========== 灯箱 ========== -->
    <Teleport to="body">
      <div v-if="lightboxIndex !== null" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" @click="lightboxIndex = null">
        <!-- 关闭 -->
        <button @click="lightboxIndex = null" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10 flex items-center justify-center w-10 h-10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>

        <!-- 左箭头 -->
        <button
          v-if="lightboxIndex > 0"
          @click.stop="lightboxIndex--"
          class="absolute left-4 text-white hover:text-gray-300 z-10 w-10 h-10 flex items-center justify-center"
        ><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>

        <!-- 图片 -->
        <img
          :src="photoEvents[lightboxIndex]?.photo_url"
          :alt="photoEvents[lightboxIndex]?.title"
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          @click.stop
        />

        <!-- 右箭头 -->
        <button
          v-if="lightboxIndex < photoEvents.length - 1"
          @click.stop="lightboxIndex++"
          class="absolute right-4 text-white hover:text-gray-300 z-10 w-10 h-10 flex items-center justify-center"
        ><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>

        <!-- 标题 -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center">
          <div class="text-sm opacity-70">{{ formatDate(photoEvents[lightboxIndex]?.event_date, 'yyyy年M月d日') }}</div>
          <div class="font-bold">{{ photoEvents[lightboxIndex]?.title }}</div>
          <div class="text-xs opacity-50 mt-1">{{ lightboxIndex! + 1 }} / {{ photoEvents.length }}</div>
        </div>
      </div>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { YibaiEvent } from '~/types'

const { formatDate } = useFormat()
const tab = ref<'timeline' | 'photos'>('timeline')

const { data, pending } = await useFetch<{ events: YibaiEvent[] }>('/api/yibai')
const loading = computed(() => pending.value)
const events = computed(() => data.value?.events || [])

// 筛选有照片的事件，日期倒序
const photoEvents = computed(() =>
  events.value.filter((e: YibaiEvent) => e.photo_url).reverse()
)

// 灯箱
const lightboxIndex = ref<number | null>(null)
const videoRefs = ref<Record<number, HTMLVideoElement>>({})

function playVideo(p: YibaiEvent) {
  const el = videoRefs.value[p.id]
  if (!el) return
  if (el.paused) {
    el.muted = false
    el.play()
  } else {
    el.pause()
  }
}

function openLightbox(url: string) {
  const idx = photoEvents.value.findIndex((p: YibaiEvent) => p.photo_url === url)
  lightboxIndex.value = idx >= 0 ? idx : 0
}

function openLightboxByIdx(idx: number) {
  lightboxIndex.value = idx
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    milestone: '里程碑',
    weight: '体重',
    photo: '照片',
    video: '视频',
    expense: '花费',
    health: '健康',
  }
  return map[t] || t
}
</script>
