<template>
  <!-- 对话页顶部导航栏 - 液态玻璃效果 -->
  <header class="chat-top-bar">
    <div class="top-bar-content">
      <!-- 新对话按钮 - 图标+文字整体可点击 -->
      <button @click="handleBack" class="new-chat-btn">
        <!-- 新建图标 18x18 -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17 10.7222C17 13.2075 14.9853 15.2222 12.5 15.2222H10.9048L9.06124 17L7.21772 15.2222H5.5C3.01472 15.2222 1 13.2075 1 10.7222V6.5C1 4.01472 3.01472 2 5.5 2H12.5C14.9853 2 17 4.01472 17 6.5V10.7222Z" stroke="black" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 6.27441V10.7744" stroke="black" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.75 8.52441H11.25" stroke="black" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>新对话</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
// Emits
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'new-conversation'): void
}>()

// 方法
function handleBack() {
  emit('back')
}
</script>

<style scoped>
/* 顶部导航栏 - 苹果液态玻璃效果 */
.chat-top-bar {
  height: 50px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 0 24px;
  max-width: 100%;
}

/* 新对话按钮 - 图标+文字整体 */
.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-chat-btn:hover {
  background-color: rgba(243, 245, 246, 0.8);
}

.new-chat-btn span {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  color: #000000;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .top-bar-content {
    padding: 0 16px;
  }
}
</style>
