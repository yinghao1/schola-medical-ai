<template>
  <!-- 错误提示组件 - 全局错误通知 -->
  <transition name="toast">
    <div v-if="visible" :class="['error-toast', `error-toast-${type}`]">
      <div class="error-icon">
        <!-- 错误图标 -->
        <svg v-if="type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 6V10M10 14V14.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <!-- 警告图标 -->
        <svg v-else-if="type === 'warning'" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L2 17H18L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M10 8V11M10 14V14.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <!-- 信息图标 -->
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 6V6.01M10 9V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="error-message">{{ message }}</span>
      <button class="error-close" @click="close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  message: string
  type?: 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  duration: 5000
})

// Emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// 状态
const visible = ref(false)
let timer: number | null = null

// 方法
function close() {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  setTimeout(() => {
    emit('close')
  }, 300)
}

function show() {
  visible.value = true
  if (props.duration > 0) {
    timer = window.setTimeout(() => {
      close()
    }, props.duration)
  }
}

// 生命周期
onMounted(() => {
  show()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 280px;
  max-width: 400px;
}

.error-toast-error {
  border-left: 4px solid #F53F3F;
  color: #F53F3F;
}

.error-toast-warning {
  border-left: 4px solid #FF7D00;
  color: #FF7D00;
}

.error-toast-info {
  border-left: 4px solid #4080FF;
  color: #4080FF;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #1D2129;
}

.error-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #86909C;
  transition: all 0.2s;
}

.error-close:hover {
  background-color: #F2F3F5;
  color: #4E5969;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
