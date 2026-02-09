<template>
  <div class="chat-view">
    <!-- 顶部导航栏 - Figma: height 50px, border-bottom #E5E6EB -->
    <ChatTopBar
      title="证据问询"
      @back="handleBack"
      @new-conversation="handleNewConversation"
    />

    <!-- 消息列表区域 -->
    <div ref="messagesContainer" class="messages-container" @scroll="handleScroll">
      <div class="messages-content">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :role="message.role"
          :content="message.content"
          :is-streaming="message.isStreaming"
          :thinking-status="message.thinkingStatus"
          :citations="message.citations"
          :follow-up-questions="message.role === 'assistant' ? followUpQuestions : undefined"
          @follow-up="handleFollowUp"
        />
      </div>
    </div>

    <!-- 底部输入区域 - Figma: 对话框 Group -->
    <div class="input-container">
      <!-- 滚动到底部按钮 -->
      <transition name="fade">
        <button
          v-if="showScrollButton"
          class="scroll-to-bottom-btn"
          @click="handleScrollToBottomClick"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="#1C1C1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </transition>
      <SearchInput
        v-model="inputText"
        :is-generating="isGenerating"
        :deep-thinking-enabled="deepThinkingEnabled"
        :show-hint="true"
        placeholder="请输入您的问题或综述标题"
        @submit="handleSubmit"
        @stop="handleStop"
        @toggle-deep-thinking="toggleDeepThinking"
        @close-deep-thinking="closeDeepThinking"
      />
      <!-- AI 生成声明 -->
      <div class="ai-disclaimer">内容由 AI 生成，仅供参考</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores'
import ChatTopBar from '@/components/chat/ChatTopBar.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import SearchInput from '@/components/common/SearchInput.vue'

// Store
const chatStore = useChatStore()
const { isGenerating, deepThinkingEnabled, followUpQuestions, currentConversation } = storeToRefs(chatStore)

// Refs
const messagesContainer = ref<HTMLElement | null>(null)
const inputText = ref('')
const showScrollButton = ref(false)
const userHasScrolled = ref(false)
const currentAiMessageId = ref<string | null>(null) // 当前 AI 消息 ID
const isAutoScrolling = ref(false) // 是否正在自动滚动

// 从 store 获取消息列表
const messages = computed(() => currentConversation.value?.messages || [])

// 节流函数
function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

// 检测是否滚动到底部
function isAtBottom(): boolean {
  if (!messagesContainer.value) return true
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  return scrollHeight - scrollTop - clientHeight < 100
}

// 处理滚动事件 - 节流版本
const handleScroll = throttle(() => {
  if (!messagesContainer.value) return

  // 如果正在自动滚动，不要将其视为用户滚动
  if (isAutoScrolling.value) return

  const atBottom = isAtBottom()

  // 更新滚动按钮显示状态
  showScrollButton.value = !atBottom

  // 检测用户是否手动滚动（向上滚动）
  if (isGenerating.value && !atBottom) {
    userHasScrolled.value = true
  }
}, 100)

// 滚动到底部 - 用于流式输出时的自动滚动
function scrollToBottom() {
  if (!messagesContainer.value || userHasScrolled.value) return

  isAutoScrolling.value = true
  messagesContainer.value.scrollTo({
    top: messagesContainer.value.scrollHeight,
    behavior: 'auto' // 使用 auto 而不是 smooth，避免与用户滚动冲突
  })

  // 滚动完成后重置标志
  requestAnimationFrame(() => {
    isAutoScrolling.value = false
  })
}

// 滚动按钮点击 - 平滑滚动到底部
function handleScrollToBottomClick() {
  userHasScrolled.value = false
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// 滚动到新问题位置（顶部区域）- ChatGPT 风格
async function scrollToNewQuestion() {
  // 等待 Vue 渲染完成
  await nextTick()
  // 额外等待确保 DOM 完全更新
  await delay(100)

  if (!messagesContainer.value) return

  // 获取消息内容容器
  const messagesContent = messagesContainer.value.querySelector('.messages-content')
  if (!messagesContent) return

  // 获取所有消息元素
  const messageElements = messagesContent.querySelectorAll('.message')
  if (messageElements.length === 0) return

  // 获取最后一个用户消息（刚添加的问题）
  const allMessages = Array.from(messageElements)
  const lastUserMessage = allMessages.reverse().find(
    el => el.classList.contains('message-user')
  ) as HTMLElement | undefined

  if (lastUserMessage) {
    // 使用 getBoundingClientRect 计算精确位置
    const containerRect = messagesContainer.value.getBoundingClientRect()
    const elementRect = lastUserMessage.getBoundingClientRect()

    // 容器的 padding-top 是 24px
    const containerPadding = 24

    // 计算元素相对于容器可视区域顶部的偏移
    // containerRect.top 是容器边框位置，需要加上 padding 才是内容区域开始位置
    const relativeTop = elementRect.top - containerRect.top - containerPadding

    // 计算目标滚动位置：当前滚动位置 + 相对偏移
    // 这样元素就会滚动到容器内容区域顶部
    const targetScrollTop = messagesContainer.value.scrollTop + relativeTop

    messagesContainer.value.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })

    showScrollButton.value = false
    userHasScrolled.value = false
  }
}

async function handleSubmit(query: string) {
  if (!query.trim()) return

  // 重置滚动状态
  userHasScrolled.value = false

  // 添加用户消息到 store
  chatStore.addMessage({
    role: 'user',
    content: query
  })
  inputText.value = ''

  // 使用 ChatGPT 风格的滚动：将新问题定位到顶部区域
  await scrollToNewQuestion()

  // 开始生成
  chatStore.setGenerating(true)

  // 添加 AI 消息（带思考状态）到 store
  const aiMessageId = chatStore.addMessage({
    role: 'assistant',
    content: '',
    isStreaming: true,
    thinkingStatus: {
      isThinking: true,
      steps: [
        { id: '1', label: '分析理解问题', status: 'processing' },
        { id: '2', label: '搜索医学文献、指南', status: 'pending' },
        { id: '3', label: '筛选核心证据总结答案', status: 'pending' }
      ]
    }
  })

  if (!aiMessageId) return
  currentAiMessageId.value = aiMessageId // 保存当前消息 ID

  // 稍等一下让 DOM 更新，然后滚动到新问题位置
  // AI 回复会自然出现在用户问题下方
  await scrollToNewQuestion()

  // 等待 ThinkingPanel 动画完成并收起
  // ThinkingPanel 动画时间: 3步 * 3秒 = 9秒，收起需要额外 500ms
  // 使用可中断的等待
  const thinkingSteps = 3
  const thinkingDuration = thinkingSteps * 3000 + 500
  const checkInterval = 100 // 每 100ms 检查一次停止请求
  let elapsed = 0

  while (elapsed < thinkingDuration) {
    if (chatStore.isStopRequested()) {
      // 停止请求已在 handleStop 中处理，直接返回
      return
    }
    await delay(checkInterval)
    elapsed += checkInterval
  }

  // 更新思考状态为完成
  const message = currentConversation.value?.messages.find(m => m.id === aiMessageId)
  if (message?.thinkingStatus) {
    chatStore.updateMessage(aiMessageId, {
      thinkingStatus: {
        isThinking: false,
        steps: message.thinkingStatus.steps
      }
    })
  }

  // 等待 Vue 响应式更新完成，确保 UI 状态正确
  await nextTick()
  await delay(300)

  // 模拟流式输出
  await simulateStreaming(aiMessageId)

  chatStore.setGenerating(false)
}

async function simulateStreaming(messageId: string) {
  const fullContent = `根据您的问题，我已为您检索并分析了相关医学文献，共筛选出 47 篇高质量研究文献和 12 部临床指南。

## 一、疾病概述

重度狼疮性肾炎（Lupus Nephritis, LN）是系统性红斑狼疮（SLE）最常见且最严重的器官受累表现之一，约 40%-60% 的 SLE 患者在病程中会出现肾脏损害。根据 2018 年 ISN/RPS 分类标准，III/IV 型狼疮性肾炎属于增殖性肾炎，预后相对较差，需要积极的免疫抑制治疗。

狼疮性肾炎的发病机制复杂，涉及免疫复合物沉积、补体激活、T 细胞和 B 细胞功能异常等多种因素。肾脏活检是诊断和分型的金标准，可以帮助确定疾病的活动性和慢性化程度，从而指导治疗方案的选择。

## 二、环磷酰胺治疗失败后的挽救方案

### 1. 利妥昔单抗（Rituximab）

- **作用机制**：CD20 单克隆抗体，选择性清除 B 细胞
- **推荐剂量**：375 mg/m² 每周一次，连续 4 周；或 1000 mg 第 1 天和第 15 天
- **循证依据**：LUNAR 研究显示，利妥昔单抗联合霉酚酸酯可提高完全缓解率（来源：Arthritis Rheum 2012;64:1215-26）
- **注意事项**：需监测感染风险，尤其是乙肝病毒再激活
- **临床经验**：对于环磷酰胺耐药或复发的患者，利妥昔单抗可作为二线挽救治疗的首选药物之一

### 2. 钙调磷酸酶抑制剂（CNI）

- **他克莫司（Tacrolimus）**：0.05-0.1 mg/kg/d，目标谷浓度 5-10 ng/mL
- **环孢素 A（CsA）**：3-5 mg/kg/d，目标谷浓度 100-200 ng/mL
- **优势**：对足细胞有直接保护作用，可快速降低蛋白尿
- **循证依据**：多中心 RCT 显示 CNI 联合激素的缓解率可达 83%（来源：CJASN 2015;10:447-55）
- **药代动力学**：他克莫司主要经肝脏 CYP3A4 代谢，需注意药物相互作用

### 3. 贝利尤单抗（Belimumab）

- **作用机制**：抑制 B 淋巴细胞刺激因子（BLyS）
- **推荐剂量**：10 mg/kg 静脉注射，第 0、14、28 天，此后每 4 周一次
- **循证依据**：BLISS-LN 研究证实贝利尤单抗可显著提高肾脏缓解率（来源：Lancet 2020;395:1571-81）
- **特点**：2020 年 FDA 批准用于活动性狼疮性肾炎
- **安全性**：总体耐受性良好，最常见的不良反应包括恶心、腹泻和发热

### 4. 伏环孢素（Voclosporin）

- **最新进展**：2021 年 FDA 批准的新型 CNI
- **推荐剂量**：23.7 mg 每日两次
- **循证依据**：AURORA 研究显示完全缓解率达 41%，显著优于安慰剂组（来源：NEJM 2021;384:117-28）
- **优势**：无需监测血药浓度，给药更为便捷

### 5. 奥妥珠单抗（Obinutuzumab）

- **作用机制**：新型 II 型抗 CD20 单克隆抗体
- **研究进展**：NOBILITY 研究显示其在狼疮性肾炎中的疗效优于安慰剂
- **特点**：相比利妥昔单抗，具有更强的 B 细胞清除能力

## 三、联合治疗策略

根据 2024 年 KDIGO 指南和 EULAR/ERA-EDTA 建议，对于难治性狼疮性肾炎，推荐采用多靶点联合治疗：

1. **霉酚酸酯 + 他克莫司 + 激素**（多靶点方案）
2. **利妥昔单抗 + 霉酚酸酯 + 激素**
3. **贝利尤单抗 + 标准诱导治疗**
4. **伏环孢素 + 霉酚酸酯 + 激素**（AURORA 方案）

多靶点治疗的理论基础在于：不同免疫抑制剂作用于免疫反应的不同环节，联合使用可以产生协同效应，同时减少单药的剂量和毒性。

## 四、预后评估指标

### 主要监测指标
- 24 小时尿蛋白定量
- 血清肌酐和 eGFR
- 补体 C3、C4 水平
- 抗 dsDNA 抗体滴度
- 肾脏病理活动性指数（AI）和慢性指数（CI）

### 治疗反应定义
- **完全缓解**：尿蛋白 < 0.5 g/24h，血清肌酐正常或接近正常
- **部分缓解**：尿蛋白下降 ≥ 50% 且 < 3 g/24h，血清肌酐稳定或改善
- **无反应**：未达到部分缓解标准

## 五、随访建议

建议每 2-4 周监测肾功能和尿蛋白，每 1-3 个月评估免疫学指标。治疗 6 个月后如仍未达到部分缓解，应考虑更换治疗方案或重新行肾活检评估。

### 长期管理要点

1. **心血管风险管理**：狼疮性肾炎患者心血管疾病风险增加，需积极控制血压、血脂
2. **骨质疏松预防**：长期使用糖皮质激素者需补充钙剂和维生素 D
3. **感染预防**：免疫抑制治疗期间需警惕机会性感染，必要时预防性用药
4. **妊娠管理**：育龄期女性需在疾病稳定后计划妊娠，孕期需调整药物

## 六、新兴治疗方向

### 1. CAR-T 细胞治疗
近年来，CD19 CAR-T 细胞治疗在难治性系统性红斑狼疮中显示出令人鼓舞的疗效，多例患者达到持久的无药缓解。

### 2. JAK 抑制剂
巴瑞替尼（Baricitinib）等 JAK 抑制剂在 SLE 中的研究正在进行中。

### 3. 补体抑制剂
针对补体系统的新型药物如抗 C5 单克隆抗体正在临床研究阶段。

如需进一步了解具体某个治疗方案的详细信息，请继续提问。`

  let content = ''
  let wasStopped = false
  let scrollCounter = 0 // 滚动计数器
  // 流式输出 - 每 2 个字符延迟 40ms，速度适中便于阅读
  // 约每秒输出 50 个字符
  for (let i = 0; i < fullContent.length; i++) {
    // 检查是否请求停止
    if (chatStore.isStopRequested()) {
      wasStopped = true
      break
    }

    content += fullContent[i]
    chatStore.updateMessage(messageId, { content })
    if (i % 2 === 0) {
      await delay(40)
      // 降低滚动频率：每 20 个字符滚动一次（约 800ms 一次）
      scrollCounter++
      if (scrollCounter >= 10 && !userHasScrolled.value) {
        scrollCounter = 0
        scrollToBottom()
      }
    }
  }

  // 根据是否被停止更新消息状态
  if (wasStopped) {
    // 已在 handleStop 中处理，这里只需确保 isStreaming 为 false
    chatStore.updateMessage(messageId, {
      isStreaming: false
    })
  } else {
    chatStore.updateMessage(messageId, {
      isStreaming: false,
      citations: [
        {
          id: '1',
          type: 'article',
          title: 'Systematic Review of Disease Mechanisms and Treatment Approaches',
          date: '2025-10-13'
        },
        {
          id: '2',
          type: 'guideline',
          title: 'Clinical Practice Guidelines for Disease Management',
          date: '2025-10-10'
        }
      ]
    })
  }
}

function handleFollowUp(question: string) {
  handleSubmit(question)
}

// 停止生成
function handleStop() {
  chatStore.requestStop()

  // 如果有正在生成的消息，立即添加终止提示
  if (currentAiMessageId.value) {
    const message = currentConversation.value?.messages.find(m => m.id === currentAiMessageId.value)
    if (message) {
      const currentContent = message.content || ''
      chatStore.updateMessage(currentAiMessageId.value, {
        content: currentContent + (currentContent ? '\n\n---\n\n' : '') + '**本次回答已被终止**',
        isStreaming: false,
        thinkingStatus: message.thinkingStatus ? {
          isThinking: false,
          steps: []
        } : undefined
      })
    }
  }

  chatStore.setGenerating(false)
  currentAiMessageId.value = null
}

function toggleDeepThinking() {
  chatStore.toggleDeepThinking()
}

function closeDeepThinking() {
  chatStore.setDeepThinking(false)
}

function handleBack() {
  // 返回首页（清除当前对话状态）
  chatStore.clearCurrentConversation()
}

function handleNewConversation() {
  // 创建新对话（清除当前对话，返回首页）
  chatStore.clearCurrentConversation()
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 监听消息变化 - 仅在新消息添加时滚动，不监听内容变化
watch(() => messages.value.length, (newLen, oldLen) => {
  if (newLen > oldLen && !userHasScrolled.value) {
    scrollToBottom()
  }
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #FFFFFF;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.messages-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 底部输入区域 */
.input-container {
  flex-shrink: 0;
  padding: 0 24px 10px 24px;
  background-color: #FFFFFF;
  position: relative;
}

.input-container > * {
  max-width: 900px;
  margin: 0 auto;
}

/* 滚动到底部按钮 */
.scroll-to-bottom-btn {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #FFFFFF;
  border: 1px solid #E5E6EB;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.scroll-to-bottom-btn:hover {
  background-color: #F7F8FA;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(-50%) scale(1.05);
}

.scroll-to-bottom-btn:active {
  transform: translateX(-50%) scale(0.95);
}

/* AI 生成声明 */
.ai-disclaimer {
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 1.4;
  color: #86909C;
  margin-top: 8px;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
