/**
 * 拾光博客 — 核心引擎入口
 * 
 * 博客最小核心引擎，提供：
 * - 文章 / 分类 / 标签 / 评论 / 独立页面 / 搜索
 * - Sitemap / 站点设置 / 用户认证 / 媒体上传
 * - 插件框架（plugins/registry.ts）
 * - 主题框架（themes/*/theme.json）
 * 
 * 核心代码分布在以下目录：
 * - server/api/       — API 端点（Nuxt 自动路由）
 * - server/utils/     — 工具函数（auth/crypto/jwt/db/sanitize/rate-limit）
 * - pages/            — 前台 + 后台页面
 * - composables/      — 共享状态（useApi/useSite/useFormat/useTheme）
 * - components/       — 共享组件（NavLinks/SiteFooter/CommentSection/...）
 * - layouts/          — 布局（saas/default/admin）
 * - types/            — TypeScript 类型定义
 * - plugins/          — 功能插件
 * - themes/           — 视觉主题
 */

export { getPlugins, getPlugin, isPluginEnabled, togglePlugin, regPlugin } from '../plugins/registry'
export type { PluginMeta } from '../plugins/registry'
