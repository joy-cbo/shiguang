// PBKDF2-SHA256 密码哈希
// 格式: $pbkdf2-sha256$10000$<salt_hex>$<hash_hex>
// 注：降到10000次以适配 Cloudflare Workers CPU 限制

const ITERATIONS = 10_000
const KEY_LEN = 32
const SALT_LEN = 16

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hex2buf(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    key,
    KEY_LEN * 8
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const hash = await pbkdf2(password, salt)
  return `$pbkdf2-sha256$${ITERATIONS}$${buf2hex(salt)}$${buf2hex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // 新格式: $pbkdf2-sha256$...
  const m = stored.match(/^\$pbkdf2-sha256\$(\d+)\$([0-9a-f]+)\$([0-9a-f]+)$/)
  if (m) {
    const salt = hex2buf(m[2])
    const hash = await pbkdf2(password, salt)
    return buf2hex(hash) === m[3]
  }
  // 旧格式: 裸 SHA-256 hex（兼容）
  if (/^[0-9a-f]{64}$/.test(stored)) {
    const enc = new TextEncoder()
    const h = await crypto.subtle.digest('SHA-256', enc.encode(password))
    const match = buf2hex(h) === stored
    return match
  }
  return false
}

// 判断是否为旧格式密码（用于登录后自动升级）
export function isLegacyHash(stored: string): boolean {
  return /^[0-9a-f]{64}$/.test(stored)
}
