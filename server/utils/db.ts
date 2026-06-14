// D1 数据库工具 — Cloudflare Pages 环境
// 兼容多种 Nitro / Cloudflare Pages 绑定暴露方式
export function getDB(event: any): D1Database {
  // 尝试所有可能的绑定路径
  const ctx = event.context?.cloudflare || event.context?.cf || {}
  const platform = (globalThis as any).__env__ || (globalThis as any).env || {}

  const db = (
    ctx?.env?.DB ||           // Nitro cloudflare-pages 标准路径
    platform?.DB ||            // globalThis.__env__ / env
    (globalThis as any).DB     // 直接挂 globalThis
  ) as D1Database

  if (!db) {
    // 调试信息：列出可用的绑定键名（不泄露值）
    const available = Object.keys(ctx?.env || {}).concat(Object.keys(platform || {}))
    const hint = available.length
      ? `找到绑定: [${available.join(', ')}]，但没有名为 'DB' 的绑定。请在 Cloudflare 后台将 D1 绑定变量名设为 'DB'`
      : '未找到任何绑定，请在 Cloudflare Pages 设置 → 绑定中添加 D1 数据库，变量名填 DB'
    throw new Error(`数据库未绑定 — ${hint}`)
  }
  return db
}
