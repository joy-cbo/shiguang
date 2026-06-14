# 二次开发指南

> 适合想改代码的开发者。完全不懂编程的话，看完 deploy.md 部署就能用了。

## 环境要求

- Node.js 20+
- npm

## 本地开发

```bash
cd /home/lighthouse/blog
npm install --registry=https://registry.npmmirror.com
cp .env.example .dev.vars
# 编辑 .dev.vars，设置 JWT_SECRET=你的密钥
npm run dev
```

访问 `http://localhost:3000`

## 项目结构（共 85 个源文件）

```
blog/
├── components/
│   ├── SearchBox.vue          # 搜索框（导航栏实时下拉）
│   └── TipTapEditor.vue       # 富文本编辑器
│
├── composables/               # Vue 组合式函数
│   ├── useApi.ts              # 统一 fetch（自动注入 token + 错误处理）
│   ├── useAutoSave.ts         # 草稿自动保存（30秒存 localStorage）
│   ├── useFormat.ts           # 日期格式化 / stripHtml / timeAgo
│   ├── usePostNav.ts          # 上一篇/下一篇导航
│   ├── useSanitize.ts         # 前端 XSS 消毒
│   └── useTagCloud.ts         # 标签云数据
│
├── pages/                     # 前台 7 页 + 后台 17 页
│   ├── index.vue              # 首页（文章列表 + 侧边栏）
│   ├── posts/[slug].vue       # 文章详情（进度条/封面/作者卡/导航）
│   ├── categories/[name].vue  # 分类页
│   ├── tags/[name].vue        # 标签页
│   ├── archive.vue            # 归档页
│   ├── page/[slug].vue        # 独立页
│   ├── search.vue             # 搜索结果页
│   ├── [...404].vue           # 404 页面
│   └── admin/                 # 后台管理
│       ├── login.vue           # 登录
│       ├── setup.vue           # 首次初始化（建管理员后自动关闭）
│       ├── index.vue           # 仪表盘
│       ├── profile.vue         # 个人资料
│       ├── posts/              # 文章管理
│       │   ├── index.vue       # 文章列表（批量操作）
│       │   ├── write.vue       # 写文章（草稿自动保存）
│       │   └── edit-[id].vue   # 编辑文章
│       ├── categories.vue      # 分类管理
│       ├── tags.vue            # 标签管理
│       ├── pages.vue           # 独立页面管理
│       ├── links.vue           # 友链管理
│       ├── media.vue           # 附件管理
│       ├── trash.vue           # 回收站
│       ├── users.vue           # 用户管理
│       ├── visits.vue          # 访问记录
│       └── settings.vue        # 站点设置
│
├── server/
│   ├── api/                   # 46 个 API 端点
│   │   ├── auth/              # 登录 / 个人资料 / 改密码
│   │   ├── posts/             # 文章 CRUD + 软删除 + 恢复 + 批量
│   │   ├── pages/             # 独立页面 CRUD
│   │   ├── categories/        # 分类 CRUD
│   │   ├── tags/              # 标签 CRUD
│   │   ├── links/             # 友链 CRUD
│   │   ├── social-links/      # 社交链接
│   │   ├── users/             # 用户管理
│   │   ├── attachments/       # 附件管理
│   │   ├── visits/            # 访问日志
│   │   ├── upload.post.ts     # 文件上传（魔数校验 + R2/本地）
│   │   ├── search.get.ts      # 文章搜索
│   │   ├── stats.get.ts       # 仪表盘统计
│   │   ├── settings.get.ts    # 站点配置（公开） 
│   │   ├── settings.put.ts    # 站点配置（管理）
│   │   ├── setup.post.ts      # 首次初始化
│   │   ├── visit.post.ts      # 访问记录
│   │   ├── cover/[slug].get.ts # 自动封面图（SVG 渐变）
│   │   └── sitemap.xml.ts     # 自动生成 sitemap
│   ├── utils/                 # 服务端工具
│   │   ├── auth.ts            # requireAuth 统一认证
│   │   ├── crypto.ts          # PBKDF2-SHA256 密码哈希
│   │   ├── jwt.ts             # JWT 签发/验证（HS256，7天过期）
│   │   ├── db.ts              # D1 数据库获取
│   │   ├── rate-limit.ts      # 令牌桶速率限制
│   │   └── sanitize.ts        # 服务端 HTML 消毒
│   └── plugins/
│       └── error-handler.ts   # 全局错误 → 中文消息
│
├── layouts/
│   ├── default.vue            # 前台布局
│   └── admin.vue              # 后台布局
│
├── middleware/
│   ├── auth.global.ts         # 路由守卫（放行 login/setup）
│   └── init.global.ts         # 暗黑模式初始化
│
├── plugins/                   # 插件目录
│   └── social-share/          # 社交分享插件（示例）
│       └── SocialShare.vue
│
├── themes/                    # 主题目录
│   └── halo-style/            # Halo 风格主题（示例）
│       ├── theme.json
│       ├── layout.vue
│       └── README.md
│
├── types/index.ts             # 统一类型定义
├── schema.sql                 # D1 数据库建表（13 张表）
├── public/robots.txt          # 搜索引擎配置
├── docs/                      # 文档
│   ├── deploy.md              # 小白部署指南
│   └── dev.md                 # 二次开发指南（本文件）
└── .github/workflows/
    └── deploy.yml             # GitHub Actions 自动部署
```

## 关键约定

| 规则 | 说明 |
|------|------|
| 中文错误消息 | 所有 API 返回的 `message` 字段用中文 |
| 认证入口 | `requireAuth(event)` 统一验证，别手动验 token |
| 速率限制 | 所有写操作 API 必须 `checkRateLimit(key, max, window)` |
| 输入消毒 | 存入数据库前调用 `sanitize()`，前端 `v-html` 配对 |
| Token 键名 | 统一 `auth_token`（localStorage 和中间件一致） |
| 参数化查询 | SQL 用 `?` 占位符 + `.bind()`，禁止字符串拼接 |
| 密码方案 | PBKDF2-SHA256，600,000 次迭代，16 字节盐 |
| 禁止项 | `node:fs` / `process.cwd` / `__dirname` / `as any` |
| 路由冲突 | 同目录禁止 `[id]` 和 `[slug]` 共存，合并为一个文件智能判断 |

## 认证机制

```ts
// 管理 API 入口
import { requireAuth } from '~~/server/utils/auth'

const { userId, username, role } = await requireAuth(event)
// userId: 当前用户 ID
// role: 'admin' | 'editor' | 'author'
```

## 速率限制

```ts
import { checkRateLimit } from '~~/server/utils/rate-limit'

const ip = event.headers.get('x-forwarded-for') || ''
if (ip) checkRateLimit(`action:${ip}`, 10, 60)  // 每60秒最多10次
```

## 前端请求

```ts
// 推荐：用 useApi composable（自动注入 auth_token）
const { fetch, getToken, handleError } = useApi()

// 或者手动
$fetch('/api/posts', {
  headers: { Authorization: 'Bearer ' + localStorage.getItem('auth_token') }
})
```

## 添加新功能

1. **新功能做成插件** → 在 `plugins/` 下创建目录，放组件和 `plugin.json`
2. **外观改动** → 创建新主题到 `themes/`，别改默认布局
3. **新增 API** → 在 `server/api/` 下创建 `.get.ts` / `.post.ts` / `.put.ts` / `.delete.ts`
4. 写完立刻 `npm run build` 验证
5. API 命名规则：`index.get.ts` → `GET /api/xxx`，`[id].put.ts` → `PUT /api/xxx/:id`

## 数据库表

详见 `schema.sql`，共 13 张表：

| 表 | 说明 |
|----|------|
| users | 用户（PBKDF2 密码 + 角色 + 登录锁定） |
| posts | 文章（软删除、置顶、封面） |
| categories | 分类 |
| tags | 标签 |
| post_tags | 文章-标签关联 |
| pages | 独立页面 |
| links | 友链 |
| social_links | 社交链接 |
| attachments | 附件 |
| site_config | 站点配置（key-value） |
| notification_logs | 通知日志 |
| visit_logs | 访问日志（IP、地区、URL） |
| audit_logs | 操作审计 |

## 部署

推送到 GitHub → GitHub Actions 自动部署到 Cloudflare Pages。详见 `deploy.md`。
