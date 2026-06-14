/**
 * 拾光博客 — 插件注册表
 * 
 * 管理所有插件元数据和启停状态。
 * 插件代码在构建时由 Nuxt 自动发现（server/api/、pages/ 等），
 * registry 控制 UI 可见性和运行时行为。
 */

export interface PluginMeta {
  name: string
  version: string
  description: string
  enabled: boolean
  /** 插件目录名（plugins/ 下的文件夹名） */
  dir: string
  /** 是否内置（内置插件不可删除） */
  builtin: boolean
  /** 依赖的其他插件名列表 */
  requires?: string[]
  /** 插件提供的功能列表（供管理面板展示） */
  features?: string[]
}

const plugins: PluginMeta[] = []

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

// ======== 注册内置插件 ========

regPlugin({
  name: 'friend-links',
  version: '1.0.0',
  description: '友链展示：前台友链页 + 后台管理',
  enabled: true,
  dir: 'friend-links',
  builtin: true,
  features: ['友链列表展示', '后台友链管理', '友链排序'],
})

regPlugin({
  name: 'rss-feed',
  version: '1.0.0',
  description: 'RSS 2.0 订阅：/api/rss.xml',
  enabled: true,
  dir: 'rss-feed',
  builtin: true,
  features: ['RSS 2.0 订阅源', '自动包含最近文章'],
})
