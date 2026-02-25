import type { PubMedArticle } from '@/types'

/**
 * PubMed E-utilities API 服务
 *
 * 开发环境通过 Vite proxy（/pubmed-api）转发请求，避免 CORS 问题
 * 生产环境直接调用 NCBI API（已支持 CORS）
 */

const PUBMED_BASE = import.meta.env.DEV
  ? '/pubmed-api'
  : 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

/**
 * 搜索文献 ID 列表
 * @param query  PubMed 搜索词（MeSH 或自由文本）
 * @param retmax 返回数量上限
 * @param reldate 相对天数（最近 N 天内发布的文献）
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
    retmode: 'json',
    tool: 'schola_medical_ai',
    email: 'schola@example.com'
  })

  // 使用 reldate 参数限制日期范围（NCBI 标准方式）
  if (reldate) {
    params.set('reldate', String(reldate))
    params.set('datetype', 'pdat')
  }

  const url = `${PUBMED_BASE}/esearch.fcgi?${params}`
  console.log('[PubMed] Search request:', url)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`PubMed search failed: ${res.status} ${res.statusText}`)
  }

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
    retmode: 'json',
    tool: 'schola_medical_ai',
    email: 'schola@example.com'
  })

  const url = `${PUBMED_BASE}/esummary.fcgi?${params}`
  console.log('[PubMed] Summary request for', ids.length, 'articles')

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`PubMed summary failed: ${res.status} ${res.statusText}`)
  }

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
