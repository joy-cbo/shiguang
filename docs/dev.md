# 二次开发指南

> 适合想改代码的开发者。如果只是部署用，看 deploy.md 就够了。

## 环境要求

- Node.js 20+
- npm

## 本地开发

```bash
git clone https://github.com/joy-cbo/shiguang.git
cd shiguang
npm install
cp .env.example .dev.vars
# 编辑 .dev.vars，设 JWT_SECRET=任意随机字符串
npm run dev
```

访问 `http://localhost:3000` → `/admin/setup` 初始化管理员。

> 本地开发不需要 Cloudflare 账号。D1/R2 只在部署到 Cloudflare Pages 时需要。

## 项目结构

```
shiguang/
├── components/            # 共享 Vue 组件
│   ├── CommentSection.vue
│   ├── NavLinks.vue       # 导航链接（desktop/mobile/footer）
│   ├── SearchBox.vue      # 实时搜索框
│   ├── SiteFooter.vue     # 统一页脚
│   ├── TableOfContents.vue
│   ├── Breadcrumb.vue
│   ├── RelatedPosts.vue
│   └── IconShiguang.vue   # SVG 图标组件（30+ 图标）
│
├── composables/           # Vue 组合式函数
│   ├── useApi.ts          # 统一 fetch（自动注入 token）
│   ├── useSite.ts         # 站点配置共享状态
│   ├── useFormat.ts       # 日期格式化 / 阅读时长
│   ├── useAutoSave.ts     # 草稿自动保存
│   ├── usePostNav.ts      # 上一篇/下一篇
│   ├── useTagCloud.ts     # 标签云
│   └── useTheme.ts        # 主题状态
│
├── pages/                 # 页面（Nuxt 文件路由）
│   ├── index.vue          # 首页
│   ├── posts/[slug].vue   # 文章详情
│   ├── archive.vue        # 归档
│   ├── links.vue          # 友链页（重导出→插件）
│   ├── page/[slug].vue    # 独立页面
│   ├── search.vue         # 搜索结果
│   ├── [...404].vue       # 404 页
│   └── admin/             # 后台管理
│       ├── login.vue
│       ├── setup.vue
│       ├── index.vue      # 仪表盘
│       ├── posts/         # 文章
│       ├── categories.vue # 分类
│       ├── tags.vue       # 标签
│       ├── pages.vue      # 独立页面
│       ├── plugins.vue    # 插件管理
│       ├── themes.vue     # 主题管理（自动发现）
│       ├── comments.vue   # 评论
│       ├── links.vue      # 友链管理
│       ├── users.vue      # 用户
│       ├── media.vue      # 媒体库
│       ├── trash.vue      # 回收站
│       └── settings.vue   # 站点设置
│
├── server/
│   ├── api/               # API 端点（Nuxt 自动路由）
│   │   ├── auth/          # 登录/个人资料/改密码
│   │   ├── posts/         # 文章 CRUD
│   │   ├── pages/         # 独立页面
│   │   ├── categories/    # 分类
│   │   ├── tags/          # 标签
│   │   ├── links/         # 友链（重导出→插件）
│   │   ├── comments/      # 评论
│   │   ├── plugins/       # 插件管理 API
│   │   ├── users/         # 用户管理
│   │   ├── setup.post.ts  # 首次初始化（自动建表）
│   │   ├── upload.post.ts # 文件上传
│   │   ├── search.get.ts  # 搜索
│   │   ├── home.get.ts    # 首页聚合 API
│   │   ├── settings.get.ts / put.ts
│   │   ├── sitemap.xml.ts
│   │   └── rss.xml.ts     # RSS（重导出→插件）
│   └── utils/             # 工具
│       ├── auth.ts        # requireAuth
│       ├── crypto.ts      # 密码哈希
│       ├── jwt.ts         # JWT
│       ├── db.ts          # D1 连接
│       ├── db-helpers.ts  # rows<T>() / first<T>()
│       ├── rate-limit.ts  # 令牌桶
│       └── sanitize.ts    # HTML 消毒
│
├── plugins/               # 插件（自包含，自动发现）
│   ├── registry.ts        # 扫描 plugin.json 自动注册
│   ├── friend-links/      # 友链插件
│   │   ├── plugin.json
│   │   ├── api/           # API 源码
│   │   └── pages/         # 页面源码
│   └── rss-feed/          # RSS 插件
│       ├── plugin.json
│       └── api/
│
├── themes/                # 主题（自包含，自动发现）
│   ├── saas/              # 紫橙主题
│   │   ├── theme.json     # {id, name, icon, features}
│   │   └── layout.vue
│   └── default/           # 极简主题
│       ├── theme.json
│       └── layout.vue
│
├── layouts/               # Nuxt 布局（薄包装→themes/）
│   ├── default.vue        # 主题切换器
│   ├── saas.vue           # → themes/saas/layout.vue
│   └── admin.vue          # 后台布局
│
├── types/index.ts
├── docs/                  # 文档
└── public/                # 静态文件 + _headers
```

## 🧩 插件开发

插件系统通过 `import.meta.glob` 自动发现。**新插件不需要改任何共享文件。**

### 目录结构

```
plugins/my-plugin/
├── plugin.json          # 元数据（必须）
│   {
│     "name": "my-plugin",
│     "version": "1.0.0",
│     "description": "...",
│     "features": ["功能A"],
│     "builtin": false       ← 内置插件设 true
│   }
├── api/                 # API handler（可选）
│   ├── index.get.ts     # GET /api/xxx
│   └── index.post.ts    # POST /api/xxx
├── pages/               # Vue 页面（可选）
│   └── index.vue
└── README.md
```

### 三步开发

```bash
# 1. 建文件夹 + 写 plugin.json
mkdir plugins/my-plugin

# 2. 写功能代码
#    API → plugins/my-plugin/api/
#    页面 → plugins/my-plugin/pages/

# 3. 在 server/api/ 创建重导出文件（一行）
echo "export { default } from '~/plugins/my-plugin/api/index.get'" > server/api/my-plugin.get.ts
```

如果需要启用/禁用开关，在 API 入口加：
```ts
import { isPluginEnabled } from '~~/server/utils/plugin-registry'
if (!isPluginEnabled('my-plugin')) throw createError({ statusCode: 404 })
```

**不需要**改 `plugins/registry.ts`。系统自动扫描 `plugin.json`。

## 🎨 主题开发

主题系统通过 `import.meta.glob` 自动发现。

### theme.json 字段

```json
{
  "id": "my-theme",        // 唯一标识
  "name": "我的主题",       // 显示名称
  "version": "1.0.0",
  "icon": "palette",       // IconShiguang 图标名
  "description": "...",
  "features": ["暗黑模式", "响应式"],
  "colors": { "primary": "#xxx", "background": "#xxx" }
}
```

### layout.vue

包含 `<slot />` 用于插入页面内容。以 `themes/default/layout.vue` 为模板修改。

### 三步开发

```bash
cp -r themes/default themes/my-theme
# 改 theme.json → 改 layout.vue → 后台自动出现
```

**不需要**改 `pages/admin/themes.vue`。

## 关键约定

| 规则 | 说明 |
|------|------|
| 中文错误消息 | API 返回的 message 用中文 |
| 认证入口 | `requireAuth(event)` 统一验证 |
| 速率限制 | 写操作必须 `checkRateLimit(key, max, window)` |
| 输入消毒 | 入库前调 `sanitize()` |
| Token 键名 | `auth_token`（localStorage + 中间件一致） |
| 参数化查询 | SQL 用 `?` + `.bind()`，禁止字符串拼接 |
| 禁止项 | `node:fs` / `process.cwd` / `__dirname` / `as any` |

## 认证与请求

```ts
// 管理 API
import { requireAuth } from '~~/server/utils/auth'
const { userId, username, role } = await requireAuth(event)

// 速率限制
import { checkRateLimit } from '~~/server/utils/rate-limit'
checkRateLimit(`action:${ip}`, 10, 60)

// 前端请求
const { fetch } = useApi()  // 自动注入 auth_token
```

## 数据库

详见 `server/api/setup.post.ts` 中的 `CREATE TABLE` 语句。首次部署访问 `/admin/setup` 自动建表。
