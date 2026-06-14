// 临时诊断接口 — 查看 Cloudflare 绑定的实际变量名
export default defineEventHandler((event) => {
  const ctx = event.context?.cloudflare || event.context?.cf || {}
  const platform = (globalThis as any).__env__ || (globalThis as any).env || {}
  const env = { ...platform, ...(ctx?.env || {}) }

  const keys = Object.keys(env)
  const details: Record<string, string> = {}
  for (const k of keys) {
    try {
      const v = env[k]
      if (v === null || v === undefined) details[k] = 'null/undefined'
      else if (typeof v === 'function') details[k] = 'function'
      else if (typeof v === 'object') details[k] = `object (keys: ${Object.keys(v).join(',')})`
      else details[k] = typeof v
    } catch (e: any) {
      details[k] = `error: ${e.message}`
    }
  }

  return {
    platform: 'Cloudflare Pages',
    bindingCount: keys.length,
    keys,
    details,
    ctxKeys: Object.keys(ctx),
    envKeys: Object.keys(ctx?.env || {}),
  }
})
