<template>
  <div class="app-layout">
    <!-- 侧边栏 - Figma: 侧导航, width 280px -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleSidebar"
      class="sidebar-wrapper"
    />

    <!-- 移动端遮罩 -->
    <transition name="fade">
      <div
        v-if="mobileMenuOpen"
        @click="closeMobileMenu"
        class="mobile-overlay"
      />
    </transition>

    <!-- 主内容区 - Figma: 白色背景 -->
    <main class="main-content">
      <!-- 极光背景效果 - 位于最底层 -->
      <iframe
        src="/aurora-bg.html"
        class="aurora-background"
        loading="lazy"
        aria-hidden="true"
      ></iframe>
      <!-- 移动端顶部栏 -->
      <header class="mobile-header">
        <button @click="toggleMobileMenu" class="menu-btn">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="mobile-logo">
          <span class="logo-title">论界</span>
          <span class="logo-subtitle">SCHOLA</span>
        </div>
        <div style="width: 24px;"></div>
      </header>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <transition name="fade" mode="out-in">
          <!-- 首页态 -->
          <HomeView
            v-if="!hasActiveConversation"
            @search="handleSearch"
          />
          <!-- 问答态 -->
          <ChatView v-else />
        </transition>
      </div>
    </main>
    <!-- 浮动新闻卡片 - 右上角，可拖动，面板打开时隐藏 -->
    <FloatingNewsCard
      v-show="!pubmedStore.isPanelOpen"
      :news-count="pubmedStore.totalCount || pubmedStore.settings.dailyCount"
      @click="handleNewsCardClick"
    />

    <!-- 文献推荐面板 - 右侧滑入 -->
    <LiteraturePanel />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore, useChatStore, usePubmedStore } from '@/stores'
import Sidebar from '@/components/layout/Sidebar.vue'
import HomeView from '@/components/home/HomeView.vue'
import ChatView from '@/components/chat/ChatView.vue'
import FloatingNewsCard from '@/components/common/FloatingNewsCard.vue'
import LiteraturePanel from '@/components/common/LiteraturePanel.vue'
import type { ThinkingStep, Citation } from '@/types'

// Stores
const appStore = useAppStore()
const chatStore = useChatStore()
const pubmedStore = usePubmedStore()

const { sidebarCollapsed, mobileMenuOpen } = storeToRefs(appStore)
const { hasActiveConversation } = storeToRefs(chatStore)

// 方法
function toggleSidebar() {
  appStore.toggleSidebar()
}

function toggleMobileMenu() {
  appStore.toggleMobileMenu()
}

function closeMobileMenu() {
  appStore.closeMobileMenu()
}

async function handleSearch(query: string) {
  // 创建新对话
  chatStore.createConversation()

  // 添加用户消息
  chatStore.addMessage({
    role: 'user',
    content: query
  })

  // 开始生成
  chatStore.setGenerating(true)

  // 添加 AI 消息（带思考状态）
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
      ] as ThinkingStep[]
    }
  })

  // 模拟 AI 响应过程
  await simulateAIResponse(aiMessageId as string)
}

async function simulateAIResponse(messageId: string) {
  // 模拟思考步骤
  await delay(800)
  updateThinkingStep(messageId, 0, 'completed')
  updateThinkingStep(messageId, 1, 'processing')

  await delay(1200)
  updateThinkingStep(messageId, 1, 'completed', '37680000 篇')
  updateThinkingStep(messageId, 2, 'processing')

  await delay(1000)
  updateThinkingStep(messageId, 2, 'completed')
  chatStore.updateMessage(messageId, {
    thinkingStatus: {
      isThinking: false,
      steps: chatStore.currentConversation?.messages.find(m => m.id === messageId)?.thinkingStatus?.steps || []
    }
  })

  // 模拟流式输出
  const fullContent = `根据您的问题，我已为您检索并分析了相关医学文献。

## 一、主要发现

该领域的研究表明，疾病的发生发展涉及多种复杂因素的相互作用。

### 1. 危险因素

- **环境因素**：包括生活方式、饮食习惯等
- **遗传因素**：家族史和基因突变
- **代谢因素**：代谢紊乱和炎症反应

### 2. 预防建议

- 保持健康的生活方式
- 定期体检和筛查
- 及时治疗相关疾病

如需进一步了解具体某个方面，请继续提问。`

  let content = ''
  for (const char of fullContent) {
    content += char
    chatStore.updateMessage(messageId, { content })
    if (content.length % 10 === 0) {
      await delay(20)
    }
  }

  // 完成生成
  const citations: Citation[] = [
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
      date: '2025-10-13'
    }
  ]

  chatStore.updateMessage(messageId, {
    isStreaming: false,
    citations
  })

  chatStore.setGenerating(false)
}

function updateThinkingStep(messageId: string, stepIndex: number, status: 'pending' | 'processing' | 'completed', result?: string) {
  const conversation = chatStore.currentConversation
  if (!conversation) return

  const message = conversation.messages.find(m => m.id === messageId)
  if (!message?.thinkingStatus?.steps) return

  const step = message.thinkingStatus.steps[stepIndex]
  if (step) {
    step.status = status
    if (result) {
      step.result = result
    }
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 浮动卡片点击处理 - 打开文献推荐面板
function handleNewsCardClick() {
  pubmedStore.openPanel()
}
</script>

<style scoped>
/* 主布局 - Figma: 1920x1080 */
.app-layout {
  display: flex;
  height: 100vh;
  background-color: #FFFFFF;
  overflow: hidden;
}

/* 侧边栏包装 - 桌面端显示 */
.sidebar-wrapper {
  display: none;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .sidebar-wrapper {
    display: flex;
  }
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

@media (min-width: 1024px) {
  .mobile-overlay {
    display: none;
  }
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #FFFFFF;
  position: relative;
  overflow: hidden;
}

/* 极光背景 iframe - 位于最底层 */
.aurora-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  z-index: 0;
  pointer-events: none;
  display: none;
}

/* 移动端头部 */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E6EB;
  position: relative;
  z-index: 1;
}

@media (min-width: 1024px) {
  .mobile-header {
    display: none;
  }
}

.menu-btn {
  padding: 6px;
  border-radius: 8px;
  color: #4E5969;
  transition: all 0.2s;
}

.menu-btn:hover {
  color: #000000;
  background-color: #F3F5F6;
}

.mobile-logo {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.logo-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  background: linear-gradient(112deg, #49DFF6 10%, #010BFE 93%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #4E5969;
}

/* 内容包装 */
.content-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
