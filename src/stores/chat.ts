import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message, HistoryItem, SuggestedQuestion } from '@/types'

// 用于生成唯一 ID 的计数器
let messageIdCounter = 0

// 固定的三个标签
const FIXED_LABELS = ['临床疑问', '病例解析', '用药指导'] as const

export const useChatStore = defineStore('chat', () => {
  // 状态
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string | null>(null)
  const isGenerating = ref(false)
  const stopRequested = ref(false) // 停止生成请求标志
  const deepThinkingEnabled = ref(false)

  // 示例历史会话数据
  const historyItems = ref<HistoryItem[]>([
    { id: '1', title: '骨髓穿刺及影像学，评估疾病活动性', timestamp: new Date('2024-12-15') },
    { id: '2', title: '多发性骨髓瘤', timestamp: new Date('2024-12-14') },
    { id: '3', title: '甲状腺结节', timestamp: new Date('2024-12-13') },
    { id: '4', title: '高胆固醇血症', timestamp: new Date('2024-12-12') },
    { id: '5', title: '肺部微小结节', timestamp: new Date('2024-12-11') },
    { id: '6', title: '慢性非萎缩性胃炎', timestamp: new Date('2024-12-10') },
    { id: '7', title: '胆囊多发息肉样病变', timestamp: new Date('2024-12-09') },
    { id: '8', title: '双侧下肢静脉曲张', timestamp: new Date('2024-12-08') },
  ])

  // 按标签分类的问题池
  const questionsByLabel: Record<string, SuggestedQuestion[]> = {
    '临床疑问': [
      {
        id: 'c1',
        question: '对于合并ASCVD的2型糖尿病患者，SGLT2i和GLP-1RA应如何选择与联用？',
        category: 'clinical',
        categoryLabel: '临床疑问'
      },
      {
        id: 'c2',
        question: '慢性阻塞性肺疾病急性加重期的抗生素如何选择？',
        category: 'clinical',
        categoryLabel: '临床疑问'
      },
      {
        id: 'c3',
        question: '胃癌根治术后辅助化疗方案如何制定？',
        category: 'clinical',
        categoryLabel: '临床疑问'
      },
      {
        id: 'c4',
        question: '高血压合并慢性肾病患者降压药物如何选择？',
        category: 'clinical',
        categoryLabel: '临床疑问'
      }
    ],
    '病例解析': [
      {
        id: 'p1',
        question: '重度狼疮性肾炎使用环磷酰胺后效果不佳，有哪些挽救治疗方案？',
        category: 'case',
        categoryLabel: '病例解析'
      },
      {
        id: 'p2',
        question: '糖尿病足感染的抗菌治疗方案如何制定？',
        category: 'case',
        categoryLabel: '病例解析'
      },
      {
        id: 'p3',
        question: '肺癌脑转移患者的靶向治疗选择有哪些？',
        category: 'case',
        categoryLabel: '病例解析'
      },
      {
        id: 'p4',
        question: '急性心肌梗死患者PCI术后抗血小板治疗策略有哪些？',
        category: 'case',
        categoryLabel: '病例解析'
      }
    ],
    '用药指导': [
      {
        id: 'm1',
        question: '肝硬化腹水患者的利尿剂使用原则是什么？',
        category: 'medication',
        categoryLabel: '用药指导'
      },
      {
        id: 'm2',
        question: '类风湿关节炎生物制剂的选择依据有哪些？',
        category: 'medication',
        categoryLabel: '用药指导'
      },
      {
        id: 'm3',
        question: '帕金森病患者运动症状的药物治疗策略是什么？',
        category: 'medication',
        categoryLabel: '用药指导'
      },
      {
        id: 'm4',
        question: '哮喘急性发作的阶梯治疗方案是什么？',
        category: 'medication',
        categoryLabel: '用药指导'
      }
    ]
  }

  // 每个标签的当前索引
  const labelIndices = ref<Record<string, number>>({
    '临床疑问': 0,
    '病例解析': 0,
    '用药指导': 0
  })

  // 当前显示的推荐问题（固定三个标签，各自轮换）
  const suggestedQuestions = computed<SuggestedQuestion[]>(() => {
    return FIXED_LABELS.map(label => {
      const questions = questionsByLabel[label]
      const index = labelIndices.value[label]
      return questions[index % questions.length]
    })
  })

  // 继续提问建议
  const followUpQuestions = ref<string[]>([
    '如何进行万古霉素的治疗药物监测？',
    '血液透析患者如何调整万古霉素剂量？'
  ])

  // 计算属性
  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null
    return conversations.value.find(c => c.id === currentConversationId.value) || null
  })

  const hasActiveConversation = computed(() => {
    return currentConversationId.value !== null &&
           currentConversation.value !== null &&
           currentConversation.value.messages.length > 0
  })

  // 方法
  function createConversation(): string {
    const id = `conv_${Date.now()}`
    const newConversation: Conversation = {
      id,
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.unshift(newConversation)
    currentConversationId.value = id
    return id
  }

  function addMessage(message: Omit<Message, 'id' | 'timestamp'>) {
    if (!currentConversationId.value) {
      createConversation()
    }

    const conversation = conversations.value.find(c => c.id === currentConversationId.value)
    if (conversation) {
      messageIdCounter++
      const newMessage: Message = {
        ...message,
        id: `msg_${Date.now()}_${messageIdCounter}`,
        timestamp: new Date()
      }
      conversation.messages.push(newMessage)
      conversation.updatedAt = new Date()

      // 更新对话标题（使用第一条用户消息）
      if (message.role === 'user' && conversation.messages.length === 1) {
        conversation.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
      }

      return newMessage.id
    }
    return null
  }

  function updateMessage(messageId: string, updates: Partial<Message>) {
    const conversation = currentConversation.value
    if (conversation) {
      const message = conversation.messages.find(m => m.id === messageId)
      if (message) {
        Object.assign(message, updates)
      }
    }
  }

  function setGenerating(value: boolean) {
    isGenerating.value = value
    // 开始生成时重置停止标志
    if (value) {
      stopRequested.value = false
    }
  }

  // 请求停止生成
  function requestStop() {
    stopRequested.value = true
  }

  // 检查是否请求停止
  function isStopRequested(): boolean {
    return stopRequested.value
  }

  // 重置停止标志
  function resetStopFlag() {
    stopRequested.value = false
  }

  function toggleDeepThinking() {
    deepThinkingEnabled.value = !deepThinkingEnabled.value
  }

  function setDeepThinking(value: boolean) {
    deepThinkingEnabled.value = value
  }

  function selectConversation(id: string) {
    currentConversationId.value = id
  }

  function clearCurrentConversation() {
    currentConversationId.value = null
  }

  // 换一换功能 - 每个标签独立切换到下一个问题
  function refreshSuggestedQuestions() {
    FIXED_LABELS.forEach(label => {
      const questions = questionsByLabel[label]
      labelIndices.value[label] = (labelIndices.value[label] + 1) % questions.length
    })
  }

  return {
    // 状态
    conversations,
    currentConversationId,
    isGenerating,
    stopRequested,
    deepThinkingEnabled,
    historyItems,
    suggestedQuestions,
    followUpQuestions,
    // 计算属性
    currentConversation,
    hasActiveConversation,
    // 方法
    createConversation,
    addMessage,
    updateMessage,
    setGenerating,
    requestStop,
    isStopRequested,
    resetStopFlag,
    toggleDeepThinking,
    setDeepThinking,
    selectConversation,
    clearCurrentConversation,
    refreshSuggestedQuestions
  }
})
