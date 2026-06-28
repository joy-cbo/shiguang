# 拾光博客 — 架构与设计文档

> **拾光**（Shiguang）是一个前后端一体的个人博客系统，取"拾起时光碎片"之意。
> 技术栈：Nuxt 3 + Cloudflare D1 + R2 + KV + Tailwind CSS，部署于 Cloudflare Pages。
> 本文档面向开源贡献者和二次开发者，解释整个博客的架构逻辑、设计理念和 API 设计。

---

## 一、总体架构

### 1.1 核心理念

```
一个仓库 = 前端 + 后端 + 数据库 schema + 部署配置
一次部署 = 前后端一起上线
```

不走传统的前后端分离部署。Nuxt 3 的 engine/ 目录直接作为 Cloudflare Pages Functions 运行，数据库用 D1（Cloudflare 的 SQLite 边缘数据库），文件存储用 R2（兼容 S3 的对象存储），缓存用 KV（Cloudflare 的键值存储）。

### 1.2 数据流

```
浏览器 → Cloudflare Pages Worker → KV 缓存 → D1 数据库 / R2 存储
                ↑
          engine/api/ 下所有 .ts 文件自动成为 API 端点
          engine/utils/ 提供 auth/jwt/crypto/sanitize 等工具
          engine/hooks/ 提供插件生命周期钩子
```

### 1.3 目录结构

```
shiguang/
├── app/                     ← 前端源码（Nuxt srcDir）
│   ├── app.vue              # 入口
│   ├── components/          # Vue 组件
│   │   ├── ui/              # 通用 UI 组件
│   │   │   ├── IconShiguang.vue   # SVG 图标组件（30+ 图标）
│   │   │   └── Toast.vue         # Toast 通知
│   │   └── blog/            # 博客业务组件
│   │       ├── CommentSection.vue   # 评论区（嵌套回复）
│   │       ├── NavLinks.vue         # 导航链接
│   │       ├── SearchBox.vue        # 实时搜索框
│   │       ├── SiteFooter.vue       # 统一页脚
│   │       ├── TableOfContents.vue  # 文章目录跟踪
│   │       ├── Breadcrumb.vue       # 面包屑导航
│   │       ├── RelatedPosts.vue     # 相关文章推荐
│   │       └── TipTapEditor.vue     # 富文本/Markdown 编辑器
│   ├── composables/         # 工具函数
│   │   ├── useApi.ts            # 统一 fetch（注入 token + 错误处理）
│   │   ├── useSite.ts           # 站点配置共享状态
│   │   ├── useFormat.ts         # 日期格式化 / 阅读时长
│   │   ├── useAutoSave.ts       # 草稿自动保存
│   │   ├── usePostNav.ts        # 上一篇/下一篇
│   │   ├── useTagCloud.ts       # 标签云
│   │   ├── useTheme.ts          # 主题状态
│   │   ├── useSanitize.ts       # HTML 消毒（SSR + 客户端）
│   │   └── useImageCompress.ts  # 图片压缩
│   ├── layouts/             # 页面布局
│   │   ├── default.vue          # 默认布局（暗黑模式 + 主题切换）
│   │   ├── saas.vue             # 紫橙主题布局
│   │   └── admin.vue            # 后台管理布局（侧边栏）
│   ├── pages/               # 页面（Nuxt 文件路由）
│   │   ├── index.vue            # 首页（英雄卡片 + 卡片网格）
│   │   ├── posts/[slug].vue     # 文章详情
│   │   ├── archive.vue          # 归档
│   │   ├── search.vue           # 搜索
│   │   ├── links.vue            # 友链展示
│   │   ├── page/[slug].vue      # 独立页面
│   │   ├── categories/[name].vue
│   │   ├── tags/[name].vue
│   │   └── admin/               # 后台管理（17 个页面）
│   ├── plugins/              # 博客插件（自包含，自动发现）
│   │   ├── registry.ts          # 扫描 plugin.json 注册
│   │   ├── friend-links/        # 友链插件（含 api/ + pages/）
│   │   └── rss-feed/            # RSS 插件（含 api/）
│   ├── themes/               # 主题（自包含，自动发现）
│   │   ├── saas/                # 紫橙主题
│   │   └── default/             # 极简主题
│   ├── types/index.ts        # TypeScript 类型定义
│   └── assets/css/main.css   # 全局样式
├── engine/                   ← 后端引擎（Nuxt serverDir）
│   ├── api/                  # API 端点（自动路由）
│   │   ├── auth/             # 登录/个人资料/改密码
│   │   ├── posts/            # 文章 CRUD + 评论
│   │   ├── pages/            # 独立页面
│   │   ├── categories/       # 分类
│   │   ├── tags/             # 标签
│   │   ├── links/            # 友链（重导出→插件）
│   │   ├── comments/         # 评论管理
│   │   ├── plugins/          # 插件启用/禁用
│   │   ├── users/            # 用户管理
│   │   ├── setup.post.ts     # 首次初始化（自动建表）
│   │   ├── upload.post.ts    # 文件上传
│   │   ├── search.get.ts     # 搜索（支持 FTS5 全文搜索）
│   │   ├── home.get.ts       # 首页聚合
│   │   ├── settings.ts       # 站点设置（KV 缓存）
│   │   ├── sitemap.xml.ts    # Sitemap
│   │   └── rss.xml.ts        # RSS（重导出→插件）
│   ├── hooks/                # 插件生命周期钩子
│   │   └── index.ts          # 钩子注册/执行系统
│   ├── utils/                # 引擎工具
│   │   ├── auth.ts           # requireAuth（支持 httpOnly Cookie）
│   │   ├── crypto.ts         # 密码哈希
│   │   ├── jwt.ts            # JWT
│   │   ├── db.ts             # D1 连接
│   │   ├── db-helpers.ts     # rows<T>() / first<T>()
│   │   ├── cache.ts          # KV 缓存工具
│   │   ├── rate-limit.ts     # 令牌桶（支持 KV + 内存）
│   │   └── sanitize.ts       # 输入消毒
│   ├── plugins/              # 引擎插件
│   │   └── error-handler.ts  # 全局错误处理
│   └── schema.sql            # 数据库 Schema（自动建表）
├── schema/                   ← 数据库 Schema（分离）
│   ├── core.sql              # 核心表（8张）
│   └── plugins/              # 插件表
│       └── friend-links.sql  # 友链表
├── tests/                    ← 测试
│   ├── unit/                 # 单元测试
│   ├── components/           # 组件测试
│   └── e2e/                  # E2E 测试
├── docs/                     ← 文档
│   ├── deploy.md             # 部署指南
│   ├── dev.md                # 开发指南
│   └── plugin-development.md # 插件开发指南
├── public/                   ← 静态资源
├── nuxt.config.ts            # Nuxt 配置
├── package.json              # 依赖
├── vitest.config.ts          # 测试配置
└── tailwind.config.ts        # Tailwind 配置
```

---

## 二、核心功能

### 2.1 文章管理

- 创建、编辑、删除（软删除 → 回收站）
- 分类、标签、置顶
- 富文本编辑器 + Markdown 支持
- 草稿自动保存（每 30 秒）

### 2.2 评论系统

- 自建评论（不依赖第三方）
- 嵌套回复
- 审核机制（待审/通过/垃圾）
- 未读评论提醒

### 2.3 搜索

- FTS5 全文搜索（支持中文分词）
- 自动降级到 LIKE 搜索
- 关键词高亮
- 搜索结果摘要

### 2.4 插件系统

- 热插拔插件（自动发现）
- 插件可包含 API、页面、组件
- 钩子系统（12 种生命周期钩子）

### 2.5 主题系统

- 可切换主题（自动发现）
- 主题可自定义布局、样式、组件
- 暗黑模式支持

---

## 三、安全设计

### 3.1 认证

- JWT Token
- httpOnly Cookie（防止 XSS 窃取）
- 密码哈希（PBKDF2，10000 次迭代）
- 登录失败锁定（5 次失败锁定 15 分钟）

### 3.2 防护

- XSS 防护：SSR 和客户端都消毒
- CSRF 防护：SameSite Cookie
- 速率限制：支持 KV（生产）+ 内存（开发）
- 输入验证：参数化查询

### 3.3 敏感数据

- 环境变量存储敏感配置
- API 响应过滤敏感字段
- 密码哈希不可逆

---

## 四、性能优化

### 4.1 缓存

- KV 缓存：站点配置（1小时）、标签（30分钟）
- 静态资源：CDN 缓存
- API 响应：Cache-Control 头

### 4.2 搜索

- FTS5 全文搜索索引
- 自动降级到 LIKE

### 4.3 图片

- 客户端压缩（500KB 以上自动压缩）
- 懒加载（loading="lazy"）

---

## 五、开发指南

### 5.1 本地开发

```bash
git clone https://github.com/joy-cbo/shiguang.git
cd shiguang
npm install
npm run dev
```

### 5.2 运行测试

```bash
npm run test           # 运行测试
npm run test:watch     # 监听模式
npm run test:coverage  # 覆盖率报告
```

### 5.3 构建部署

```bash
npm run build
npx wrangler pages deploy dist
```

---

## 六、API 设计

### 6.1 认证 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 登录（返回 token + 设置 httpOnly cookie） |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/auth/password` | PUT | 修改密码 |
| `/api/auth/profile` | PUT | 更新个人资料 |

### 6.2 文章 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 文章列表（支持分页、筛选） |
| `/api/posts` | POST | 创建文章 |
| `/api/posts/:id` | GET | 文章详情 |
| `/api/posts/:id` | PUT | 更新文章 |
| `/api/posts/:id` | DELETE | 删除文章（软删除） |
| `/api/posts/:slug/comments` | GET | 文章评论 |
| `/api/posts/:slug/comments` | POST | 发表评论 |

### 6.3 其他 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/search` | GET | 搜索（FTS5） |
| `/api/settings` | GET | 站点配置（KV 缓存） |
| `/api/tags` | GET | 标签列表（KV 缓存） |
| `/api/categories` | GET/POST | 分类管理 |
| `/api/pages` | GET/POST | 独立页面 |
| `/api/upload` | POST | 文件上传 |
| `/api/setup` | POST | 初始化 |

---

## 七、部署

### 7.1 Cloudflare Pages

1. Fork 仓库
2. 连接 GitHub
3. 配置构建：
   - Build command: `npm run build`
   - Output directory: `dist`
4. 绑定 D1 数据库（变量名 `shiguang-db`）
5. 绑定 R2 存储（变量名 `shiguang-files`）
6. 绑定 KV 命名空间（变量名 `CACHE`，可选）

### 7.2 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `JWT_SECRET` | JWT 签名密钥 | ✅ |

---

## 八、贡献指南

欢迎提 Issue 和 PR！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 九、许可证

[MIT](LICENSE)
