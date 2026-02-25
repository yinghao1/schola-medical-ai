import type { PubMedArticle } from '@/types'

/**
 * PubMed E-utilities API 服务
 *
 * 开发环境：通过 Vite proxy（/pubmed-api）转发
 * 生产环境：通过 Vercel Serverless Function（/api/pubmed）转发
 *
 * 两种方式均为服务端代理，彻底避免 CORS 问题。
 */

/** 带重试的 fetch 封装 */
async function fetchWithRetry(
  url: string,
  retries = 2,
  timeout = 15000
): Promise<Response> {
  let lastError: Error | null = null

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      }
      return res
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(`[PubMed] Attempt ${i + 1}/${retries + 1} failed:`, lastError.message)

      // 最后一次不等待
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError ?? new Error('Request failed')
}

/**
 * 搜索文献 ID 列表
 */
async function searchArticles(
  query: string,
  retmax = 20,
  reldate?: number
): Promise<string[]> {
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(retmax),
    sort: 'pub_date',
    retmode: 'json'
  })

  if (reldate) {
    params.set('reldate', String(reldate))
    params.set('datetype', 'pdat')
  }

  let url: string
  if (import.meta.env.DEV) {
    // 开发环境：Vite proxy
    params.set('tool', 'schola_medical_ai')
    params.set('email', 'schola@example.com')
    url = `/pubmed-api/esearch.fcgi?${params}`
  } else {
    // 生产环境：Vercel Serverless Function
    params.set('endpoint', 'esearch.fcgi')
    url = `/api/pubmed?${params}`
  }

  console.log('[PubMed] Search request:', url)

  const res = await fetchWithRetry(url)
  const data = await res.json()
  const ids = data.esearchresult?.idlist || []
  console.log(`[PubMed] Found ${ids.length} articles for query: "${query}"`)
  return ids
}

/**
 * 根据 ID 列表获取文献摘要信息
 */
async function fetchSummaries(ids: string[]): Promise<PubMedArticle[]> {
  if (ids.length === 0) return []

  const params = new URLSearchParams({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json'
  })

  let url: string
  if (import.meta.env.DEV) {
    params.set('tool', 'schola_medical_ai')
    params.set('email', 'schola@example.com')
    url = `/pubmed-api/esummary.fcgi?${params}`
  } else {
    params.set('endpoint', 'esummary.fcgi')
    url = `/api/pubmed?${params}`
  }

  console.log('[PubMed] Summary request for', ids.length, 'articles')

  const res = await fetchWithRetry(url)
  const data = await res.json()
  const result = data.result || {}

  return ids
    .filter(id => result[id])
    .map(id => {
      const item = result[id]
      const authors = (item.authors || []).map((a: { name: string }) => a.name)

      return {
        pmid: id,
        title: item.title || '',
        authors,
        journal: item.source || item.fulljournalname || '',
        pubDate: item.pubdate || item.epubdate || '',
        doi: item.elocationid || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        categories: [],
        abstract: ''
      } as PubMedArticle
    })
}

/**
 * 获取最新文献（默认最近 30 天）
 */
export async function getLatestArticles(
  query = 'medicine[MeSH]',
  count = 20,
  days = 30
): Promise<PubMedArticle[]> {
  const ids = await searchArticles(query, count, days)
  return fetchSummaries(ids)
}

/**
 * 按分类标签搜索文献（默认最近 90 天）
 */
export async function getArticlesByTag(
  tagQuery: string,
  count = 20,
  days = 90
): Promise<PubMedArticle[]> {
  const ids = await searchArticles(tagQuery, count, days)
  return fetchSummaries(ids)
}
