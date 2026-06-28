/**
 * 插件注册表 — 直接实现（不依赖重导出）
 */

export interface PluginMeta {
  name: string
  version: string
  description: string
  enabled: boolean
  dir: string
  builtin: boolean
  requires?: string[]
  features?: string[]
}

const plugins: PluginMeta[] = [
  {
    name: 'friend-links',
    version: '1.0.0',
    description: '友链展示插件 — 前台友链页 + 后台友链管理',
    enabled: true,
    dir: 'friend-links',
    builtin: true,
    features: ['前台友链展示页', '后台友链管理', '友链 Logo 展示'],
  },
  {
    name: 'rss-feed',
    version: '1.0.0',
    description: 'RSS 2.0 订阅源插件',
    enabled: true,
    dir: 'rss-feed',
    builtin: true,
    features: ['RSS 2.0 标准订阅', '自动包含最近 20 篇文章', '全文输出'],
  },
]

export function regPlugin(p: PluginMeta) {
  const idx = plugins.findIndex(pl => pl.name === p.name)
  if (idx >= 0) {
    plugins[idx] = { ...plugins[idx], ...p }
  } else {
    plugins.push(p)
  }
}

export function getPlugins(): PluginMeta[] {
  return [...plugins]
}

export function getPlugin(name: string): PluginMeta | undefined {
  return plugins.find(p => p.name === name)
}

export function isPluginEnabled(name: string): boolean {
  return plugins.find(p => p.name === name)?.enabled ?? false
}

export function togglePlugin(name: string, enabled: boolean): boolean {
  const p = plugins.find(pl => pl.name === name)
  if (p) {
    p.enabled = enabled
    return true
  }
  return false
}
