<template>
  <div
    class="floating-news-card"
    :style="cardStyle"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @click="handleClick"
  >
    <!-- 背景装饰图 - Figma: Mask group -->
    <div class="card-bg">
      <img src="@/assets/images/news-card-bg.png" alt="" />
    </div>

    <!-- 内容区域 - Figma: Frame 1321319606 -->
    <div class="card-content">
      <!-- 标题行 - Figma: Frame 1321319607 -->
      <div class="title-row">
        <!-- 最新文献 - Figma: 14px, 500, #000000 -->
        <span class="title-text">最新文献 </span>
        <!-- 数字 - Figma: 16px, 700, 渐变色 -->
        <span class="title-number">{{ newsCount }}</span>
      </div>
      <!-- 副标题 - Figma: 12px, 400, #86909C -->
      <div class="subtitle">每天获取最新文献</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  newsCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  newsCount: 46
})

// Emits
const emit = defineEmits<{
  (e: 'click'): void
}>()

// Refs — 不再需要 cardRef（模板也已移除）

// 位置状态 - 初始定位：右边距20px，上边距20px
const position = ref({
  x: typeof window !== 'undefined' ? window.innerWidth - 120 - 20 : 0,
  y: 20
})

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false) // 用于区分点击和拖动
const hasBeenDragged = ref(false) // 是否被拖动过（用于窗口调整时的位置策略）

// 计算样式
const cardStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  cursor: isDragging.value ? 'grabbing' : 'pointer'
}))

// 开始拖动
function startDrag(event: MouseEvent | TouchEvent) {
  isDragging.value = true
  hasMoved.value = false

  const touch = 'touches' in event ? event.touches[0] : undefined
  const clientX = touch ? touch.clientX : (event as MouseEvent).clientX
  const clientY = touch ? touch.clientY : (event as MouseEvent).clientY

  dragStart.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }

  // 添加全局事件监听
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

// 拖动中
function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return

  event.preventDefault()
  hasMoved.value = true
  hasBeenDragged.value = true // 标记已被拖动

  const touch = 'touches' in event ? event.touches[0] : undefined
  const clientX = touch ? touch.clientX : (event as MouseEvent).clientX
  const clientY = touch ? touch.clientY : (event as MouseEvent).clientY

  // 计算新位置
  let newX = clientX - dragStart.value.x
  let newY = clientY - dragStart.value.y

  // 边界限制
  const cardWidth = 120
  const cardHeight = 120
  const maxX = window.innerWidth - cardWidth
  const maxY = window.innerHeight - cardHeight

  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))

  position.value = { x: newX, y: newY }
}

// 停止拖动
function stopDrag() {
  isDragging.value = false

  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 点击处理 - 只有在没有拖动时才触发
function handleClick() {
  if (!hasMoved.value) {
    emit('click')
  }
}

// 窗口大小变化时更新位置
function handleResize() {
  const cardWidth = 120
  const cardHeight = 120

  // 如果未被拖动过，保持初始的右上角位置
  if (!hasBeenDragged.value) {
    position.value = {
      x: window.innerWidth - cardWidth - 20,
      y: 20
    }
    return
  }

  // 如果被拖动过，只做边界限制
  const maxX = window.innerWidth - cardWidth
  const maxY = window.innerHeight - cardHeight

  position.value = {
    x: Math.max(0, Math.min(position.value.x, maxX)),
    y: Math.max(0, Math.min(position.value.y, maxY))
  }
}

// 生命周期
onMounted(() => {
  // 初始化位置
  position.value = {
    x: window.innerWidth - 120 - 20,
    y: 20
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 清理可能的残留事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
/* 浮动卡片容器 - Figma: Frame 1321319606, 120x120, padding 8px, gap 8px */
.floating-news-card {
  position: fixed;
  width: 120px;
  height: 120px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #FFFFFF;
  border: 0.5px solid #E5E6EB;
  border-radius: 8px;
  box-shadow: 0px 5px 10px 0px rgba(41, 14, 0, 0.05);
  box-sizing: border-box;
  user-select: none;
  z-index: 9999;
  transition: box-shadow 0.2s ease;
  overflow: hidden;
}

.floating-news-card:hover {
  box-shadow: 0px 8px 20px 0px rgba(41, 14, 0, 0.1);
}

.floating-news-card:active {
  /* cursor controlled by cardStyle computed */
}

/* 背景装饰图 - Figma: Mask group, 104x57, fill模式 */
.card-bg {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 104px;
  height: 57px;
  pointer-events: none;
  z-index: 0;
  border-radius: 4px;
  overflow: hidden;
}

.card-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 内容区域 - Figma: Frame 1321319606 (内部), align-self: stretch, gap 2px */
.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-self: stretch;
  gap: 2px;
  z-index: 1;
  margin-top: auto;
}

/* 标题行 - Figma: Frame 1321319607, row, center, gap 2px */
.title-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  gap: 2px;
}

/* 最新文献文字 - Figma: 14px, 500, #000000, line-height 1.4 */
.title-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  color: #000000;
}

/* 数字 - Figma: D-DIN Exp, 16px, 700, 渐变色 linear-gradient(90deg, #006AEB 12%, #9863FB 88%) */
.title-number {
  font-family: 'D-DIN Exp', 'DIN Alternate', 'DIN', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.086;
  text-align: center;
  background: linear-gradient(90deg, #006AEB 12%, #9863FB 88%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 副标题 - Figma: 12px, 400, #86909C, line-height 1.4, align-self stretch */
.subtitle {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  color: #86909C;
  align-self: stretch;
}
</style>
