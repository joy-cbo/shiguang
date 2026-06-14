<template>
  <div v-if="mounted" class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <!-- 猫头 -->
    <div v-for="cat in catHeads" :key="'cat-'+cat.n" class="absolute"
      :style="{ top: cat.top, left: cat.left, opacity: cat.opacity, transform: 'rotate('+cat.rotate+'deg)' }">
      <svg :width="cat.size" :height="cat.size" viewBox="0 0 24 24" fill="currentColor" :class="cat.color">
        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z"/>
        <circle cx="9" cy="12" r="1.2"/>
        <circle cx="15" cy="12" r="1.2"/>
      </svg>
    </div>
    <!-- 爪印 -->
    <div v-for="paw in pawPrints" :key="'paw-'+paw.n" class="absolute"
      :style="{ top: paw.top, left: paw.left, opacity: paw.opacity, transform: 'rotate('+paw.rotate+'deg)' }">
      <svg :width="paw.size" :height="paw.size" viewBox="0 0 40 40" fill="currentColor" :class="paw.color">
        <circle cx="10" cy="12" r="3.2"/>
        <circle cx="17" cy="7" r="3.2"/>
        <circle cx="24" cy="7" r="3.2"/>
        <circle cx="31" cy="12" r="3.2"/>
        <ellipse cx="20.5" cy="23" rx="9" ry="7"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  cats?: number
  paws?: number
  maxOpacity?: number
}>(), {
  cats: 2,
  paws: 4,
  maxOpacity: 0.03,
})

interface Decoration {
  n: number
  top: string
  left: string
  size: number
  color: string
  opacity: number
  rotate: number
}

const mounted = ref(false)
const catHeads = ref<Decoration[]>([])
const pawPrints = ref<Decoration[]>([])

onMounted(() => {
  interface Placed { top: number; left: number; size: number }
  const placed: Placed[] = []

  function dist(a: Placed, b: Placed) { return Math.sqrt((a.top - b.top) ** 2 + (a.left - b.left) ** 2) }
  function minD(a: Placed, b: Placed) { return (a.size + b.size) * 0.55 }

  function tryPlace(size: number): Placed | null {
    for (let i = 0; i < 50; i++) {
      const t = -10 + Math.random() * 95
      const l = -10 + Math.random() * 100
      const c: Placed = { top: t, left: l, size }
      if (placed.every(p => dist(c, p) >= minD(c, p))) { placed.push(c); return c }
    }
    return null
  }

  const heads: Decoration[] = []
  for (let i = 0; i < props.cats; i++) {
    const size = 80 + Math.floor(Math.random() * 60)
    const pos = tryPlace(size)
    heads.push({
      n: i,
      top: (pos?.top ?? -5 + i * 60) + '%',
      left: (pos?.left ?? 10 + i * 40) + '%',
      size, color: i % 2 ? 'text-orange-900' : 'text-purple-900',
      opacity: 0.02 + Math.random() * props.maxOpacity,
      rotate: Math.floor(Math.random() * 30) - 15,
    })
  }

  const pawColors = ['text-purple-800', 'text-purple-700', 'text-orange-800', 'text-orange-700', 'text-purple-600']
  const paws: Decoration[] = []
  for (let i = 0; i < props.paws; i++) {
    const size = 25 + Math.floor(Math.random() * 40)
    const pos = tryPlace(size)
    paws.push({
      n: i,
      top: (pos?.top ?? 10 + i * 15) + '%',
      left: (pos?.left ?? 5 + i * 18) + '%',
      size,
      color: pawColors[i % pawColors.length],
      opacity: 0.02 + Math.random() * props.maxOpacity,
      rotate: Math.floor(Math.random() * 60) - 30,
    })
  }

  catHeads.value = heads
  pawPrints.value = paws
  mounted.value = true
})
</script>
