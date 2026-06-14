# 贡献指南

感谢你想为拾光博客做贡献！

## 开发环境搭建

```bash
git clone https://github.com/joy-cbo/shiguang.git
cd shiguang
npm install
cp .env.example .dev.vars
# 编辑 .dev.vars，设置 JWT_SECRET=任意随机字符串
npm run dev
```

浏览器打开 `http://localhost:3000` → `/admin/setup` 初始化管理员即可开始开发。

> 本地开发不需要 Cloudflare 账号。

## 项目结构

```
shiguang/
├── plugins/           # 插件系统（自包含，自动发现）
│   ├── registry.ts    #   自动扫描 plugin.json，不需手改
│   ├── friend-links/  #   友链插件（含 api/ + pages/）
│   └── rss-feed/      #   RSS 插件（含 api/）
├── themes/            # 主题系统（自包含，自动发现）
│   ├── saas/          #   紫橙主题（theme.json + layout.vue）
│   └── default/       #   极简主题（theme.json + layout.vue）
├── server/api/        # API 路由（重导出指向 plugin/ 源码）
├── pages/             # 页面（前台 + 后台）
├── composables/       # 共享 composables
├── components/        # 共享组件
└── types/             # TypeScript 类型定义
```

## 🧩 开发插件

插件系统通过 `import.meta.glob` 自动扫描 `plugins/*/plugin.json`，**不需要手动注册**。

```bash
# 1. 建文件夹
mkdir plugins/my-plugin

# 2. 写元数据
cat > plugins/my-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "我的插件",
  "features": ["功能A", "功能B"]
}
EOF

# 3. 写 API（在 plugins/my-plugin/api/ 下）
# 4. 写页面（在 plugins/my-plugin/pages/ 下，可选）
# 5. 在 server/api/ 和 pages/ 创建重导出文件
```

**不需要改 `plugins/registry.ts`**。

## 🎨 开发主题

主题系统通过 `import.meta.glob` 自动扫描 `themes/*/theme.json`。

```bash
# 1. 复制模板
cp -r themes/default themes/my-theme

# 2. 改 theme.json
#    id: "my-theme"
#    name: "我的主题"
#    icon: "home"          ← IconShiguang 图标名
#    features: ["暗黑模式"]

# 3. 改 layout.vue（导航栏、配色、布局）
```

**不需要改 `pages/admin/themes.vue`**。

## 代码规范

- **TypeScript** — 所有 `.ts` 文件使用类型标注
- **Vue 3** — `<script setup lang="ts">`
- **类型导入** — 从 `types/index.ts` 导入，不重复定义
- **禁止 `as any`** — D1 返回值用 `rows<T>()` / `first<T>()`
- **中文错误消息** — API 用中文 message
- **管理 API 四件套** — `requireAuth` + `checkRateLimit` + `sanitize` + 参数化查询

## 提 Pull Request

1. Fork 本仓库
2. 创建分支：`git checkout -b feature/功能名`
3. 写代码
4. `npm run build` 通过
5. 提交推送
6. 在 GitHub 上创建 Pull Request

## 报告 Bug

用 Issue 提交，包含：做了什么、预期结果、实际结果、截图（如有）。

---

再次感谢！
