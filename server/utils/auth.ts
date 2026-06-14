// 统一认证入口 — 所有管理 API 必须调用
import { verifyToken } from '~~/server/utils/jwt'
import type { JwtPayload } from '~~/types'

export async function requireAuth(event: any): Promise<JwtPayload> {
  const auth = (event.headers?.get?.('authorization') || '') as string
  if (!auth?.startsWith?.('Bearer ')) {
    throw createError({ statusCode: 401, message: '未登录，请先登录' })
  }
  const token = auth.slice(7)
  const payload = await verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, message: '登录已过期，请重新登录' })
  }
  return payload
}
