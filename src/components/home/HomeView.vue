<template>
  <div class="home-view">
    <!-- 主内容区域 -->
    <div class="home-content">
      <!-- 标题区域 - Figma: Frame 1321319006 -->
      <div class="title-section">
        <!-- 主标题 - Figma: 38px, 渐变色 -->
        <div class="main-title-wrapper">
          <h1 class="main-title">对话全球证据，洞见医学未来</h1>
          <!-- Logo 装饰 - 定位在"洞见医学未来"右上方 -->
          <div class="logo-decoration">
            <svg width="35" height="34" viewBox="0 0 35 34" fill="none">
              <path d="M17.5352 0C17.8139 4.41068 19.7428 8.57067 22.9594 11.6955C26.1763 14.8204 30.4591 16.6958 35 16.9664V17.0336C30.4591 17.3042 26.1763 19.1796 22.9594 22.3045C19.7428 25.4293 17.8139 29.5893 17.5352 34H17.4648C17.1866 29.5889 15.2576 25.428 12.0406 22.3031C8.82369 19.1782 4.54089 17.3039 0 17.0336V16.9664C4.54089 16.6961 8.82369 14.8218 12.0406 11.6969C15.2576 8.57196 17.1866 4.41106 17.4648 0H17.5352Z" fill="url(#paint0_linear_logo)"/>
              <defs>
                <linearGradient id="paint0_linear_logo" x1="4.17604" y1="24.4974" x2="24.116" y2="8.49435" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#006AEB"/>
                  <stop offset="0.490519" stop-color="#9863FB"/>
                  <stop offset="0.797156" stop-color="#E14292"/>
                  <stop offset="1" stop-color="#FBB81C"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <!-- 副标题 - Figma: 14px, #000000 -->
        <p class="sub-title">24小时为您更新：3800万篇 PubMed 文献、4万篇国内外指南、2万+药品说明、50万+临床试验</p>
      </div>

      <!-- 搜索框区域 - Figma: Group 1321318526 -->
      <div class="search-section">
        <SearchInput
          v-model="searchQuery"
          :deep-thinking-enabled="deepThinkingEnabled"
          @submit="handleSearch"
          @toggle-deep-thinking="toggleDeepThinking"
          @close-deep-thinking="closeDeepThinking"
        />
      </div>

      <!-- 推荐问题区域 - Figma: Frame 1321318918 -->
      <div class="suggestions-section">
        <div class="suggestions-header">
          <!-- 标题 - Figma: 16px, font-weight 600, #000000 -->
          <span class="suggestions-title">推荐医学问题</span>
          <button @click="refreshSuggestions" class="refresh-btn" :class="{ 'is-refreshing': isRefreshing }">
            <!-- 刷新图标 - Figma: 16x16, stroke #1D5CFF -->
            <svg class="refresh-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2.6665V7.99984" stroke="#1D5CFF" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 8V13.3333" stroke="#1D5CFF" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 8C14 4.6863 11.3137 2 8 2C6.30483 2 4.77387 2.70299 3.6827 3.83333M2 8C2 11.3137 4.6863 14 8 14C9.61853 14 11.0874 13.3591 12.1667 12.3173" stroke="#1D5CFF" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 文字 - Figma: 14px, #1D5CFF -->
            <span>换一换</span>
          </button>
        </div>
        <!-- 卡片网格 - Figma: 3列, gap 10px -->
        <TransitionGroup name="card-list" tag="div" class="suggestions-grid">
          <SuggestionCard
            v-for="(item, index) in suggestedQuestions"
            :key="item.id"
            :question="item.question"
            :category="item.category"
            :category-label="item.categoryLabel"
            :variant="getCardVariant(index)"
            @click="handleSuggestionClick"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores'
import SearchInput from '@/components/common/SearchInput.vue'
import SuggestionCard from '@/components/home/SuggestionCard.vue'

// Emits
const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

// Store
const chatStore = useChatStore()
const { suggestedQuestions, deepThinkingEnabled } = storeToRefs(chatStore)

// 状态
const searchQuery = ref('')
const isRefreshing = ref(false)

// 方法
function handleSearch(query: string) {
  emit('search', query)
}

function handleSuggestionClick(question: string) {
  emit('search', question)
}

function toggleDeepThinking() {
  chatStore.toggleDeepThinking()
}

function closeDeepThinking() {
  chatStore.setDeepThinking(false)
}

function refreshSuggestions() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  chatStore.refreshSuggestedQuestions()
  // 动画结束后重置状态
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// 根据索引返回卡片变体 - 对应Figma三种渐变
function getCardVariant(index: number): 'blue' | 'purple' | 'orange' {
  const variants = ['blue', 'purple', 'orange'] as const
  return variants[index % 3] ?? 'blue'
}
</script>

<style scoped>
/* 主容器 - 居中布局 */
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 40px 24px;
  background: transparent;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 770px;
}

/* 标题区域 - Figma: Frame 1321319006 */
.title-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

/* 主标题包装器 - 用于定位 logo */
.main-title-wrapper {
  position: relative;
  display: inline-block;
}

.logo-decoration {
  position: absolute;
  top: -10px;
  right: -40px;
}

/* 主标题 - Figma: 38px, 渐变色 linear-gradient(90deg, #006AEB 0%, #9863FB 49%, #E14292 90%, #FBB81C 100%) */
.main-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 38px;
  line-height: 1.4;
  text-align: center;
  background: linear-gradient(90deg, #006AEB 0%, #9863FB 49%, #E14292 90%, #FBB81C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* 副标题 - Figma: 14px, #000000 */
.sub-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  color: #000000;
  margin: 0;
}

/* 搜索框区域 */
.search-section {
  width: 100%;
}

/* 推荐问题区域 - Figma: Frame 1321318918 */
.suggestions-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* 标题行 - Figma: Frame 1321318917 */
.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  white-space: nowrap;
}

/* 标题文字 - Figma: 15px, font-weight 600, #000000 */
.suggestions-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.4;
  color: #000000;
}

/* 换一换按钮 - Figma: Frame 1321318916, gap 4px */
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1D5CFF;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: opacity 0.2s;
}

.refresh-btn:hover {
  opacity: 0.8;
}

.refresh-icon {
  transition: transform 0.5s ease;
}

.refresh-btn.is-refreshing .refresh-icon {
  animation: spin 0.5s ease-in-out;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 卡片网格 - Figma: Frame 1321319577, gap 10px */
.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-title {
    font-size: 28px;
  }

  .sub-title {
    font-size: 12px;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .suggestions-header {
    gap: 16px;
  }
}

/* 卡片列表过渡动画 */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.card-list-move {
  transition: transform 0.3s ease;
}
</style>
