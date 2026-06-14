// 全局错误处理器 — 捕获未处理的异常，返回中文错误消息
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error) => {
    const h3Error = error as { statusCode?: number; statusMessage?: string; message?: string }
    if (h3Error.statusCode && h3Error.message) return // 已处理

    h3Error.statusCode = h3Error.statusCode || 500
    h3Error.statusMessage = '服务器内部错误'
    h3Error.message = '服务器内部错误，请稍后重试'

    if (process.env.NODE_ENV !== 'production') {
      console.error('[API Error]', error)
    }
  })
})
