/**
 * 拾光博客 — 核心引擎入口
 * 
 * 博客最小核心引擎。
 * 
 * 核心功能分布在：
 * - server/api/       — API 端点（Nuxt 自动路由）
 * - server/utils/     — 工具函数（auth/crypto/jwt/db/sanitize/rate-limit）
 * - pages/            — 页面（前台 + 后台）
 * - composables/      — 共享状态（useApi/useSite/useFormat/useTheme）
 * - components/       — 共享组件（NavLinks/SiteFooter/CommentSection/...）
 * - layouts/          — 布局（saas/default/admin）
 * - types/            — TypeScript 类型定义
 * 
 * 插件系统：
 * - plugins/          — 功能插件，每插件一个目录
 * - plugins/registry.ts — 插件注册表（元数据 + 启停）
 * 
 * 主题系统：
 * - themes/           — 视觉主题，每主题一个目录
 * - core/theme-loader.ts — 主题加载器
 */

// 插件系统
export { getPlugins, getPlugin, isPluginEnabled, togglePlugin, regPlugin } from '../plugins/registry'
export type { PluginMeta } from '../plugins/registry'

// 主题系统
export { getThemes, getTheme, isValidTheme, DEFAULT_THEME } from './theme-loader'
export type { ThemeMeta } from './theme-loader'
