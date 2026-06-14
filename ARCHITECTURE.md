# 拾光博客 — 架构与设计文档

> **拾光**（Shiguang）是一个前后端一体的个人博客系统，取"拾起时光碎片"之意。
> 技术栈：Nuxt 3 + Cloudflare D1 + R2 + Tailwind CSS，部署于 Cloudflare Pages。
> 本文档面向开源贡献者和二次开发者，解释整个博客的架构逻辑、设计理念和 API 设计。

---

## 一、总体架构

### 1.1 核心理念

```
一个仓库 = 前端 + 后端 + 数据库 schema + 部署配置
一次部署 = 前后端一起上线
```

不走传统的前后端分离部署。Nuxt 3 的 engine/ 目录直接作为 Cloudflare Pages Functions 运行，数据库用 D1（Cloudflare 的 SQLite 边缘数据库），文件存储用 R2（兼容 S3 的对象存储）。

### 1.2 数据流

```
浏览器 → Cloudflare Pages Worker → D1 数据库 / R2 存储
                ↑
          engine/api/ 下所有 .ts 文件自动成为 API 端点
          engine/utils/ 提供 auth/jwt/crypto/sanitize 等工具
```

### 1.3 目录结构

```
shiguang/
├── app/                     ← 前端源码（Nuxt srcDir）
│   ├── app.vue              # 入口
│   ├── components/          # Vue 组件
│   │   ├── CommentSection.vue   # 评论区（嵌套回复）
│   │   ├── NavLinks.vue         # 导航链接（desktop/mobile/footer）
│   │   ├── SearchBox.vue        # 实时搜索框
│   │   ├── SiteFooter.vue       # 统一页脚
│   │   ├── TableOfContents.vue  # 文章目录跟踪
│   │   ├── Breadcrumb.vue       # 面包屑导航
│   │   ├── RelatedPosts.vue     # 相关文章推荐
│   │   ├── IconShiguang.vue     # SVG 图标组件（30+ 图标）
│   │   └── TipTapEditor.vue     # 富文本编辑器
│   ├── lib/                 # 工具函数
│   │   ├── useApi.ts            # 统一 fetch（注入 token + 错误处理）
│   │   ├── useSite.ts           # 站点配置共享状态
│   │   ├── useFormat.ts         # 日期格式化 / 阅读时长
│   │   ├── useAutoSave.ts       # 草稿自动保存
│   │   ├── usePostNav.ts        # 上一篇/下一篇
│   │   ├── useTagCloud.ts       # 标签云
│   │   └── useTheme.ts          # 主题状态
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
│   │   ├── search.get.ts     # 搜索
│   │   ├── home.get.ts       # 首页聚合
│   │   ├── settings.ts       # 站点设置
│   │   ├── sitemap.xml.ts    # Sitemap
│   │   └── rss.xml.ts        # RSS（重导出→插件）
│   ├── utils/                # 引擎工具
│   │   ├── auth.ts           # requireAuth
│   │   ├── crypto.ts         # 密码哈希
│   │   ├── jwt.ts            # JWT
│   │   ├── db.ts             # D1 连接
│   │   ├── db-helpers.ts     # rows<T>() / first<T>()
│   │   ├── rate-limit.ts     # 令牌桶
│   │   ├── sanitize.ts       # HTML 消毒
│   │   └── plugin-registry.ts# 插件注册表
│   └── schema.sql            # 数据库建表
├── public/                   # 静态文件
├── docs/                     # 文档
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 二、数据库设计

所有表使用 SQLite 方言，通过 D1 运行。

### 2.1 核心表（9 张）

| 表 | 用途 | 关键字段 |
|----|------|----------|
| `users` | 用户 | username, password_hash, role(admin/author), status |
| `categories` | 分类 | name, slug |
| `posts` | 文章 | title, slug, content(HTML), excerpt, cover, status(published/draft/deleted), is_pinned, category_id, deleted_at(软删除) |
| `tags` | 标签 | name, slug |
| `post_tags` | 文章-标签关联 | post_id, tag_id |
| `pages` | 独立页面 | title, slug, content, status |
| `links` | 友链 | name, url, logo, description, sort_order |
| `comments` | 评论 | post_id, parent_id(嵌套回复), author_name, author_email, content(HTML), status(pending/approved/spam), ip |
| `site_config` | 站点配置 | key(TEXT PK), value — 键值对存储，存 site_title/site_subtitle/footer_info/site_logo/active_theme/header_display 等 |

### 2.2 设计原则

- **软删除**：文章不真删，`deleted_at` 标记 → 回收站可恢复
- **键值配置**：`site_config` 不过度设计，key-value 灵活扩展
- **`/admin/setup` 自动建表**：首次访问初始化页面时，系统自动执行 schema.sql，不需要手动建表

---

## 三、API 设计

### 3.0 安全分层

所有 API 按权限分为四类：

| 类型 | 认证 | 速率限制 | 示例 |
|------|------|----------|------|
| 公开读 | 无 | 无 | GET /api/posts, GET /api/posts/:slug |
| 公开写 | 无 | ✅ checkRateLimit | POST /api/comments |
| 管理读 | requireAuth | 无 | GET /api/admin/stats |
| 管理写 | requireAuth | ✅ | POST /api/posts, PUT /api/settings |

### 3.1 认证 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/setup` | POST | 初始化管理员（仅当 users 表为空） |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/auth/password` | PUT | 修改密码（需旧密码） |
| `/api/auth/profile` | PUT | 更新个人资料 |

### 3.2 文章 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 公开列表（分页、分类筛选、标签筛选、状态过滤） |
| `/api/posts` | POST | 创建文章 |
| `/api/posts/:id` | GET | 文章详情 |
| `/api/posts/:id` | PUT | 更新文章（支持置顶） |
| `/api/posts/:id` | DELETE | 软删除（移到回收站，支持永久删除） |
| `/api/posts/batch` | POST | 批量操作（发布/草稿/删除/归类） |
| `/api/posts/:id/related` | GET | 相关文章推荐（同分类+同标签） |

### 3.3 分类 & 标签 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET/POST | 分类列表 / 创建 |
| `/api/categories/:id` | PUT/DELETE | 更新 / 删除 |
| `/api/tags` | GET/POST | 标签列表 / 创建 |
| `/api/tags/:id` | PUT/DELETE | 更新 / 删除 |

### 3.4 评论 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/posts/:slug/comments` | GET | 公开获取评论（嵌套回复） |
| `/api/posts/:slug/comments` | POST | 发表评论（rate limit） |
| `/api/comments` | GET | 管理列表（待审/已通过/垃圾） |
| `/api/comments/:id` | PUT | 审核（通过/垃圾） |
| `/api/comments/:id` | DELETE | 删除 |
| `/api/comments/unread-count` | GET | 未读评论数 |

### 3.5 页面 & 友链 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/pages` | GET/POST | 独立页面列表 / 创建 |
| `/api/pages/:id` | GET/PUT/DELETE | 详情 / 更新 / 删除 |
| `/api/links` | GET/POST | 友链列表 / 创建 |
| `/api/links/:id` | PUT/DELETE | 更新 / 删除 |

### 3.6 站点配置 & 媒体 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/settings` | GET | 公开获取站点配置 |
| `/api/settings` | PUT | 更新配置（白名单过滤） |
| `/api/upload` | POST | 文件上传到 R2 |
| `/api/media` | GET | 媒体库列表 |

### 3.7 搜索 & 发现 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/search` | GET | 全文搜索（标题+内容，返回 snippet） |
| `/api/home` | GET | 首页聚合（posts + tags + recent） |
| `/api/rss.xml` | GET | RSS 2.0 订阅 |
| `/api/sitemap.xml` | GET | 自动生成 sitemap（文章/页面/分类/标签） |

### 3.8 插件 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/plugins` | GET | 插件列表 |
| `/api/plugins/:name` | PUT | 切换启停 |

### 3.9 用户管理 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/users` | GET/POST | 用户列表 / 创建 |
| `/api/users/:id` | PUT/DELETE | 编辑 / 删除 |

---

## 四、页面设计理念

### 4.1 前台页面

#### 首页 (`index.vue`)
- **英雄大卡片**：最新置顶或最近文章，全宽圆角卡片 + 封面图 + 渐变遮罩
- **双列卡片网格**：第 1 页 1 英雄 + 8 卡片，第 2 页起 8 卡片
- **渐进式加载**：页面壳子秒出 → 加载动画 → 文章逐个淡入
- **标签云**：侧边栏，颜色随文章数变化

#### 文章详情页 (`posts/[slug].vue`)
- **阅读进度条**：顶部细线渐变条
- **面包屑导航**：首页 > 分类 > 文章
- **TOC 侧边栏**：桌面端右侧 sticky 跟随，手机端右下角浮窗
- **相关文章推荐**：底部 3 列卡片（同分类+同标签）
- **回到顶部**：右下角渐变圆钮，滚过一屏后出现
- **上一篇/下一篇导航**：底部左右箭头链接

#### 归档页 (`archive.vue`)
- 按年/月分组时间线

#### 搜索页 (`search.vue`)
- 导航栏实时下拉搜索 + 独立结果页
- 关键词高亮
- snippet 摘取

#### 关于页 (`about.vue`)、友链页 (`links.vue`)、分类/标签页
- 统一的卡片列表模式
- 使用共享组件（NavLinks / SiteFooter）

### 4.2 后台管理

所有后台页面统一使用 `<NuxtLayout name="admin">` 包裹，共用侧边栏。

| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/admin` | 统计卡片 + 趋势图 |
| 文章管理 | `/admin/posts` | 表格列表 + 批量操作 + 搜索 + 回收站 |
| 写文章 | `/admin/posts/write` | TipTap 富文本编辑器 + 自动保存草稿 |
| 编辑文章 | `/admin/posts/edit-[id]` | 字段与 write 完全对称 |
| 分类管理 | `/admin/categories` | 内联编辑 |
| 标签管理 | `/admin/tags` | 内联编辑 |
| 评论管理 | `/admin/comments` | 状态筛选 + 审核操作 |
| 友链管理 | `/admin/links` | 表格 + 内联编辑 |
| 页面管理 | `/admin/pages` | 独立页面 CRUD |
| 媒体库 | `/admin/media` | R2 文件浏览 + 引用检测 |
| 用户管理 | `/admin/users` | 用户 CRUD |
| 站点设置 | `/admin/settings` | 标题/副标题/Logo/Favicon/页脚/导航栏显示 |
| 主题管理 | `/admin/themes` | 切换 SaaS/default |
| 插件管理 | `/admin/plugins` | 插件启停 |

---

## 五、主题系统

### 5.1 当前主题：SaaS 紫橙

**设计语言**：轻科技 SaaS 风 — 毛玻璃导航 + 紫橙渐变 + 浅灰白背景。

#### 色彩规范

| 用途 | 颜色 | CSS |
|------|------|-----|
| 主渐变 | 紫→橙 | `linear-gradient(to right, #9333ea, #ea580c)` |
| 页面背景 | 极浅灰 | `bg-[#f8f9fc]` |
| 导航栏 | 毛玻璃 | `backdrop-blur-xl bg-white/72` |
| 卡片 | 白色阴影 | `shadow-[0_4px_24px_rgba(0,0,0,0.08)]` |
| 文字链接 | 紫色 | `text-purple-600` |

#### 全局渐变系统

不在各处手写 Tailwind 渐变类，统一用 CSS 全局 class：

```css
.gradient-text {
  background: linear-gradient(to right, #9333ea, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-bg {
  background: linear-gradient(to right, #9333ea, #ea580c);
}
```

以后要改配色，改两行 CSS 就全站生效。

#### 布局架构

```
layouts/default.vue → 主题切换器（判断 activeTheme）
  ├─ 'saas'  → themes/saas/layout.vue（毛玻璃导航 + 浅灰白 + 渐变装饰线）
  └─ 其他    → themes/default/layout.vue（白底 + 暗黑模式切换）
```

主题支持自动发现：`app/pages/admin/themes.vue` 通过 `import.meta.glob` 扫描 `app/themes/*/theme.json`。新主题只需建文件夹 + 写 `theme.json` + `layout.vue`，后台自动出现，不需改任何共享文件。

---

## 六、插件系统

### 6.1 架构

```
plugins/
├── registry.ts          # 自动扫描 plugins/*/plugin.json 注册, 不需手改
├── friend-links/
│   ├── plugin.json      # 元数据（name/version/features/builtin）
│   ├── api/             # API handler 源码
│   └── pages/           # 页面源码
└── rss-feed/
    ├── plugin.json
    └── api/
```

插件通过 `plugin.json` 声明信息，`registry.ts` 在构建时通过 `import.meta.glob` 自动扫描注册，**不需手动调 `regPlugin()`**。后台 `/admin/plugins` 可一键启停。

### 6.2 开发新插件

新插件只需建 `app/plugins/xxx/plugin.json`，系统自动发现。不需要改 `registry.ts` 或任何共享文件。拉上游更新零合并冲突。

### 6.2 内置插件

| 插件 | ID | 说明 |
|------|----|------|
| 友链 | friend-links | 友情链接管理和展示 |
| RSS 订阅 | rss-feed | RSS 2.0 订阅源生成 |

---

## 七、安全模型

### 7.1 认证

- **密码**：自适应迭代哈希，盐值随机生成
- **Token**：JWT，存在 localStorage
- **锁定**：多次登录失败后自动锁定

### 7.2 防护层

1. **速率限制**：令牌桶算法
2. **输入消毒**：覆盖多种 XSS 向量
3. **参数化查询**：所有 SQL 用占位符，禁止字符串拼接
4. **软删除**：文章不真删，防误操作
5. **CSRF**：无 Cookie，天然不受 CSRF 攻击

### 7.3 不做的

- 不做 RBAC（只有 admin / author 两级）
- 不做 2FA
- 不做 IP 白名单

---

## 八、关键设计决策

### 为什么文章存 HTML 不用 Markdown？

前端用 `v-html` 直接渲染。原因是统一排版控制——所有文章都用 `<p class="mb-4 leading-relaxed text-base">` 这样的 Tailwind class，前台渲染效果完全一致。

### 为什么渐变用 CSS class 不用 Tailwind？

Tailwind JIT 可能不生成 `bg-clip-text` 等类。全局 CSS class（`.gradient-text` / `.gradient-bg`）不受 tree-shaking 影响，永远生效。

### 为什么两个布局（saas + default）？

SaaS 布局是全站默认主题，default 布局是极简回退。两者通过 `useSite()` composable 共享站点状态。

---

## 九、部署方式

详见 [`docs/deploy.md`](docs/deploy.md) 一键部署指南。

必需环境变量：
- `JWT_SECRET` — JWT 签名密钥

可选：
- `RESEND_API_KEY` — 邮件通知（如插件支持）

D1 绑定和 R2 桶由部署脚本自动处理。
