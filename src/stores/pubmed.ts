import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PubMedArticle, PubMedTag } from '@/types'
import { getLatestArticles, getArticlesByTag } from '@/services/pubmed'

export const usePubmedStore = defineStore('pubmed', () => {
  // 文献列表面板是否打开
  const isPanelOpen = ref(false)

  // 加载状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 文献数据
  const articles = ref<PubMedArticle[]>([])
  const totalCount = ref(0)

  // 当前选中的标签
  const activeTagId = ref<string>('all')

  // 分类标签列表
  const tags = ref<PubMedTag[]>([
    { id: 'all', label: '全部', query: 'medicine[MeSH]' },
    { id: 'cardiology', label: '心血管', query: 'cardiology[MeSH]' },
    { id: 'oncology', label: '肿瘤学', query: 'oncology[MeSH]' },
    { id: 'neurology', label: '神经学', query: 'neurology[MeSH]' },
    { id: 'immunology', label: '免疫学', query: 'immunology[MeSH]' }
  ])

  // 根据标签筛选后的文献（切换标签时会重新 fetch，此处直接返回）
  const filteredArticles = computed(() => articles.value)

  // 打开面板
  function openPanel() {
    isPanelOpen.value = true
    // 首次打开时自动加载数据
    if (articles.value.length === 0 && !isLoading.value) {
      fetchArticles()
    }
  }

  // 关闭面板
  function closePanel() {
    isPanelOpen.value = false
  }

  // 获取文献
  async function fetchArticles() {
    isLoading.value = true
    error.value = null

    try {
      const tag = tags.value.find(t => t.id === activeTagId.value)
      const query = tag?.query || 'medicine[MeSH]'

      if (activeTagId.value === 'all') {
        // "全部"标签：获取最近 30 天的医学文献
        articles.value = await getLatestArticles(query, 20, 30)
      } else {
        // 分类标签：获取最近 90 天的对应领域文献
        articles.value = await getArticlesByTag(query, 20, 90)
      }

      totalCount.value = articles.value.length
      console.log(`[PubMed Store] Loaded ${articles.value.length} articles for tag: ${activeTagId.value}`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取文献失败，请稍后重试'
      console.error('[PubMed Store] Fetch error:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 切换标签
  function setActiveTag(tagId: string) {
    if (activeTagId.value === tagId) return
    activeTagId.value = tagId
    fetchArticles()
  }

  // 添加标签
  function addTag(label: string, query: string) {
    const id = `custom_${Date.now()}`
    tags.value.push({ id, label, query })
  }

  // 删除标签
  function removeTag(tagId: string) {
    // 不允许删除"全部"标签
    if (tagId === 'all') return
    tags.value = tags.value.filter(t => t.id !== tagId)
    // 如果删除的是当前选中的标签，切回全部
    if (activeTagId.value === tagId) {
      setActiveTag('all')
    }
  }

  return {
    isPanelOpen,
    isLoading,
    error,
    articles,
    totalCount,
    activeTagId,
    tags,
    filteredArticles,
    openPanel,
    closePanel,
    fetchArticles,
    setActiveTag,
    addTag,
    removeTag
  }
})
