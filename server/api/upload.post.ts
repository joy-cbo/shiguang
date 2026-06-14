// POST /api/upload — 文件上传到 R2
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

const ALLOWED = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'mp4', 'webm', 'mov', 'pdf']
const MAX_SIZE = 10 * 1024 * 1024
const MAGIC: Record<string, number[]> = {
  jpg: [0xFF, 0xD8, 0xFF], png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46], webp: [0x52, 0x49, 0x46, 0x46],
  mp4: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], pdf: [0x25, 0x50, 0x44, 0x46],
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`upload:${ip}`, 20, 3600)

  const form = await readMultipartFormData(event)
  if (!form?.length) throw createError({ statusCode: 400, message: '请选择文件' })

  const file = form[0]
  if (!file.filename) throw createError({ statusCode: 400, message: '无效文件' })
  if (file.data.length > MAX_SIZE) throw createError({ statusCode: 413, message: '文件不能超过10MB' })

  const ext = (file.filename.split('.').pop() || '').toLowerCase()
  if (!ALLOWED.includes(ext)) throw createError({ statusCode: 400, message: `不支持的文件类型: .${ext}` })

  const sigExt = ext === 'jpeg' ? 'jpg' : ext
  if (MAGIC[sigExt] && !MAGIC[sigExt].every((b, i) => file.data[i] === b)) {
    throw createError({ statusCode: 400, message: '文件内容与扩展名不匹配' })
  }

  const newName = `${crypto.randomUUID()}.${ext}`

  // R2 存储
  const r2 = (event.context as any)?.cloudflare?.env?.R2
  if (!r2) throw createError({ statusCode: 500, message: '文件存储服务暂不可用' })
  await r2.put(newName, file.data, { httpMetadata: { contentType: file.type || '' } })

  return { url: `/uploads/${newName}`, filename: file.filename }
})
