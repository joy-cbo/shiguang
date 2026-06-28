/**
 * 钩子系统 - 允许插件注册生命周期钩子
 * 
 * 使用方式：
 * 1. 在插件中注册钩子：registerHook({ name: 'my-hook', type: 'afterInit', handler: ... })
 * 2. 在核心代码中执行钩子：await executeHooks('afterInit', context)
 */

export type HookType = 
  | 'beforeInit'      // 系统初始化前
  | 'afterInit'       // 系统初始化后
  | 'beforeRender'    // 页面渲染前
  | 'afterRender'     // 页面渲染后
  | 'beforeApiCall'   // API 调用前
  | 'afterApiCall'    // API 调用后
  | 'onPostCreate'    // 文章创建后
  | 'onPostUpdate'    // 文章更新后
  | 'onPostDelete'    // 文章删除后
  | 'onCommentCreate' // 评论创建后
  | 'onUserLogin'     // 用户登录后
  | 'onSettingsChange' // 设置变更后

export interface HookContext {
  event?: any           // H3 事件对象
  user?: any            // 当前用户
  data?: any            // 相关数据
  [key: string]: any    // 其他上下文
}

export interface Hook {
  name: string          // 钩子名称（插件名 + 钩子名）
  type: HookType        // 钩子类型
  handler: (context: HookContext) => void | Promise<void>  // 钩子处理函数
  priority?: number     // 优先级（数字越小越先执行，默认 100）
}

// 存储所有注册的钩子
const hooks: Hook[] = []

/**
 * 注册钩子
 */
export function registerHook(hook: Hook): void {
  // 设置默认优先级
  if (hook.priority === undefined) {
    hook.priority = 100
  }
  
  // 检查是否已存在同名钩子
  const existingIndex = hooks.findIndex(h => h.name === hook.name)
  if (existingIndex !== -1) {
    // 更新已存在的钩子
    hooks[existingIndex] = hook
  } else {
    // 添加新钩子
    hooks.push(hook)
  }
  
  // 按优先级排序
  hooks.sort((a, b) => (a.priority || 100) - (b.priority || 100))
}

/**
 * 注销钩子
 */
export function unregisterHook(name: string): void {
  const index = hooks.findIndex(h => h.name === name)
  if (index !== -1) {
    hooks.splice(index, 1)
  }
}

/**
 * 执行指定类型的所有钩子
 */
export async function executeHooks(type: HookType, context: HookContext = {}): Promise<void> {
  const hooksToExecute = hooks.filter(h => h.type === type)
  
  for (const hook of hooksToExecute) {
    try {
      await hook.handler(context)
    } catch (error) {
      console.error(`[Hook] Error executing hook "${hook.name}":`, error)
      // 不抛出错误，避免影响主流程
    }
  }
}

/**
 * 获取所有已注册的钩子（用于调试）
 */
export function getRegisteredHooks(): Hook[] {
  return [...hooks]
}

/**
 * 清除所有钩子（用于测试）
 */
export function clearAllHooks(): void {
  hooks.length = 0
}
