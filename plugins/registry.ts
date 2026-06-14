/**
 * 插件注册表
 *
 * 自动扫描 plugins 目录下的 plugin.json, 无需手写注册.
 * 第三方开发插件只需建文件夹加 plugin.json, 不用改此文件.
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

interface PluginJson {
  name: string
  version: string
  description: string
  enabled?: boolean
  builtin?: boolean
  requires?: string[]
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

// ======== 自动发现：扫描 plugins/*/plugin.json ========

const modules = import.meta.glob<{ default: PluginJson }>('/plugins/*/plugin.json', { eager: true })

for (const [path, module] of Object.entries(modules)) {
  const meta = module.default
  const dir = path.split('/')[2]   // /plugins/{dir}/plugin.json
  if (!meta.name || !dir) continue

  regPlugin({
    name: meta.name,
    version: meta.version || '0.1.0',
    description: meta.description || '',
    enabled: meta.enabled ?? true,
    dir,
    builtin: meta.builtin ?? false,
    requires: meta.requires || [],
    features: meta.features || [],
  })
}
