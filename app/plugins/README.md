# 拾光博客 — 插件目录

## 架构

每个插件一个自包含文件夹，自动发现，零冲突：

```
plugins/{name}/
├── plugin.json       # 元数据（name/version/description/features/builtin）
├── README.md         # 说明文档
├── api/              # API 路由处理函数
│   └── ...           # 通过 engine/api/ 重导出接入 Nuxt
├── pages/            # 前台/后台页面组件（可选）
│   └── ...           # 通过 pages/ 重导出接入 Nuxt
└── index.ts          # 入口（说明文档）
```

## 自动发现

`app/plugins/registry.ts` 通过 `import.meta.glob` 自动扫描 `app/plugins/*/plugin.json`。**新插件只需建文件夹 + 写 plugin.json，不需要改 registry.ts 或任何共享文件。** 拉上游更新零合并冲突。

## 注册表 API

- `isPluginEnabled(name)` — 检查是否启用（API/页面应查询此函数做开关）
- `togglePlugin(name, enabled)` — 切换启停（后台插件管理页调用）
- `getPlugins()` — 获取所有插件列表

## 已有插件

| 插件 | 文件夹 | 功能 |
|------|--------|------|
| friend-links | `friend-links/` | 友链展示 + 后台管理 |
| rss-feed | `rss-feed/` | RSS 2.0 订阅源 |

## 开发新插件

```bash
# 1. 建文件夹 + plugin.json
mkdir plugins/my-plugin
cat > plugins/my-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "我的插件",
  "features": ["功能A", "功能B"]
}
EOF

# 2. 写 API → plugins/my-plugin/api/
# 3. 写页面 → plugins/my-plugin/pages/（可选）
# 4. 在 engine/api/ 和 pages/ 创建重导出文件（一行 export）
```

需要在 API/页面里加开关：
```ts
import { isPluginEnabled } from '~~/engine/utils/plugin-registry'
if (!isPluginEnabled('my-plugin')) throw createError({ statusCode: 404 })
```
