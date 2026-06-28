# 插件开发指南

## 概述

拾光博客支持热插拔插件系统，允许开发者扩展博客功能而无需修改核心代码。

## 插件结构

```
app/plugins/
├── registry.ts           # 插件注册表（自动发现）
├── my-plugin/            # 插件目录
│   ├── plugin.json       # 插件元数据
│   ├── index.ts          # 插件入口
│   ├── api/              # API 端点（可选）
│   ├── pages/            # 前端页面（可选）
│   ├── components/       # Vue 组件（可选）
│   └── assets/           # 静态资源（可选）
└── ...
```

## plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名",
  "features": ["feature1", "feature2"],
  "builtin": false
}
```

## 插件入口 (index.ts)

```typescript
import { registerHook } from '~~/engine/hooks'

export default function setup() {
  registerHook({
    name: 'my-plugin:init',
    type: 'afterInit',
    handler: async (context) => {
      console.log('插件已初始化')
    }
  })
}
```

## 钩子系统

可用的钩子类型：

| 钩子类型 | 说明 |
|----------|------|
| afterInit | 系统初始化后 |
| onPostCreate | 文章创建后 |
| onPostUpdate | 文章更新后 |
| onCommentCreate | 评论创建后 |
| onSettingsChange | 设置变更后 |

## 最佳实践

1. 保持独立：插件应该自包含
2. 错误处理：插件错误不应影响核心功能
3. 性能考虑：避免在钩子中执行耗时操作
