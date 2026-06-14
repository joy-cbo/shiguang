<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id"
        :class="['px-4 py-2.5 rounded-lg shadow-lg text-sm text-white font-medium pointer-events-auto',
          t.type === 'success' ? 'bg-green-600' : 'bg-red-600']">
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/lib/useToast'
const { toasts } = useToast()
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
