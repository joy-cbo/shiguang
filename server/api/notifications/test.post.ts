// 发送测试通知
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sendAndLog } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`notify-test:${ip}`, 3, 300)

  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px">
    <h2 style="color:#1d4ed8">📨 测试通知</h2>
    <p>这封邮件来自 <b>拾光博客</b> 的通知系统。</p>
    <p>发送时间：${now}</p>
    <p style="color:#6b7280;font-size:12px">如果您能收到这封邮件，说明通知配置成功 ✅</p>
    <hr style="border-color:#e5e7eb;margin:16px 0">
    <p style="color:#9ca3af;font-size:11px">拾光博客 · 拾起时光碎片</p>
  </div>`

  const result = await sendAndLog(event, 'test', '测试通知', html)

  if (result.success) {
    return { success: true, message: `测试邮件已发送${result.id ? ' (ID: ' + result.id + ')' : ''}` }
  }
  return { success: false, message: result.message || '发送失败' }
})
