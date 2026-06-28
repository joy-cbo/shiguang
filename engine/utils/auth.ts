// 统一认证入口 — 所有管理 API 必须调用
import { verifyToken } from './jwt'
import type { JwtPayload } from '~/types'

export async function requireAuth(event: any): Promise<JwtPayload> {
  let token: string | undefined

  // 1. 首先检查 Authorization header（兼容旧客户端）
  const auth = (event.headers?.get?.('authorization') || '') as string
  if (auth?.startsWith?.('Bearer ')) {
    token = auth.slice(7)
  }

  // 2. 如果没有 header，检查 httpOnly cookie（更安全）
  if (!token) {
    token = getCookie(event, 'auth_token')
  }

  if (!token) {
    throw createError({ statusCode: 401, message: '未登录，请先登录' })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, message: '登录已过期，请重新登录' })
  }
  return payload
}
