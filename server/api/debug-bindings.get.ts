// 临时诊断接口 — 查看 Cloudflare 绑定的实际变量名
export default defineEventHandler((event) => {
  const ctx = event.context?.cloudflare || event.context?.cf || {}
  const platform = (globalThis as any).__env__ || (globalThis as any).env || {}
  const env = { ...platform, ...(ctx?.env || {}) }

  const keys = Object.keys(env)
  const details: Record<string, any> = {}
  for (const k of keys) {
    try {
      const v = env[k]
      if (v === null || v === undefined) {
        details[k] = 'null/undefined'
      } else if (typeof v === 'object') {
        // 检查是否为 D1 / R2
        const hasExec = typeof (v as any).exec === 'function'
        const hasPrepare = typeof (v as any).prepare === 'function'
        const hasPut = typeof (v as any).put === 'function'
        const hasGet = typeof (v as any).get === 'function'
        let kind = 'object'
        if (hasPrepare && hasExec) kind = 'D1Database ✅'
        else if (hasPut && hasGet) kind = 'R2Bucket ✅'
        details[k] = `${kind} (enumerable: ${Object.keys(v).join(',') || '(none)'}), exec=${hasExec}, prepare=${hasPrepare}, put=${hasPut}`
      } else {
        details[k] = typeof v
      }
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
