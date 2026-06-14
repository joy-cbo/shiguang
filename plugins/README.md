# 拾光博客 — 插件目录

## 架构

每个插件一个文件夹，自包含全部代码：

```
plugins/{name}/
├── plugin.json       # 元数据（名称/版本/描述/特性）
├── README.md         # 说明文档
├── api/              # API 路由处理函数
│   └── ...           # Nuxt 通过 server/api/ 重导出接入
├── pages/            # 前台/后台页面组件（可选）
│   └── ...           # Nuxt 通过 pages/ 重导出接入
└── index.ts          # 入口（说明文档）
```

## 注册表

`plugins/registry.ts` — 管理所有插件的元数据和启停状态。

- `regPlugin(p)` — 注册新插件
- `isPluginEnabled(name)` — 检查是否启用（API/页面应查询此函数）
- `togglePlugin(name, enabled)` — 切换启停

## 已有插件

| 插件 | 文件夹 | 功能 |
|------|--------|------|
| friend-links | `friend-links/` | 友链展示 + 后台管理 |
| rss-feed | `rss-feed/` | RSS 2.0 订阅源 |

## 开发新插件

1. 复制 `plugins/friend-links/` → `plugins/你的插件名/`
2. 修改 `plugin.json`
3. 在 `api/` 中编写 API 处理函数
4. 在 `server/api/` 创建对应的重导出文件
5. 在 `plugins/registry.ts` 中调用 `regPlugin(...)` 注册
6. 在插件的 API/页面函数中调用 `isPluginEnabled('你的插件名')` 做开关控制
7. `npm run build` 验证
