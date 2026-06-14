// GET /api/plugins — 已安装插件列表（需认证）
import { requireAuth } from '~~/server/utils/auth'
import { getPlugins } from '~~/server/utils/plugin-registry'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return { plugins: getPlugins() }
})
