// 共享站点状态 — 替代 saas.vue / default.vue 中重复的 script 逻辑

const SITE_DEFAULTS = {
  siteTitle: '拾光',
  siteSubtitle: '',
  footerInfo: '',
  siteLogo: '',
  siteFavicon: '',
  headerDisplay: 'both',
}

export function useSite() {
  const siteTitle = useState('site:title', () => SITE_DEFAULTS.siteTitle)
  const siteSubtitle = useState('site:subtitle', () => SITE_DEFAULTS.siteSubtitle)
  const footerInfo = useState('site:footerInfo', () => SITE_DEFAULTS.footerInfo)
  const siteLogo = useState('site:logo', () => SITE_DEFAULTS.siteLogo)
  const siteFavicon = useState('site:favicon', () => SITE_DEFAULTS.siteFavicon)
  const headerDisplay = useState('site:header', () => SITE_DEFAULTS.headerDisplay)
  const isLoggedIn = useState('site:loggedIn', () => false)
  const menuOpen = useState('site:menuOpen', () => false)
  const loaded = useState('site:loaded', () => false)

  async function fetchSettings() {
    if (loaded.value) return
    loaded.value = true

    isLoggedIn.value = !!(typeof window !== 'undefined' && localStorage.getItem('auth_token'))

    try {
      const s = await $fetch<Record<string, string>>('/api/settings')
      if (s.site_title) siteTitle.value = s.site_title
      if (s.site_subtitle) siteSubtitle.value = s.site_subtitle
      if (s.footer_info) footerInfo.value = s.footer_info
      if (s.site_logo) siteLogo.value = s.site_logo
      if (s.site_favicon) siteFavicon.value = s.site_favicon
      if (s.header_display) headerDisplay.value = s.header_display
      if (siteTitle.value) {
        useHead({ titleTemplate: `%s - ${siteTitle.value}` })
      }
      if (s.site_favicon) {
        useHead({ link: [{ rel: 'icon', type: 'image/svg+xml', href: s.site_favicon }] })
      }
    } catch (e) { console.error('[站点设置] 加载失败:', e) }
  }

  function logout() {
    if (typeof window !== 'undefined') localStorage.removeItem('auth_token')
    isLoggedIn.value = false
    menuOpen.value = false
    navigateTo('/')
  }

  return {
    siteTitle, siteSubtitle, footerInfo, siteLogo, siteFavicon, headerDisplay,
    isLoggedIn, menuOpen, loaded,
    fetchSettings, logout,
  }
}
