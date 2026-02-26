// 会话相关类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  thinkingStatus?: ThinkingStatus
  citations?: Citation[]
}

export interface ThinkingStatus {
  isThinking: boolean
  steps: ThinkingStep[]
  currentStep?: number
}

export interface ThinkingStep {
  id: string
  label: string
  description?: string
  status: 'pending' | 'processing' | 'completed'
  result?: string
}

export interface Citation {
  id: string
  type: 'article' | 'guideline' | 'book' | 'other'
  title: string
  authors?: string[]
  journal?: string
  year?: number
  date?: string
  url?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// 导航相关类型
export interface NavItem {
  id: string
  label: string
  icon: string
  route?: string
  isActive?: boolean
}

export interface HistoryItem {
  id: string
  title: string
  preview?: string
  timestamp: Date
}

// 推荐问题
export interface SuggestedQuestion {
  id: string
  question: string
  category: string
  categoryLabel: string
}

// 应用状态
export interface AppState {
  sidebarCollapsed: boolean
  activeNav: string
  currentConversationId: string | null
  isGenerating: boolean
  deepThinkingEnabled: boolean
}

// PubMed 文献相关类型
export interface PubMedArticle {
  pmid: string
  title: string
  authors: string[]
  journal: string
  pubDate: string
  abstract?: string
  doi?: string
  url: string
  categories: string[]
  pubType?: string        // PubMed 文献类型
  impactFactor?: number   // IF 指数
  isHot?: boolean         // 本月热文
  isFavorited?: boolean   // 是否已收藏
}

export interface PubMedKeyword {
  id: string
  label: string
  query: string // PubMed 搜索关键词
}

// 文献推荐设置
export type TimeWindow = 30 | 90 | 180
export type JournalFilter = 'all' | 'highIF' | 'top'

export interface PubMedSettings {
  timeWindow: TimeWindow
  journalFilter: JournalFilter
  dailyCount: number
  personalPreference: string
}
