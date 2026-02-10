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

        <!-- 互动功能图标区域 - 只在内容输出完成后显示 -->
        <div v-if="shouldShowContent && !isTyping" class="interaction-icons">
          <!-- 点赞 -->
          <button
            @click="handleLike"
            class="interaction-btn"
            :class="{ 'is-active': isLiked }"
          >
            <span class="btn-tooltip">点赞</span>
            <!-- 非激活态 -->
            <svg v-if="!isLiked" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5.83333 18.3334H3.33333C2.89131 18.3334 2.46738 18.1578 2.15482 17.8453C1.84226 17.5327 1.66667 17.1088 1.66667 16.6667V10.8334C1.66667 10.3914 1.84226 9.96746 2.15482 9.6549C2.46738 9.34234 2.89131 9.16675 3.33333 9.16675H5.83333M11.6667 7.50008V4.16675C11.6667 3.50371 11.4033 2.86782 10.9345 2.39898C10.4656 1.93014 9.82971 1.66675 9.16667 1.66675L5.83333 9.16675V18.3334H15.2333C15.6353 18.338 16.0249 18.1961 16.3284 17.9349C16.6319 17.6737 16.8284 17.3111 16.8817 16.9126L17.8567 9.41258C17.8891 9.16961 17.8677 8.92274 17.7939 8.68857C17.7201 8.4544 17.5958 8.23841 17.4294 8.05561C17.263 7.87282 17.0586 7.72773 16.8307 7.63059C16.6029 7.53345 16.357 7.48658 16.1092 7.49341H11.6667Z" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 激活态 -->
            <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5.83333 18.3334H3.33333C2.89131 18.3334 2.46738 18.1578 2.15482 17.8453C1.84226 17.5327 1.66667 17.1088 1.66667 16.6667V10.8334C1.66667 10.3914 1.84226 9.96746 2.15482 9.6549C2.46738 9.34234 2.89131 9.16675 3.33333 9.16675H5.83333M11.6667 7.50008V4.16675C11.6667 3.50371 11.4033 2.86782 10.9345 2.39898C10.4656 1.93014 9.82971 1.66675 9.16667 1.66675L5.83333 9.16675V18.3334H15.2333C15.6353 18.338 16.0249 18.1961 16.3284 17.9349C16.6319 17.6737 16.8284 17.3111 16.8817 16.9126L17.8567 9.41258C17.8891 9.16961 17.8677 8.92274 17.7939 8.68857C17.7201 8.4544 17.5958 8.23841 17.4294 8.05561C17.263 7.87282 17.0586 7.72773 16.8307 7.63059C16.6029 7.53345 16.357 7.48658 16.1092 7.49341H11.6667Z" stroke="#4080FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="#4080FF" fill-opacity="0.1"/>
            </svg>
          </button>
          <!-- 点踩 -->
          <button
            @click="handleDislike"
            class="interaction-btn"
            :class="{ 'is-active': isDisliked }"
          >
            <span class="btn-tooltip">点踩</span>
            <!-- 非激活态 -->
            <svg v-if="!isDisliked" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M14.1667 1.66663H16.6667C17.1087 1.66663 17.5326 1.84222 17.8452 2.15478C18.1577 2.46734 18.3333 2.89127 18.3333 3.33329V9.16663C18.3333 9.60865 18.1577 10.0326 17.8452 10.3451C17.5326 10.6577 17.1087 10.8333 16.6667 10.8333H14.1667M8.33333 12.5V15.8333C8.33333 16.4963 8.59672 17.1322 9.06557 17.601C9.53441 18.0699 10.1703 18.3333 10.8333 18.3333L14.1667 10.8333V1.66663H4.76667C4.36465 1.66199 3.9751 1.80387 3.67161 2.06509C3.36812 2.3263 3.17158 2.68894 3.11833 3.08746L2.14333 10.5875C2.11092 10.8304 2.13235 11.0773 2.20614 11.3114C2.27993 11.5456 2.40418 11.7616 2.57058 11.9444C2.73699 12.1272 2.94141 12.2723 3.16926 12.3694C3.39711 12.4665 3.64304 12.5134 3.89083 12.5066H8.33333Z" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 激活态 -->
            <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M14.1667 1.66663H16.6667C17.1087 1.66663 17.5326 1.84222 17.8452 2.15478C18.1577 2.46734 18.3333 2.89127 18.3333 3.33329V9.16663C18.3333 9.60865 18.1577 10.0326 17.8452 10.3451C17.5326 10.6577 17.1087 10.8333 16.6667 10.8333H14.1667M8.33333 12.5V15.8333C8.33333 16.4963 8.59672 17.1322 9.06557 17.601C9.53441 18.0699 10.1703 18.3333 10.8333 18.3333L14.1667 10.8333V1.66663H4.76667C4.36465 1.66199 3.9751 1.80387 3.67161 2.06509C3.36812 2.3263 3.17158 2.68894 3.11833 3.08746L2.14333 10.5875C2.11092 10.8304 2.13235 11.0773 2.20614 11.3114C2.27993 11.5456 2.40418 11.7616 2.57058 11.9444C2.73699 12.1272 2.94141 12.2723 3.16926 12.3694C3.39711 12.4665 3.64304 12.5134 3.89083 12.5066H8.33333Z" stroke="#4080FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="#4080FF" fill-opacity="0.1"/>
            </svg>
          </button>
          <!-- 复制 -->
          <button
            @click="handleCopy"
            class="interaction-btn"
          >
            <span class="btn-tooltip">复制</span>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M16.6667 7.5H9.16667C8.24619 7.5 7.5 8.24619 7.5 9.16667V16.6667C7.5 17.5871 8.24619 18.3333 9.16667 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V9.16667C18.3333 8.24619 17.5871 7.5 16.6667 7.5Z" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.16667 12.5H3.33333C2.89131 12.5 2.46738 12.3244 2.15482 12.0118C1.84226 11.6993 1.66667 11.2754 1.66667 10.8333V3.33333C1.66667 2.89131 1.84226 2.46738 2.15482 2.15482C2.46738 1.84226 2.89131 1.66667 3.33333 1.66667H10.8333C11.2754 1.66667 11.6993 1.84226 12.0118 2.15482C12.3244 2.46738 12.5 2.89131 12.5 3.33333V4.16667" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <!-- 下载 -->
          <button
            @click="handleDownload"
            class="interaction-btn"
          >
            <span class="btn-tooltip">下载</span>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5.83333 8.33337L10 12.5L14.1667 8.33337" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 12.5V2.5" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

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
  (e: 'show-toast', message: string): void  // Toast 提示事件
}>()

// 状态
const citationsExpanded = ref(true)
const isTyping = ref(false) // 是否正在打字
const displayedContent = ref('') // 当前显示的内容
const typingIndex = ref(0) // 当前打字位置
const typingTimer = ref<number | null>(null) // 打字定时器
const hasStartedTyping = ref(false) // 是否已开始打字
const isThinkingCollapsed = ref(false) // 思考面板是否已收起

// 互动状态
const isLiked = ref(false) // 是否点赞
const isDisliked = ref(false) // 是否点踩

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

// 互动功能方法
function handleLike() {
  if (isLiked.value) {
    // 取消点赞
    isLiked.value = false
  } else {
    // 点赞，同时取消点踩
    isLiked.value = true
    isDisliked.value = false
    emit('show-toast', '感谢您的点赞支持')
  }
}

function handleDislike() {
  if (isDisliked.value) {
    // 取消点踩
    isDisliked.value = false
  } else {
    // 点踩，同时取消点赞
    isDisliked.value = true
    isLiked.value = false
    emit('show-toast', '您的反馈已收到，论届会再接再厉')
  }
}

async function handleCopy() {
  try {
    // 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.content)
    } else {
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea')
      textArea.value = props.content
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    emit('show-toast', '回答复制成功')
  } catch (err) {
    console.error('复制失败:', err)
    emit('show-toast', '复制失败，请重试')
  }
}

function handleDownload() {
  try {
    // 创建 Markdown 文件内容
    const content = props.content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `对话内容_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 释放 URL 对象
    URL.revokeObjectURL(url)

    // 注意：由于浏览器安全限制，无法监听系统下载对话框的用户操作结果
    // 因此不显示下载成功提示，避免误导用户
  } catch (err) {
    console.error('下载失败:', err)
    // 仅在发生异常时显示错误提示
    emit('show-toast', '下载失败，请重试')
  }
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

/* 互动功能图标区域 - Figma: gap 15px, 与文字左对齐 */
.interaction-icons {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 0px;
}

/* 互动按钮基础样式 - Figma: 20x20 图标 */
.interaction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  position: relative;
}

.interaction-btn:hover {
  transform: scale(1.1);
}

/* 按钮提示文本样式 */
.btn-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 100;
}

/* 提示文本小三角 */
.btn-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
}

/* 悬停时显示提示 */
.interaction-btn:hover .btn-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
}

.interaction-btn:active {
  transform: scale(0.95);
}

/* 激活态样式 */
.interaction-btn.is-active svg path {
  stroke: #4080FF;
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
