<template>
  <!-- 思考面板 - Figma: Frame 1321319542, border-radius 14px, border #EFEFEF, bg rgba(255,255,255,0.6) -->
  <!-- 思考完成后保持折叠状态显示，不隐藏 -->
  <div
    :class="['thinking-panel-wrapper', { 'is-thinking': isThinkingActive }]"
  >
    <!-- 外发光层 - 仅在思考中显示 -->
    <div v-if="isThinkingActive" class="glow-layer" />
    <div
      class="thinking-panel"
      @click="toggleExpanded"
    >
    <!-- 头部 - Figma: Frame 1321319533, gap 10px -->
    <div class="thinking-header">
      <div class="thinking-header-left">
        <!-- 标题 - Figma: style_DSMU4H, 15px, font-weight 400, #000000 -->
        <span class="thinking-title">{{ isThinkingActive ? '思考中...' : '思考完成' }}</span>
      </div>
      <svg
        :class="['expand-icon', { 'rotate-180': !expanded }]"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M4 10L8 6L12 10" stroke="#86909C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <transition name="collapse" @after-leave="onCollapseComplete">
      <!-- 内容区域 - Figma: Frame 1321319537 -->
      <div v-show="expanded" class="thinking-content">
        <div class="thinking-steps">
          <transition-group name="step-fade">
            <div
              v-for="(step, index) in visibleSteps"
              :key="step.id"
              class="thinking-step"
            >
              <!-- 步骤指示器 -->
              <div class="step-indicator">
                <!-- 加载中 SVG 动画图标 -->
                <div v-if="!isStepCompleted(index)" class="step-icon loading-icon">
                  <svg class="loading-spinner" width="20" height="20" viewBox="0 0 35 34" fill="none">
                    <defs>
                      <linearGradient id="loadingGradient" x1="4.17604" y1="24.4974" x2="24.116" y2="8.49435" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#006AEB"/>
                        <stop offset="0.490519" stop-color="#9863FB"/>
                        <stop offset="0.797156" stop-color="#E14292"/>
                        <stop offset="1" stop-color="#FBB81C"/>
                      </linearGradient>
                    </defs>
                    <path d="M17.5352 0C17.8139 4.41068 19.7428 8.57067 22.9594 11.6955C26.1763 14.8204 30.4591 16.6958 35 16.9664V17.0336C30.4591 17.3042 26.1763 19.1796 22.9594 22.3045C19.7428 25.4293 17.8139 29.5893 17.5352 34H17.4648C17.1866 29.5889 15.2576 25.428 12.0406 22.3031C8.82369 19.1782 4.54089 17.3039 0 17.0336V16.9664C4.54089 16.6961 8.82369 14.8218 12.0406 11.6969C15.2576 8.57196 17.1866 4.41106 17.4648 0H17.5352Z" fill="url(#loadingGradient)"/>
                  </svg>
                </div>
                <!-- 步骤1 - 灯泡图标 01.svg -->
                <div v-else-if="index === 0" class="step-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.49878 18.026H12.1442M12.6154 14.2066C12.8404 13.2493 13.4735 12.4414 14.0654 11.6435C14.6746 10.824 15.0015 9.84008 15 8.83108C15 6.16284 12.7615 4 10 4C7.23846 4 5 6.16284 5 8.83108C5 9.88017 5.34615 10.8516 5.93461 11.6435C6.52654 12.4414 7.15961 13.2489 7.38461 14.2066L7.3984 14.2655C7.53068 14.8309 8.03488 15.2308 8.61554 15.2308H11.3844C11.9649 15.2308 12.469 14.8311 12.6015 14.266L12.6154 14.2066Z" stroke="#2C69F0" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M10.0048 1.57151V1.18115M18.6189 9.3787H18.2023M1.80725 9.3787H1.29688M16.1106 3.27104L15.8005 3.58121M4.20913 3.58212L3.89804 3.27104" stroke="#2C69F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <!-- 步骤2 - 搜索图标 02.svg -->
                <div v-else-if="index === 1" class="step-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9.58333 16.6667C13.4953 16.6667 16.6667 13.4953 16.6667 9.58333C16.6667 5.67133 13.4953 2.5 9.58333 2.5C5.67133 2.5 2.5 5.67133 2.5 9.58333C2.5 13.4953 5.67133 16.6667 9.58333 16.6667Z" stroke="#9B62F7" stroke-width="1.5" stroke-linejoin="round"/>
                    <path d="M11.9406 6.80979C11.3374 6.20658 10.5041 5.8335 9.58356 5.8335C8.6631 5.8335 7.82977 6.20658 7.22656 6.80979" stroke="#9B62F7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.6758 14.6758L17.7092 17.7092" stroke="#9B62F7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <!-- 步骤3 - 深度思考图标 03.svg -->
                <div v-else class="step-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.36074 5.47304C7.67115 5.19885 8.14509 5.22813 8.41933 5.53847C8.69329 5.84892 8.66425 6.32293 8.3539 6.59707C8.04871 6.86667 7.74562 7.151 7.44667 7.44863C5.62153 9.28243 4.32725 11.2512 3.69374 12.9252C3.37665 13.7633 3.23789 14.4948 3.25624 15.0795C3.27225 15.5856 3.40277 15.9488 3.60488 16.2006L3.69667 16.3021L3.69863 16.3051C4.18555 16.7941 5.24034 16.9595 6.89296 16.3744C7.28342 16.2362 7.71174 16.441 7.84999 16.8314C7.98772 17.2216 7.78402 17.6502 7.39394 17.7885C5.62851 18.4135 3.77747 18.5104 2.63515 17.3627V17.3617C2.04131 16.7687 1.7829 15.9721 1.75624 15.1264C1.72982 14.2846 1.92869 13.3511 2.29042 12.3949C3.01496 10.4802 4.44604 8.33681 6.38613 6.38808L6.38808 6.38613C6.7081 6.06752 7.03308 5.76249 7.36074 5.47304ZM5.53847 11.5814C5.84892 11.3073 6.32286 11.3364 6.59706 11.6469C6.86592 11.9512 7.14897 12.254 7.4457 12.5521C9.28007 14.3784 11.2505 15.6733 12.9252 16.307C13.7634 16.6242 14.4948 16.7639 15.0795 16.7455C15.6583 16.7273 16.0498 16.5584 16.3021 16.3051L16.3051 16.3021C16.7941 15.8153 16.9595 14.7604 16.3744 13.1078C16.2363 12.7174 16.4411 12.2891 16.8314 12.1508C17.2218 12.0128 17.6503 12.2175 17.7885 12.6078C18.4129 14.3717 18.5095 16.2193 17.3646 17.3617L17.3656 17.3627C16.7722 17.9589 15.9738 18.2179 15.1264 18.2445C14.2845 18.271 13.3512 18.0722 12.3949 17.7103C10.4803 16.9858 8.33677 15.5556 6.38808 13.6156L6.38613 13.6127C6.06748 13.2926 5.76252 12.9677 5.47304 12.64C5.19889 12.3297 5.22825 11.8557 5.53847 11.5814ZM12.6068 2.21328C14.371 1.58859 16.2201 1.49025 17.3627 2.63515C17.9588 3.22851 18.2179 4.02708 18.2445 4.87441C18.2709 5.71634 18.0722 6.6505 17.7103 7.60683C16.9857 9.52136 15.5555 11.6642 13.6156 13.6127L13.6127 13.6156C13.2926 13.9343 12.9678 14.2392 12.64 14.5287C12.3298 14.8025 11.8557 14.7731 11.5814 14.4633C11.3073 14.153 11.3368 13.679 11.6469 13.4047C11.9522 13.135 12.256 12.8499 12.5551 12.5521C14.38 10.7185 15.6735 8.74949 16.307 7.07558C16.6241 6.23774 16.7637 5.50688 16.7455 4.92226C16.7273 4.34322 16.5587 3.95094 16.3051 3.69814L16.3021 3.69619C15.8152 3.2071 14.7607 3.0406 13.1078 3.62587C12.7175 3.76391 12.2891 3.56004 12.1508 3.16982C12.0127 2.77968 12.217 2.35134 12.6068 2.21328ZM10.0072 6.9999C10.055 7.77825 10.3855 8.51291 10.9369 9.06435C11.4883 9.61559 12.2222 9.94619 13.0004 9.99404V10.0058C12.2221 10.0536 11.4883 10.3851 10.9369 10.9364C10.3856 11.4878 10.0551 12.2217 10.0072 12.9999H9.99452C9.94675 12.2217 9.61615 11.4878 9.06484 10.9364C8.51336 10.385 7.77882 10.0535 7.00038 10.0058V9.99404C7.77882 9.94633 8.51336 9.6158 9.06484 9.06435C9.6163 8.51289 9.94683 7.77831 9.99452 6.9999H10.0072ZM4.87441 1.75576C5.71637 1.72933 6.65043 1.92806 7.60683 2.28994C9.40181 2.9692 11.3974 4.26896 13.2455 6.02724L13.6127 6.38564L13.6156 6.38759C13.9343 6.70768 14.2392 7.03251 14.5287 7.36025C14.8028 7.67053 14.7733 8.14456 14.4633 8.41884C14.1528 8.69291 13.6779 8.66381 13.4037 8.35341C13.1341 8.04821 12.8498 7.74515 12.5521 7.44619V7.44521C10.7185 5.62032 8.74947 4.32667 7.07558 3.69326C6.23767 3.37623 5.50686 3.23748 4.92226 3.25576C4.34322 3.274 3.95094 3.44263 3.69863 3.69619L3.69667 3.69814C3.20758 4.18501 3.04124 5.23979 3.62636 6.89248C3.76458 7.28283 3.56056 7.71113 3.17031 7.84951C2.77993 7.98756 2.35053 7.78379 2.2123 7.39345C1.58719 5.62794 1.49029 3.77699 2.63808 2.63466C3.2311 2.04041 4.02839 1.78245 4.87441 1.75576Z" fill="#FB991C"/>
                  </svg>
                </div>

                <!-- 连接线 - Figma: Frame 1321319541, 20x14, stroke #C9CDD4 -->
                <div v-if="index < visibleSteps.length - 1" class="step-connector">
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                    <path d="M10 0V14" stroke="#C9CDD4" stroke-width="1" />
                  </svg>
                </div>
              </div>
              <!-- 步骤内容 -->
              <div class="step-content">
                <!-- 步骤标签 - Figma: style_YYWNL8, 14px, font-weight 400, #4E5969 -->
                <span class="step-label">
                  {{ step.label }}
                  <span v-if="step.result && isStepCompleted(index)" class="step-result">{{ step.result }}</span>
                </span>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { ThinkingStep } from '@/types'

// Props
interface Props {
  steps: ThinkingStep[]
  isThinking?: boolean
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isThinking: false,
  defaultExpanded: true
})

// Emits
const emit = defineEmits<{
  (e: 'collapse-complete'): void
}>()

// 状态
const expanded = ref(props.defaultExpanded)
const currentVisibleCount = ref(0) // 当前显示的步骤数量
const completedStepIndices = ref<Set<number>>(new Set()) // 已完成的步骤索引
const timers = ref<number[]>([]) // 定时器引用

// 计算属性 - 当前可见的步骤
const visibleSteps = computed(() => {
  return props.steps.slice(0, currentVisibleCount.value)
})

// 计算属性 - 是否正在思考（仅用于外发光效果）
const isThinkingActive = computed(() => {
  // 当 props.isThinking 为 true，或者步骤动画还未完成时显示外发光
  return props.isThinking && (currentVisibleCount.value < props.steps.length || completedStepIndices.value.size < props.steps.length)
})

// 检查步骤是否已完成（显示静态图标）
function isStepCompleted(index: number): boolean {
  return completedStepIndices.value.has(index)
}

// 收起完成回调
function onCollapseComplete() {
  // 思考完成后折叠面板，但保持显示
  // 触发事件通知父组件可以开始显示内容
  // 只要面板收起就触发，让父组件决定何时显示内容
  emit('collapse-complete')
}

// 开始动态显示流程
function startThinkingAnimation() {
  // 重置状态
  currentVisibleCount.value = 0
  completedStepIndices.value.clear()
  expanded.value = true

  // 清除之前的定时器
  timers.value.forEach(timer => clearTimeout(timer))
  timers.value = []

  if (props.steps.length === 0) return

  // 逐步显示每一行
  props.steps.forEach((_, index) => {
    // 显示当前行
    const showTimer = setTimeout(() => {
      currentVisibleCount.value = index + 1
    }, index * 3000)
    timers.value.push(showTimer)

    // 3秒后将当前行标记为完成（切换为静态图标）
    const completeTimer = setTimeout(() => {
      completedStepIndices.value.add(index)
    }, (index + 1) * 3000)
    timers.value.push(completeTimer)
  })

  // 所有步骤完成后自动收起
  const collapseTimer = setTimeout(() => {
    expanded.value = false
  }, props.steps.length * 3000 + 500)
  timers.value.push(collapseTimer)
}

// 方法
function toggleExpanded() {
  expanded.value = !expanded.value
}

// 监听 isThinking 变化，开始动画
watch(() => props.isThinking, (newVal) => {
  if (newVal) {
    startThinkingAnimation()
  }
}, { immediate: true })

// 组件卸载时清除定时器
onUnmounted(() => {
  timers.value.forEach(timer => clearTimeout(timer))
})
</script>

<style scoped>
/* 思考面板包装器 - 用于定位外发光层 */
.thinking-panel-wrapper {
  position: relative;
  isolation: isolate; /* 创建新的层叠上下文 */
}

/* 外发光层 - Figma: Rectangle 11113948, blur 8px, 渐变色 */
.glow-layer {
  position: absolute;
  /* 向外扩展以显示完整的模糊效果 */
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 20px;
  background: linear-gradient(51deg, rgba(0, 106, 235, 1) 0%, rgba(152, 99, 251, 1) 48%, rgba(225, 66, 146, 1) 88%, rgba(251, 153, 28, 1) 98%);
  filter: blur(8px);
  z-index: -1;
  animation: glowBreathing 3s ease-in-out infinite;
  pointer-events: none;
}

/* 呼吸动效 - 透明度 0% → 30%，周期 3 秒，无限循环 */
@keyframes glowBreathing {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
}

/* 思考面板主容器 - Figma: Frame 1321319542, border-radius 14px, border #EFEFEF, bg #FFFFFF */
.thinking-panel {
  background: #FFFFFF;
  border: 1px solid #EFEFEF;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
}

.thinking-panel:hover {
  background-color: #FBFBFB;
}

/* 头部 - Figma: Frame 1321319533, gap 10px, padding 15px */
.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 15px;
  text-align: left;
}

.thinking-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.thinking-indicator svg {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 标题 - Figma: style_DSMU4H, 15px, font-weight 400, #000000 */
.thinking-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.4;
  color: #000000;
}

.expand-icon {
  transition: transform 0.2s ease;
}

.expand-icon.rotate-180 {
  transform: rotate(180deg);
}

/* 内容区域 - Figma: Frame 1321319537 */
.thinking-content {
  padding: 0 15px 0 15px;
}

.thinking-steps {
  display: flex;
  flex-direction: column;
}

/* 步骤项 - Figma: Frame 1321319534/35/36, gap 10px */
.thinking-step {
  display: flex;
  gap: 10px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

/* 连接线 */
.step-connector {
  display: flex;
  justify-content: center;
  width: 20px;
  height: 14px;
}

/* 步骤内容 */
.step-content {
  display: flex;
  flex-direction: column;
  padding-bottom: 14px;
}

/* 步骤标签 - Figma: style_YYWNL8, 14px, font-weight 400, #4E5969 */
.step-label {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #4E5969;
}

/* 步骤结果 - 高亮显示 */
.step-result {
  color: #9B62F7;
  font-weight: 500;
  margin-left: 4px;
}

/* 步骤淡入动画 */
.step-fade-enter-active {
  transition: all 0.3s ease;
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.step-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* 加载图标 */
.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 300px;
}
</style>
