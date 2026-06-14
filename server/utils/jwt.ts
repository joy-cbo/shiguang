// JWT 工具 — HMAC-SHA256 token 生成与验证
import type { JwtPayload } from '~~/types'

const _getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET || ''
  if (!secret) {
    throw createError({ statusCode: 500, message: '服务配置错误，请联系管理员' })
  }
  return secret
}

function base64Url(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(str: string): string {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

export async function createToken(payload: JwtPayload): Promise<string> {
  const enc = new TextEncoder()
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const data = { ...payload, iat: now, exp: now + 86400 * 7 }

  const hb64 = base64Url(JSON.stringify(header))
  const pb64 = base64Url(JSON.stringify(data))

  const key = await crypto.subtle.importKey('raw', enc.encode(_getJWTSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${hb64}.${pb64}`))
  const sb64 = base64Url(String.fromCharCode(...new Uint8Array(sig)))

  return `${hb64}.${pb64}.${sb64}`
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(base64UrlDecode(parts[1]))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode(_getJWTSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const sigStr = parts[2].replace(/-/g, '+').replace(/_/g, '/')
    const sigData = Uint8Array.from(base64UrlDecode(sigStr), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigData, enc.encode(`${parts[0]}.${parts[1]}`))

    if (!valid) return null
    return { userId: payload.userId, username: payload.username, role: payload.role }
  } catch (e) {
    console.error('[jwt] verifyToken error:', e)
    return null
  }
}
