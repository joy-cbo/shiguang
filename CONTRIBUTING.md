# 贡献指南

感谢你想为拾光博客做贡献！

## 开发环境搭建

```bash
# 1. 克隆代码
git clone https://github.com/joy-cbo/shiguang.git
cd shiguang

# 2. 安装依赖
npm install

# 3. 复制环境变量
cp .env.example .dev.vars
# 编辑 .dev.vars，填入你的 JWT_SECRET（任意随机字符串）

# 4. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:3000`，访问 `/admin/setup` 初始化管理员。

> 本地开发不需要 Cloudflare 账号。D1 和 R2 只在部署到 Cloudflare Pages 时才需要。

## 代码规范

- **TypeScript** — 所有 `.ts` 文件使用类型标注
- **Vue 3** — 使用 `<script setup lang="ts">`
- **类型导入** — 统一从 `types/index.ts` 导入，不在文件中重复定义
- **禁止 `as any`** — D1 返回值用 `rows<T>()` / `first<T>()` 包装
- **中文错误消息** — API 的 `throw createError` 用中文 message

## 项目结构

```
shiguang/
├── core/              # 核心引擎
│   ├── index.ts       #   引擎入口
│   └── theme-loader.ts#   主题加载器
├── plugins/           # 插件系统
│   ├── registry.ts    #   插件注册表
│   └── xxx/           #   每个插件一个文件夹
├── themes/            # 主题系统
├── server/api/        # API 端点（Nuxt 自动路由）
├── pages/             # 页面（前台 + 后台）
├── composables/       # 共享 composables
├── components/        # 共享组件
└── types/             # TypeScript 类型定义
```

## 提 Pull Request

1. Fork 本仓库
2. 创建你的分支：`git checkout -b feature/你的功能`
3. 写代码
4. 确保 `npm run build` 通过
5. 提交：`git commit -m "添加了xxx功能"`
6. 推送：`git push origin feature/你的功能`
7. 在 Gitee 上创建 Pull Request

## 报告 Bug

用 Issue 模板提交，包含：
- 你做了什么
- 预期结果
- 实际结果
- 截图（如果有）

---

再次感谢！
