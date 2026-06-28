// 全局 Toast 通知 — 右上角弹出，3秒消失，支持堆叠
// 🔧 全局单例状态，确保 Toast.vue 和其他组件共享同一 toasts 数组

const toasts = ref<Array<{ id: number; message: string; type: 'success' | 'error' }>>([])
let idCounter = 0

export function useToast() {
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return { toasts, showToast }
}
