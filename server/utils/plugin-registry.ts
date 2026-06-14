/**
 * 插件注册表 — 兼容入口
 * 
 * 重导出到新位置 plugins/registry.ts
 * 旧代码无需改动，import 路径保持不变。
 */
export { getPlugins, getPlugin, isPluginEnabled, togglePlugin, regPlugin } from '../../plugins/registry'
export type { PluginMeta } from '../../plugins/registry'
