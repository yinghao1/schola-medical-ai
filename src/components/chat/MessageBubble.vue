<template>
  <div :class="['message', `message-${role}`]">
    <!-- 用户消息 - Figma: Frame 1321319530, border-radius 14px 14px 0px 14px, bg #4080FF -->
    <template v-if="role === 'user'">
      <div class="user-message-wrapper">
        <div class="user-message-bubble">
          <p class="user-message-text">{{ content }}</p>
        </div>
      </div>
    </template>

    <!-- AI 消息 -->
    <template v-else>
      <div class="ai-message">
        <!-- 思考状态面板 - Figma: Frame 1321319542, border-radius 14px -->
        <ThinkingPanel
          v-if="thinkingStatus && thinkingStatus.steps.length > 0"
          :steps="thinkingStatus.steps"
          :is-thinking="thinkingStatus.isThinking"
          @collapse-complete="onThinkingCollapseComplete"
        />

        <!-- 消息内容 - Figma: Ai 回答的内容, gap 10px -->
        <!-- 打印机式流式输出效果 -->
        <transition name="content-fade">
          <div v-if="shouldShowContent" class="ai-message-content markdown-content">
            <div v-html="displayedContent" />
            <span v-if="isTyping" class="typing-cursor" />
          </div>
        </transition>

        <!-- 分割线 - Figma: Line 76, stroke #E5E6EB -->
        <!-- 只有在有内容、思考完成且流式输出完成后才显示引用和继续问 -->
        <div v-if="shouldShowContent && !isTyping && citations && citations.length > 0" class="divider-line"></div>

        <!-- 引用证据 - Figma: Frame 1321319557, gap 20px -->
        <div v-if="shouldShowContent && !isTyping && citations && citations.length > 0" class="citations-section">
          <div class="citations-header-row">
            <!-- 标题 - Figma: Frame 1321319548, gap 5px -->
            <div class="citations-header">
              <!-- 图标 16x16 - List-bottom (列表).svg -->
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.66667 3.99984C3.03486 3.99984 3.33333 3.70137 3.33333 3.33317C3.33333 2.96498 3.03486 2.6665 2.66667 2.6665C2.29848 2.6665 2 2.96498 2 3.33317C2 3.70137 2.29848 3.99984 2.66667 3.99984Z" stroke="#4080FF" stroke-width="1.33333" stroke-linejoin="round"/>
                <path d="M2.66667 8.66683C3.03486 8.66683 3.33333 8.36836 3.33333 8.00016C3.33333 7.63196 3.03486 7.3335 2.66667 7.3335C2.29848 7.3335 2 7.63196 2 8.00016C2 8.36836 2.29848 8.66683 2.66667 8.66683Z" stroke="#4080FF" stroke-width="1.33333" stroke-linejoin="round"/>
                <path d="M2.66667 13.3333C3.03486 13.3333 3.33333 13.0349 3.33333 12.6667C3.33333 12.2985 3.03486 12 2.66667 12C2.29848 12 2 12.2985 2 12.6667C2 13.0349 2.29848 13.3333 2.66667 13.3333Z" stroke="#4080FF" stroke-width="1.33333" stroke-linejoin="round"/>
                <path d="M6.66797 8H14.668" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66797 12.6665H14.668" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66797 3.3335H14.668" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 标题文字 - Figma: 15px, font-weight 600, #000000 -->
              <span class="citations-title">引用证据</span>
            </div>
            <!-- 展开/收起按钮 -->
            <button @click="toggleCitations" class="citations-toggle">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  :d="citationsExpanded ? 'M4 10L8 6L12 10' : 'M4 6L8 10L12 6'"
                  stroke="#86909C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <transition name="collapse">
            <div v-show="citationsExpanded" class="citations-list">
              <CitationCard
                v-for="citation in citations"
                :key="citation.id"
                :type="citation.type"
                :title="citation.title"
                :date="citation.date"
                :url="citation.url"
              />
            </div>
          </transition>
        </div>

        <!-- 继续提问 - Figma: Frame 1321319554, border-radius 10px, bg #E8F3FF -->
        <!-- 只有在有内容、思考完成且流式输出完成后才显示 -->
        <div v-if="shouldShowContent && !isTyping && followUpQuestions && followUpQuestions.length > 0" class="follow-up-section">
          <!-- 标题 - Figma: Frame 1321319556, gap 5px -->
          <div class="follow-up-header">
            <!-- 标题文字 - Figma: 15px, font-weight 600, #4080FF -->
            <span class="follow-up-title">继续问</span>
          </div>
          <!-- 问题列表 - Figma: Frame 1321319555, bg #FFFFFF, border-radius 8px -->
          <div class="follow-up-list">
            <button
              v-for="(question, index) in followUpQuestions"
              :key="index"
              @click="handleFollowUp(question)"
              class="follow-up-item"
            >
              {{ question }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import ThinkingPanel from './ThinkingPanel.vue'
import CitationCard from './CitationCard.vue'
import type { ThinkingStatus, Citation } from '@/types'

// Props
interface Props {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  thinkingStatus?: ThinkingStatus
  citations?: Citation[]
  followUpQuestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false
})

// Emits
const emit = defineEmits<{
  (e: 'follow-up', question: string): void
  (e: 'typing-complete'): void  // 打字动画完成事件
}>()

// 状态
const citationsExpanded = ref(true)
const isTyping = ref(false) // 是否正在打字
const displayedContent = ref('') // 当前显示的内容
const typingIndex = ref(0) // 当前打字位置
const typingTimer = ref<number | null>(null) // 打字定时器
const hasStartedTyping = ref(false) // 是否已开始打字
const isThinkingCollapsed = ref(false) // 思考面板是否已收起

// 计算属性 - 是否应该显示内容（思考面板收起后且已开始打字才显示）
const shouldShowContent = computed(() => {
  // 如果没有思考状态，直接显示内容
  if (!props.thinkingStatus || props.thinkingStatus.steps.length === 0) {
    return props.content.length > 0
  }
  // 只有在思考面板收起后且已开始打字时才显示内容
  return isThinkingCollapsed.value && hasStartedTyping.value
})

// 思考面板收起完成的回调
function onThinkingCollapseComplete() {
  isThinkingCollapsed.value = true
  // 面板收起后开始打字动画
  if (props.content) {
    startTypingAnimation()
  }
}

// 计算属性 - 完整的 Markdown 渲染内容
const fullRenderedContent = computed(() => {
  let html = props.content

  // 处理标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 处理加粗
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 处理无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // 处理有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // 处理段落
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<p>${html}</p>`

  // 清理空段落
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')

  return html
})

// 打印机式打字动画
function startTypingAnimation() {
  if (!props.content || hasStartedTyping.value) return

  hasStartedTyping.value = true
  isTyping.value = true
  displayedContent.value = ''
  typingIndex.value = 0

  // 清除之前的定时器
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
  }

  // 将完整内容按字符分割
  const fullText = props.content
  const typingSpeed = 30 // 打字速度（毫秒/字符），适中的速度

  typingTimer.value = window.setInterval(() => {
    if (typingIndex.value < fullText.length) {
      // 每次添加一个字符
      typingIndex.value++
      const currentText = fullText.slice(0, typingIndex.value)
      displayedContent.value = renderMarkdown(currentText)
    } else {
      // 打字完成
      finishTyping()
    }
  }, typingSpeed)
}

// 渲染 Markdown（用于打字过程中的内容）
function renderMarkdown(text: string): string {
  let html = text

  // 处理标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 处理加粗
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 处理无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // 处理有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // 处理段落
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<p>${html}</p>`

  // 清理空段落
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')

  return html
}

// 完成打字
function finishTyping() {
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
  isTyping.value = false
  displayedContent.value = fullRenderedContent.value
  // 通知父组件打字动画已完成
  emit('typing-complete')
}

// 方法
function toggleCitations() {
  citationsExpanded.value = !citationsExpanded.value
}

function handleFollowUp(question: string) {
  emit('follow-up', question)
}

// 监听 content 变化
watch(() => props.content, () => {
  // 情况1：没有思考状态时，直接开始打字动画
  if (!props.thinkingStatus || props.thinkingStatus.steps.length === 0) {
    if (!hasStartedTyping.value && props.content) {
      startTypingAnimation()
    }
    return
  }

  // 情况2：有思考状态，但面板已收起，此时内容变化应该开始打字动画
  // 这处理了面板收起时 content 还为空，之后 content 才有值的情况
  if (isThinkingCollapsed.value && !hasStartedTyping.value && props.content) {
    startTypingAnimation()
  }
})

// 监听 thinkingStatus 变化，重置状态
watch(() => props.thinkingStatus, (newVal, oldVal) => {
  if (newVal?.isThinking) {
    // 思考开始时重置所有状态
    hasStartedTyping.value = false
    displayedContent.value = ''
    isTyping.value = false
    isThinkingCollapsed.value = false
    if (typingTimer.value) {
      clearInterval(typingTimer.value)
      typingTimer.value = null
    }
  } else if (oldVal?.isThinking && newVal && !newVal.isThinking && newVal.steps.length === 0) {
    // 从思考中变为非思考，且 steps 被清空 -> 终止情况
    // 统一通过 onThinkingCollapseComplete 触发内容显示
    onThinkingCollapseComplete()
  }
  // 注意：不在这里自动开始打字，等待 onThinkingCollapseComplete 事件
}, { immediate: true })

// 组件卸载时清除定时器
onUnmounted(() => {
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
  }
})
</script>

<style scoped>
.message {
  width: 100%;
  /* 允许外发光效果溢出显示 */
  overflow: visible;
}

.message-user {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.message-assistant {
  margin-bottom: 24px;
}

/* 用户消息容器 */
.user-message-wrapper {
  display: flex;
  align-items: flex-end;
  position: relative;
  max-width: 80%;
}

/* 用户消息气泡 */
.user-message-bubble {
  background-color: rgba(235, 245, 255, 1);
  color: #000000;
  max-width: 100%;
  line-height: 26px;
  font-size: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid transparent;
  border-radius: 16px 0 16px 16px;
  padding: 10px 16px;
}

/* 用户消息文字 - Figma: style_6W52R1, 15px, font-weight 400 */
.user-message-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.4;
  margin: 0;
}

/* AI消息容器 */
.ai-message {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* 允许外发光效果溢出显示 */
  overflow: visible;
}

/* AI消息内容 - Figma: gap 10px, 15px, line-height 1.6 */
.ai-message-content {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.6;
  color: #000000;
}

/* Markdown 内容样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown-content :deep(h1) {
  font-size: 20px;
}

.markdown-content :deep(h2) {
  font-size: 17px;
}

.markdown-content :deep(h3) {
  font-size: 15px;
}

.markdown-content :deep(p) {
  margin-bottom: 10px;
}

.markdown-content :deep(ul) {
  padding-left: 20px;
  margin-bottom: 10px;
}

.markdown-content :deep(li) {
  margin-bottom: 4px;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

/* 分割线 - Figma: Line 76, stroke #EFEFEF */
.divider-line {
  height: 1px;
  background-color: #EFEFEF;
  width: 900px;
  max-width: 100%;
}

/* 引用证据区域 - Figma: Frame 1321319557, gap 20px */
.citations-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 引用证据标题行 */
.citations-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

/* 引用证据标题 - Figma: Frame 1321319548, gap 5px */
.citations-header {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 标题文字 - Figma: style_C2ST2Y, 15px, font-weight 600, #000000 */
.citations-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.4;
  color: #000000;
}

.citations-toggle {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.citations-toggle:hover {
  background-color: #F3F5F6;
}

/* 引用列表 - Figma: Frame 1321319552, gap 10px */
.citations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 继续问区域 - Figma: Frame 1321319554, border-radius 10px, bg #E8F3FF */
.follow-up-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 5px 5px 5px;
  background-color: #E8F3FF;
  border-radius: 10px;
}

/* 继续问标题 - Figma: Frame 1321319556 */
.follow-up-header {
  display: flex;
  align-items: center;
  padding: 0 20px 0 10px;
}

/* 继续问标题文字 - Figma: style_W9MWIR, 15px, font-weight 600, #4080FF */
.follow-up-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.4;
  text-align: left;
  color: #4080FF;
}

/* 问题列表 - Figma: Frame 1321319555, bg #FFFFFF, border-radius 8px, padding 15px */
.follow-up-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: #FFFFFF;
  border-radius: 8px;
}

/* 问题项 - Figma: style_IDTF6X, 14px, font-weight 400, #000000, line-height 1.6 */
.follow-up-item {
  text-align: left;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  color: #000000;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  border: none;
  background: none;
}

.follow-up-item:hover {
  color: #4080FF;
}

/* 问题分割线 */
.follow-up-list .follow-up-item:not(:last-child) {
  padding-bottom: 10px;
  border-bottom: 1px solid #F4F5F7;
}

/* 打字光标动画 - 圆形点 */
.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4080FF;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 1s infinite;
  font-size: 0;
  line-height: 0;
  border: none;
  outline: none;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 折叠动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 500px;
}

/* 内容区域淡入动画 */
.content-fade-enter-active {
  transition: all 0.5s ease;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.content-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
