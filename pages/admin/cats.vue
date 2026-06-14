<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">🐱 猫咪管理</h1>
      </div>

      <!-- 添加猫咪按钮 -->
      <button @click="showCatForm = !showCatForm" class="px-4 py-2 gradient-bg text-white rounded-lg text-sm">
        {{ showCatForm ? '取消' : '+ 添加猫咪' }}
      </button>

      <!-- 猫咪表单 -->
      <div v-if="showCatForm" class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold">{{ editingCatId ? '编辑' : '新增' }}猫咪</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm mb-1">名字 *</label><input v-model="catForm.name" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
          <div><label class="block text-sm mb-1">品种</label><input v-model="catForm.breed" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
          <div><label class="block text-sm mb-1">花色</label><input v-model="catForm.color" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
          <div>
            <label class="block text-sm mb-1">性别</label>
            <select v-model="catForm.gender" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <option value="">未知</option>
              <option value="公">弟弟</option>
              <option value="母">妹妹</option>
            </select>
          </div>
          <div><label class="block text-sm mb-1">出生日期</label><input v-model="catForm.birth_date" type="date" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
          <div><label class="block text-sm mb-1">到家日期</label><input v-model="catForm.adopted_date" type="date" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
        </div>
        <div><label class="block text-sm mb-1">备注</label><textarea v-model="catForm.notes" rows="2" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"></textarea></div>
        <button @click="saveCat" class="px-4 py-2 gradient-bg text-white rounded-lg text-sm">保存</button>
      </div>

      <!-- 猫咪列表 -->
      <div v-for="cat in cats" :key="cat.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="p-4 flex items-center gap-4">
          <div class="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl">🐱</div>
          <div class="flex-1">
            <h3 class="font-semibold">{{ cat.name }}</h3>
            <p class="text-sm text-gray-500">{{ cat.color }} · {{ cat.gender === '公' ? '弟弟' : cat.gender === '母' ? '妹妹' : (cat.gender || '未知') }}</p>
          </div>
          <div class="flex gap-1">
            <button @click="editCat(cat)" class="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">编辑</button>
            <button @click="deleteCat(cat)" class="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">删除</button>
            <button @click="selectedCat = selectedCat === cat.id ? null : cat.id; if (selectedCat) loadDetails(cat.id)" class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              {{ selectedCat === cat.id ? '收起' : '管理' }}
            </button>
          </div>
        </div>

        <!-- 展开面板 -->
        <div v-if="selectedCat === cat.id" class="border-t dark:border-gray-700 p-4 space-y-6">
          <!-- Tab 切换 -->
          <div class="flex gap-2">
            <button @click="activeTab = 'health'" :class="activeTab === 'health' ? 'gradient-bg text-white' : 'bg-gray-100 dark:bg-gray-700'" class="px-3 py-1 rounded text-sm">🏥 健康记录</button>
            <button @click="activeTab = 'weight'" :class="activeTab === 'weight' ? 'gradient-bg text-white' : 'bg-gray-100 dark:bg-gray-700'" class="px-3 py-1 rounded text-sm">⚖️ 体重</button>
            <button @click="activeTab = 'inventory'" :class="activeTab === 'inventory' ? 'gradient-bg text-white' : 'bg-gray-100 dark:bg-gray-700'" class="px-3 py-1 rounded text-sm">📦 库存</button>
            <button @click="activeTab = 'reminders'" :class="activeTab === 'reminders' ? 'gradient-bg text-white' : 'bg-gray-100 dark:bg-gray-700'" class="px-3 py-1 rounded text-sm">⏰ 提醒</button>
          </div>

          <!-- 健康记录 -->
          <div v-if="activeTab === 'health'">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium">健康记录 ({{ healthRecords.length }})</span>
              <button @click="showHealthForm = !showHealthForm" class="text-xs text-purple-600">+ 添加</button>
            </div>
            <div v-if="showHealthForm" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <div class="grid grid-cols-3 gap-2">
                <select v-model="healthForm.type" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm">
                  <option value="">类型</option>
                  <option value="vaccine">疫苗</option>
                  <option value="deworm">驱虫</option>
                  <option value="vet">看病</option>
                  <option value="weigh">称重</option>
                  <option value="neuter">绝育</option>
                  <option value="other">其他</option>
                </select>
                <input v-model="healthForm.record_date" type="date" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <input v-model="healthForm.cost" type="number" step="0.01" placeholder="费用" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <input v-model="healthForm.detail" placeholder="详情（如：体重1.2kg）" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <input v-model="healthForm.vet" placeholder="医院/品牌" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
              </div>
              <button @click="saveHealth(cat.id)" class="px-3 py-1 gradient-bg text-white rounded text-xs">保存</button>
            </div>
            <div v-if="healthRecords.length" class="space-y-2">
              <div v-for="r in healthRecords" :key="r.id" class="flex items-center justify-between text-sm py-1 border-b dark:border-gray-700 last:border-0">
                <div>
                  <span class="font-medium">{{ typeLabel(r.type) }}</span>
                  <span class="text-gray-400 ml-2">{{ r.record_date }}</span>
                  <span v-if="r.detail" class="text-gray-500 ml-2">{{ r.detail }}</span>
                  <span v-if="r.cost" class="text-orange-500 ml-1">¥{{ r.cost }}</span>
                </div>
                <button @click="deleteHealth(r.id)" class="text-xs text-red-400 hover:text-red-600">删除</button>
              </div>
            </div>
            <p v-else class="text-gray-400 text-sm">暂无健康记录</p>
          </div>

          <!-- 体重 -->
          <div v-if="activeTab === 'weight'">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium">体重记录 ({{ weights.length }})</span>
              <button @click="showWeightForm = !showWeightForm" class="text-xs text-purple-600">+ 记录</button>
            </div>
            <div v-if="showWeightForm" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <div class="grid grid-cols-3 gap-2">
                <input v-model="weightForm.record_date" type="date" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <input v-model="weightForm.weightG" type="number" placeholder="克（g）" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <button @click="saveWeight(cat.id)" class="px-3 py-1 gradient-bg text-white rounded text-xs">保存</button>
              </div>
            </div>
            <div v-if="weights.length" class="space-y-1">
              <div v-for="w in weights" :key="w.id" class="flex items-center justify-between text-sm py-1 border-b dark:border-gray-700 last:border-0">
                <div>
                  <span class="font-medium text-purple-600">{{ w.detail }}</span>
                  <span class="text-gray-400 ml-2 text-xs">{{ w.record_date }}</span>
                </div>
                <button @click="deleteHealth(w.id)" class="text-xs text-red-400 hover:text-red-600">删除</button>
              </div>
            </div>
            <p v-else class="text-gray-400 text-sm">暂无体重记录</p>
          </div>

          <!-- 库存 -->
          <div v-if="activeTab === 'inventory'">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium">库存 ({{ inventoryItems.length }})</span>
              <button @click="showInvForm = !showInvForm" class="text-xs text-purple-600">+ 添加</button>
            </div>
            <div v-if="showInvForm" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <div class="grid grid-cols-3 gap-2">
                <select v-model="invForm.item_type" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm">
                  <option value="">类型</option>
                  <option value="猫粮">猫粮</option>
                  <option value="猫砂">猫砂</option>
                  <option value="药品">药品</option>
                  <option value="零食">零食</option>
                  <option value="用品">用品</option>
                </select>
                <input v-model="invForm.brand" placeholder="品牌" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <input v-model="invForm.spec" placeholder="规格" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <input v-model="invForm.quantity" type="number" step="0.01" placeholder="数量" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <input v-model="invForm.unit" placeholder="单位（袋/盒/支）" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
                <input v-model="invForm.buy_date" type="date" class="px-2 py-1 border rounded dark:bg-gray-600 text-sm" />
              </div>
              <button @click="saveInventory(cat.id)" class="px-3 py-1 gradient-bg text-white rounded text-xs">保存</button>
            </div>
            <div v-if="inventoryItems.length" class="space-y-2">
              <div v-for="item in inventoryItems" :key="item.id" class="flex items-center justify-between text-sm py-1 border-b dark:border-gray-700 last:border-0">
                <div>
                  <span class="font-medium">{{ item.item_type }}</span>
                  <span v-if="item.brand" class="text-gray-400 ml-1">{{ item.brand }}</span>
                  <span v-if="item.quantity" class="text-gray-500 ml-1">{{ item.quantity }}{{ item.unit }}</span>
                  <span v-if="item.buy_date" class="text-gray-400 ml-2 text-xs">{{ item.buy_date }}</span>
                </div>
                <button @click="deleteInventory(item.id)" class="text-xs text-red-400 hover:text-red-600">删除</button>
              </div>
            </div>
            <p v-else class="text-gray-400 text-sm">暂无库存</p>
          </div>

          <!-- 提醒 -->
          <div v-if="activeTab === 'reminders'">
            <div class="space-y-2">
              <div v-for="r in reminderList" :key="r.id" class="flex items-center gap-3 text-sm py-2 border-b dark:border-gray-700 last:border-0">
                <span class="w-20">{{ REMINDER_LABELS[r.type] || r.type }}</span>
                <div class="flex items-center gap-2 flex-1">
                  <span class="text-gray-400 text-xs">每</span>
                  <input v-model="r.interval_days" type="number" min="1" class="w-16 px-2 py-0.5 border rounded dark:bg-gray-600 text-xs text-center" @change="saveReminder(r)" />
                  <span class="text-gray-400 text-xs">天</span>
                  <input v-model="r.next_date" type="date" class="px-2 py-0.5 border rounded dark:bg-gray-600 text-xs" @change="saveReminder(r)" />
                </div>
                <button @click="toggleReminder(r)" :class="r.enabled ? 'text-green-600' : 'text-gray-400'" class="text-xs">
                  {{ r.enabled ? '启用' : '关闭' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="!cats.length" class="text-gray-400 text-center py-8">还没有猫咪，点击上方按钮添加</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetch, handleError } = useApi()

const cats = ref<any[]>([])
const selectedCat = ref<number | null>(null)
const activeTab = ref('health')
const showCatForm = ref(false)
const showHealthForm = ref(false)
const showInvForm = ref(false)
const showWeightForm = ref(false)
const editingCatId = ref<number | null>(null)
const healthRecords = ref<any[]>([])
const inventoryItems = ref<any[]>([])
const reminderList = ref<any[]>([])

const catForm = reactive({ name: '', breed: '', color: '', gender: '', birth_date: '', adopted_date: '', notes: '' })
const healthForm = reactive({ type: '', record_date: '', detail: '', vet: '', cost: '' })
const invForm = reactive({ item_type: '', brand: '', spec: '', quantity: 0, unit: '', buy_date: '' })
const weightForm = reactive({ record_date: '', weightG: '' })

const weights = computed(() => healthRecords.value.filter((r: any) => r.type === 'weigh').sort((a: any, b: any) => b.record_date.localeCompare(a.record_date)))

const TYPE_MAP: Record<string, string> = {
  vaccine: '💉 疫苗', deworm: '🐛 驱虫', weigh: '⚖️ 称重', vet: '🏥 看病', neuter: '✂️ 绝育', other: '📋 其他'
}
const REMINDER_LABELS: Record<string, string> = {
  vaccine: '疫苗', deworm_external: '外驱', deworm_internal: '内驱', weigh: '称重', birthday: '生日', checkup: '体检'
}

function typeLabel(t: string) { return TYPE_MAP[t] || t }

async function loadCats() {
  try { const d = await fetch('/api/cats') as any; cats.value = d.cats || [] } catch (e) { handleError(e) }
}

async function loadDetails(catId: number) {
  try {
    const [h, i, r] = await Promise.all([
      fetch(`/api/health?cat_id=${catId}`) as any,
      fetch(`/api/inventory?cat_id=${catId}`) as any,
      fetch(`/api/cats/${catId}/reminders`).catch(() => ({ reminders: [] })) as any,
    ])
    healthRecords.value = h.records || []
    inventoryItems.value = i.items || []
    reminderList.value = r.reminders || []
  } catch (e) { handleError(e) }
}

function editCat(cat: any) {
  editingCatId.value = cat.id
  Object.assign(catForm, { name: cat.name, breed: cat.breed, color: cat.color, gender: cat.gender, birth_date: cat.birth_date, adopted_date: cat.adopted_date, notes: cat.notes })
  showCatForm.value = true
}

async function saveCat() {
  if (!catForm.name) return alert('请输入名字')
  try {
    const body: any = { ...catForm }
    if (editingCatId.value) {
      await fetch(`/api/cats/${editingCatId.value}`, { method: 'PUT', body })
    } else {
      await fetch('/api/cats', { method: 'POST', body })
    }
    showCatForm.value = false; editingCatId.value = null
    Object.assign(catForm, { name: '', breed: '', color: '', gender: '', birth_date: '', adopted_date: '', notes: '' })
    await loadCats()
  } catch (e) { handleError(e) }
}

async function deleteCat(cat: any) {
  if (!confirm(`确定删除 ${cat.name}？`)) return
  try { await fetch(`/api/cats/${cat.id}`, { method: 'DELETE' }); await loadCats() } catch (e) { handleError(e) }
}

async function saveHealth(catId: number) {
  if (!healthForm.type || !healthForm.record_date) return alert('请填写类型和日期')
  try {
    await fetch('/api/health', { method: 'POST', body: { cat_id: catId, ...healthForm } })
    healthForm.type = ''; healthForm.detail = ''; healthForm.vet = ''; healthForm.cost = ''; healthForm.record_date = ''
    showHealthForm.value = false
    await loadDetails(catId)
  } catch (e) { handleError(e) }
}

async function deleteHealth(id: number) {
  if (!confirm('删除这条健康记录？')) return
  try { await fetch(`/api/health/${id}`, { method: 'DELETE' }); await loadDetails(selectedCat.value!) } catch (e) { handleError(e) }
}

async function saveInventory(catId: number) {
  if (!invForm.item_type) return alert('请选择类型')
  try {
    await fetch('/api/inventory', { method: 'POST', body: { cat_id: catId, ...invForm } })
    Object.assign(invForm, { item_type: '', brand: '', spec: '', quantity: 0, unit: '', buy_date: '' })
    showInvForm.value = false
    await loadDetails(catId)
  } catch (e) { handleError(e) }
}

async function deleteInventory(id: number) {
  if (!confirm('删除这件库存？')) return
  try { await fetch(`/api/inventory/${id}`, { method: 'DELETE' }); await loadDetails(selectedCat.value!) } catch (e) { handleError(e) }
}

async function saveReminder(r: any) {
  try {
    await fetch(`/api/reminders/${r.id}`, { method: 'PUT', body: { interval_days: r.interval_days, next_date: r.next_date } })
  } catch (e) { handleError(e) }
}

async function toggleReminder(r: any) {
  r.enabled = r.enabled ? 0 : 1
  try {
    await fetch(`/api/reminders/${r.id}`, { method: 'PUT', body: { enabled: !!r.enabled } })
  } catch (e) { handleError(e) }
}

async function saveWeight(catId: number) {
  const g = parseInt(weightForm.weightG)
  if (!g || !weightForm.record_date) return alert('请填写日期和体重')
  const label = g >= 1000 ? `${(g/1000).toFixed(1)}kg` : `${g}g`
  try {
    await fetch('/api/health', { method: 'POST', body: { cat_id: catId, type: 'weigh', record_date: weightForm.record_date, detail: label } })
    weightForm.record_date = ''; weightForm.weightG = ''
    showWeightForm.value = false
    await loadDetails(catId)
  } catch (e) { handleError(e) }
}

onMounted(loadCats)
</script>
