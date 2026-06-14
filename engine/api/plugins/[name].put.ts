// PUT /api/plugins/:name — 启用/禁用插件（需管理员）
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'
import { togglePlugin, getPlugins } from '~~/engine/utils/plugin-registry'

export default defineEventHandler(async (event) => {
  const { role } = await requireAuth(event)
  if (role !== 'admin') throw createError({ statusCode: 403, message: '需要管理员权限' })

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`plugin:${ip}`, 10, 60)

  const name = event.context?.params?.name as string
  const { enabled } = await readBody(event) as { enabled?: boolean }
  if (typeof enabled !== 'boolean') throw createError({ statusCode: 400, message: 'enabled 字段必填' })

  if (!togglePlugin(name, enabled)) throw createError({ statusCode: 404, message: '插件不存在' })
  return { plugins: getPlugins() }
})
