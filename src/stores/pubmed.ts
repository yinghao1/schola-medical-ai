import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { PubMedArticle, PubMedKeyword, PubMedSettings } from '@/types'
import { getLatestArticles } from '@/services/pubmed'

/** 默认设置 */
const DEFAULT_SETTINGS: PubMedSettings = {
  timeWindow: 30,
  journalFilter: 'all',
  dailyCount: 40,
  personalPreference: ''
}

export const usePubmedStore = defineStore('pubmed', () => {
  // 文献列表面板是否打开
  const isPanelOpen = ref(false)

  // 加载状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 文献数据
  const articles = ref<PubMedArticle[]>([])
  const totalCount = ref(0)

  // 分页
  const currentPage = ref(1)
  const pageSize = 10

  // Toast 通知
  const toastMessage = ref('')
  const showToast = ref(false)
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  // 关键词列表（取代原来的标签）
  const keywords = ref<PubMedKeyword[]>([
    { id: 'cardiology', label: '心血管', query: 'cardiology[MeSH]' },
    { id: 'oncology', label: '肿瘤学', query: 'oncology[MeSH]' },
    { id: 'neurology', label: '神经学', query: 'neurology[MeSH]' },
    { id: 'immunology', label: '免疫学', query: 'immunology[MeSH]' }
  ])

  // ===================== 推荐设置 =====================

  /** 当前生效的设置（已保存） */
  const settings = reactive<PubMedSettings>({ ...DEFAULT_SETTINGS })

  /** 设置面板是否显示 */
  const showSettings = ref(false)

  /** 打开设置面板 */
  function openSettings() {
    showSettings.value = true
  }

  /** 关闭设置面板（不保存） */
  function closeSettings() {
    showSettings.value = false
  }

  /** 保存设置并重新获取文献 */
  function saveSettings(draft: PubMedSettings) {
    Object.assign(settings, draft)
    showSettings.value = false
    fetchArticles()
  }

  /** 获取当前设置的快照（用于编辑草稿） */
  function getSettingsSnapshot(): PubMedSettings {
    return { ...settings }
  }

  // ===================== 查询逻辑 =====================

  /**
   * 构建组合查询词：将所有关键词用 OR 连接
   * 无关键词时回退到通用医学查询
   * 同时注入期刊筛选条件
   */
  const combinedQuery = computed(() => {
    let base: string
    if (keywords.value.length === 0) {
      base = 'medicine[MeSH]'
    } else {
      base = keywords.value.map(k => k.query).join(' OR ')
    }

    // 期刊筛选追加
    if (settings.journalFilter === 'highIF') {
      // 高影响因子期刊常见于 Nature / Lancet / NEJM / BMJ / JAMA 系列
      base = `(${base}) AND (nature[journal] OR lancet[journal] OR "new england journal of medicine"[journal] OR bmj[journal] OR jama[journal] OR "cell"[journal])`
    } else if (settings.journalFilter === 'top') {
      base = `(${base}) AND (nature[journal] OR science[journal] OR "cell"[journal] OR lancet[journal] OR "new england journal of medicine"[journal])`
    }

    // 个人偏好追加
    if (settings.personalPreference.trim()) {
      base = `(${base}) AND (${settings.personalPreference.trim()})`
    }

    return base
  })

  /**
   * 计算文献与关键词的匹配度
   */
  function calcRelevance(article: PubMedArticle): number {
    const text = `${article.title} ${article.journal}`.toLowerCase()
    let score = 0
    for (const kw of keywords.value) {
      if (text.includes(kw.label.toLowerCase())) {
        score += 2
      }
      const meshTerm = kw.query.replace(/\[MeSH\]$/i, '').toLowerCase()
      if (text.includes(meshTerm)) {
        score += 1
      }
    }
    return score
  }

  /** 按匹配度排序后的文献列表 */
  const sortedArticles = computed(() => {
    if (keywords.value.length === 0) return articles.value
    return [...articles.value].sort((a, b) => calcRelevance(b) - calcRelevance(a))
  })

  /** 总页数 */
  const totalPages = computed(() => Math.ceil(sortedArticles.value.length / pageSize))

  /** 当前页的文献列表 */
  const pagedArticles = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return sortedArticles.value.slice(start, start + pageSize)
  })

  /** 切换页码 */
  function setPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  // ===================== 面板操作 =====================

  function openPanel() {
    isPanelOpen.value = true
    if (articles.value.length === 0 && !isLoading.value) {
      fetchArticles()
    }
  }

  function closePanel() {
    isPanelOpen.value = false
    showSettings.value = false
  }

  // 获取文献（基于设置中的数量和时间窗口）
  async function fetchArticles() {
    isLoading.value = true
    error.value = null
    currentPage.value = 1

    try {
      articles.value = await getLatestArticles(
        combinedQuery.value,
        settings.dailyCount,
        settings.timeWindow
      )
      totalCount.value = articles.value.length
      console.log(`[PubMed Store] Loaded ${articles.value.length} articles for query: ${combinedQuery.value}`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取文献失败，请稍后重试'
      console.error('[PubMed Store] Fetch error:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 添加关键词并重新获取文献
  function addKeyword(label: string, query: string) {
    const exists = keywords.value.some(k => k.label === label)
    if (exists) return
    const id = `kw_${Date.now()}`
    keywords.value.push({ id, label, query })
    fetchArticles()
  }

  // 删除关键词并重新获取文献
  function removeKeyword(keywordId: string) {
    keywords.value = keywords.value.filter(k => k.id !== keywordId)
    fetchArticles()
  }

  // ===================== 文献交互 =====================

  /** 切换收藏状态 */
  function toggleFavorite(pmid: string) {
    const article = articles.value.find(a => a.pmid === pmid)
    if (!article) return
    article.isFavorited = !article.isFavorited
    triggerToast(article.isFavorited ? '已收藏该文献' : '已取消收藏')
  }

  /** 不感兴趣 — 从列表中移除 */
  function dismissArticle(pmid: string) {
    articles.value = articles.value.filter(a => a.pmid !== pmid)
    totalCount.value = articles.value.length
    // 如果当前页无数据且不是第一页，自动回退
    if (currentPage.value > totalPages.value && currentPage.value > 1) {
      currentPage.value = totalPages.value
    }
    triggerToast('已移除，将减少类似推荐')
  }

  /** 触发 Toast 通知 */
  function triggerToast(message: string) {
    if (toastTimer) clearTimeout(toastTimer)
    toastMessage.value = message
    showToast.value = true
    toastTimer = setTimeout(() => {
      showToast.value = false
    }, 2000)
  }

  return {
    isPanelOpen,
    isLoading,
    error,
    articles,
    totalCount,
    keywords,
    combinedQuery,
    sortedArticles,
    currentPage,
    totalPages,
    pagedArticles,
    setPage,
    settings,
    showSettings,
    toastMessage,
    showToast,
    openPanel,
    closePanel,
    fetchArticles,
    addKeyword,
    removeKeyword,
    openSettings,
    closeSettings,
    saveSettings,
    getSettingsSnapshot,
    toggleFavorite,
    dismissArticle,
    triggerToast
  }
})
