// 诊断接口 — 仅管理员可访问
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId, role } = await requireAuth(event)
  if (role !== 'admin') throw createError({ statusCode: 403, message: '仅管理员可访问' })
  const cf = (event.context as any)?.cloudflare
  const env = cf?.env
  const ctx = cf?.ctx
  const globalEnv = (globalThis as any).__env__
  const globalDB = (globalThis as any).DB

  return {
    hasCloudflareContext: !!cf,
    hasGlobalEnv: !!globalEnv,
    hasGlobalDB: !!globalDB,
    ok: true,
  }
})
