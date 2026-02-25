import type { VercelRequest, VercelResponse } from '@vercel/node'

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

/**
 * Vercel Serverless Function — PubMed API 代理
 *
 * 解决生产环境浏览器直连 NCBI 的 CORS / 网络不稳定问题。
 * 服务端到服务端请求，无 CORS 限制。
 *
 * 用法：
 *   GET /api/pubmed?endpoint=esearch.fcgi&db=pubmed&term=...
 *   GET /api/pubmed?endpoint=esummary.fcgi&db=pubmed&id=...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 仅允许 GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { endpoint, ...queryParams } = req.query

  // 校验 endpoint 白名单
  const allowed = ['esearch.fcgi', 'esummary.fcgi']
  const ep = Array.isArray(endpoint) ? endpoint[0] : endpoint
  if (!ep || !allowed.includes(ep)) {
    return res.status(400).json({ error: 'Invalid endpoint. Allowed: esearch.fcgi, esummary.fcgi' })
  }

  // 构建 NCBI 请求 URL
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(queryParams)) {
    const v = Array.isArray(value) ? value[0] : value
    if (v) params.set(key, v)
  }
  // 强制添加 tool/email 标识（NCBI 要求）
  params.set('tool', 'schola_medical_ai')
  params.set('email', 'schola@example.com')

  const url = `${NCBI_BASE}/${ep}?${params}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000) // 15s 超时
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `NCBI API responded with ${response.status}`
      })
    }

    const data = await response.json()

    // 设置缓存：5 分钟 CDN 缓存，1 分钟客户端缓存
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    return res.status(200).json(data)
  } catch (err) {
    console.error('[PubMed Proxy] Error:', err)
    return res.status(502).json({
      error: 'Failed to fetch from NCBI PubMed API'
    })
  }
}
