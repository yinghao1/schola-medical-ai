<template>
  <!-- 推荐卡片 - Figma: Frame 1321318424/25/26, border-radius 16px, padding 15px -->
  <div
    @click="handleClick"
    :class="[
      'suggestion-card',
      `suggestion-card-${variant}`
    ]"
  >
    <!-- 内容区域 - Figma: Frame 1321318430, gap 5px -->
    <div class="card-content">
      <!-- 问题文本 - Figma: 13px, font-weight 400, #000000 -->
      <p class="card-question">{{ question }}</p>
    </div>
    <!-- 底部区域 - Figma: Frame 1321319574, justify-content space-between -->
    <div class="card-footer">
      <!-- 分类标签 - Figma: Frame 1321319575, padding 4px 6px, border-radius 6px, bg #FFFFFF -->
      <div class="card-category-badge">
        <span class="card-category">{{ categoryLabel }}</span>
      </div>
      <!-- 箭头按钮 - Figma: Frame 1321319576, 24x24, border-radius 26.67px -->
      <div class="card-arrow-btn">
        <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
          <path d="M0.5 0.5L3.5 4L0.5 7.5" stroke="#2A2A2A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  question: string
  category: string
  categoryLabel: string
  variant?: 'blue' | 'purple' | 'orange'
  highlight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue',
  highlight: false
})

// Emits
const emit = defineEmits<{
  (e: 'click', question: string): void
}>()

// 方法
function handleClick() {
  emit('click', props.question)
}
</script>

<style scoped>
/* 卡片基础样式 - Figma: border-radius 16px, padding 15px, gap 20px */
.suggestion-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  padding: 15px;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 120px;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
}

/* 蓝色变体 - Figma: fill_XFPWVT linear-gradient(0deg, #F8FBFF 0%, #E8F3FF 100%) */
.suggestion-card-blue {
  background: linear-gradient(0deg, #F8FBFF 0%, #E8F3FF 100%);
}

/* 紫色变体 - Figma: fill_SZSS62 linear-gradient(0deg, #FBF7FF 0%, #F2EBFF 100%) */
.suggestion-card-purple {
  background: linear-gradient(0deg, #FBF7FF 0%, #F2EBFF 100%);
}

/* 橙色变体 - Figma: fill_BQKU2P linear-gradient(0deg, #FFFAF4 0%, #FFF3E2 100%) */
.suggestion-card-orange {
  background: linear-gradient(0deg, #FFFAF4 0%, #FFF3E2 100%);
}

/* 内容区域 - Figma: Frame 1321318430, gap 5px */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

/* 问题文本 - Figma: style_W112RA, 14px, font-weight 400, #000000, line-height 1.4 */
.card-question {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #000000;
  margin: 0;
  /* 限制2-3行显示 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 底部区域 - Figma: Frame 1321319574, gap 13px, justify-content space-between */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
}

/* 分类徽章 - Figma: Frame 1321319575, padding 4px 6px, border-radius 6px, bg #FFFFFF, height 24px */
.card-category-badge {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
  height: 24px;
  background-color: #FFFFFF;
  border-radius: 6px;
}

/* 分类文字 - Figma: style_1ZOFCG, 11px, font-weight 400, #000000 */
.card-category {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 1.4;
  color: #000000;
}

/* 箭头按钮 - Figma: Frame 1321319576, 24x24, border-radius 26.67px, bg #FFFFFF */
.card-arrow-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-color: #FFFFFF;
  border-radius: 26.67px;
  transition: transform 0.2s ease;
}

.suggestion-card:hover .card-arrow-btn {
  transform: translateX(2px);
}
</style>
