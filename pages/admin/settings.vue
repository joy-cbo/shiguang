<template>
  <NuxtLayout name="admin">
    <form @submit.prevent="save" class="space-y-4 max-w-lg">
      <div><label class="text-sm text-gray-500 block mb-1">站点标题</label><input v-model="form.site_title" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" /></div>
      <div><label class="text-sm text-gray-500 block mb-1">站点副标题</label><input v-model="form.site_subtitle" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" /></div>
      <div><label class="text-sm text-gray-500 block mb-1">站点描述</label><textarea v-model="form.site_description" rows="3" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"></textarea></div>
      <div><label class="text-sm text-gray-500 block mb-1">站点地址</label><input v-model="form.site_url" placeholder="https://你的域名" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" /></div>
      <div><label class="text-sm text-gray-500 block mb-1">底部信息</label><input v-model="form.footer_info" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" /></div>
      <button type="submit" class="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">保存设置</button>
    </form>

    <!-- Logo / Favicon -->
    <div class="mt-8 border-t dark:border-gray-700 pt-6 max-w-lg">
      <h3 class="font-semibold mb-2">站点图标</h3>
      <p class="text-sm text-gray-500 mb-3">上传 Logo（导航栏）和 Favicon（浏览器标签图标）</p>
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-500 block mb-1">Logo（建议 200×60 的 PNG）</label>
          <div class="flex gap-3 items-center">
            <img v-if="form.site_logo" :src="form.site_logo" class="h-10 border rounded dark:border-gray-600" alt="Logo" />
            <input type="file" accept="image/*" @change="uploadLogo" class="text-sm" />
            <span v-if="logoUploading" class="text-xs text-gray-400">上传中...</span>
          </div>
        </div>
        <div>
          <label class="text-sm text-gray-500 block mb-1">Favicon（32×32 的 PNG 或 ICO）</label>
          <div class="flex gap-3 items-center">
            <img v-if="form.site_favicon" :src="form.site_favicon" class="w-8 h-8 border rounded dark:border-gray-600" alt="Favicon" />
            <input type="file" accept="image/*" @change="uploadFavicon" class="text-sm" />
            <span v-if="faviconUploading" class="text-xs text-gray-400">上传中...</span>
          </div>
        </div>
        <div>
          <label class="text-sm text-gray-500 block mb-1">导航栏显示方式</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" v-model="form.header_display" value="both" /> 同时显示</label>
            <label class="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" v-model="form.header_display" value="logo" /> 仅 Logo</label>
            <label class="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" v-model="form.header_display" value="title" /> 仅名称</label>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码 -->
    <div class="mt-8 border-t dark:border-gray-700 pt-6 max-w-lg">
      <h3 class="font-semibold mb-2">修改密码</h3>
      <p class="text-sm text-gray-500 mb-3">修改当前登录账号的密码</p>
      <div class="space-y-3">
        <input v-model="pwd.oldPassword" type="password" placeholder="旧密码" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        <input v-model="pwd.newPassword" type="password" placeholder="新密码（至少8位）" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        <button @click="changePassword" :disabled="pwd.loading" class="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50">{{ pwd.loading ? '修改中...' : `<IconShiguang name="lock" class="inline align-[-3px] mr-1"/>修改密码` }}</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()
const form = reactive<Record<string, string>>({
  site_title: '', site_subtitle: '', site_description: '', footer_info: '',
  site_logo: '', site_favicon: '', header_display: 'both',
})
const pwd = reactive({ oldPassword: '', newPassword: '', loading: false })
const logoUploading = ref(false)
const faviconUploading = ref(false)

onMounted(async () => {
  const data = await $fetch<Record<string, string>>('/api/settings')
  Object.assign(form, data)
})

async function save() {
  await fetch('/api/settings', { method: 'PUT', body: form })
}

async function uploadLogo(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  logoUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    form.site_logo = res.url
    await fetch('/api/settings', { method: 'PUT', body: { site_logo: res.url } })
  } catch {} finally { logoUploading.value = false }
}

async function uploadFavicon(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  faviconUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    form.site_favicon = res.url
    await fetch('/api/settings', { method: 'PUT', body: { site_favicon: res.url } })
  } catch {} finally { faviconUploading.value = false }
}

async function changePassword() {
  if (!pwd.oldPassword || !pwd.newPassword) return alert('旧密码和新密码不能为空')
  if (pwd.newPassword.length < 8) return alert('新密码至少8位')
  pwd.loading = true
  try {
    await fetch('/api/auth/password', { method: 'PUT', body: { oldPassword: pwd.oldPassword, newPassword: pwd.newPassword } })
    alert('密码修改成功')
    pwd.oldPassword = ''; pwd.newPassword = ''
  } catch (e: any) {
    alert(e?.data?.message || '修改失败')
  } finally { pwd.loading = false }
}
</script>
