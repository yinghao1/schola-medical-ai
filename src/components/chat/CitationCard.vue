<template>
  <!-- 引用卡片 - Figma: Group 21/22 -->
  <div class="citation-card" @click="handleClick">
    <div class="citation-main">
      <!-- 左侧类型徽章 - Figma: Frame 1321319550, bg #4080FF, border-radius 4px -->
      <div class="citation-badge">
        <span class="citation-type">{{ typeLabel }}</span>
      </div>
      <!-- 右侧内容 - Figma: Frame 1321319548 -->
      <div class="citation-content">
        <!-- 标题 - Figma: Frame 1321319551 -->
        <div class="citation-title-wrapper">
          <!-- 标题 - Figma: style_IDTF6X, 14px, font-weight 400, #000000, line-height 1.6 -->
          <h4 class="citation-title">{{ title }}</h4>
        </div>
        <!-- 日期 - Figma: Frame 1321319549 -->
        <div v-if="date" class="citation-meta">
          <!-- 日期 - Figma: style_9J33YT, 12px, font-weight 400, #86909C, line-height 1.6 -->
          <span class="citation-date">{{ date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  type: 'article' | 'guideline' | 'book' | 'other'
  title: string
  authors?: string[]
  journal?: string
  year?: number
  date?: string
  url?: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'click'): void
}>()

// 计算属性
const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    article: '文献',
    guideline: '指南',
    book: '书籍',
    other: '其他'
  }
  return labels[props.type] || '文献'
})

// 方法
function handleClick() {
  if (props.url) {
    window.open(props.url, '_blank')
  }
  emit('click')
}
</script>

<style scoped>
/* 引用卡片 - Figma: Group 21/22 */
.citation-card {
  cursor: pointer;
  transition: opacity 0.2s;
  padding-bottom: 10px;
  border-bottom: 1px solid #EFEFEF;
}

.citation-card:hover {
  opacity: 0.8;
}

.citation-card:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.citation-main {
  display: flex;
  gap: 8px;
}

/* 类型徽章 - Figma: Frame 1321319550, bg #4080FF, border-radius 4px, padding 2px 5px */
.citation-badge {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px 5px;
  background-color: #4080FF;
  border-radius: 4px;
  flex-shrink: 0;
  height: fit-content;
  margin-top: 2px;
}

/* 类型文字 - Figma: style_PH8XBS, 10px, font-weight 500, #FFFFFF */
.citation-type {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 10px;
  line-height: 1.4;
  color: #FFFFFF;
}

/* 内容区域 - Figma: Frame 1321319548, gap 5px */
.citation-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

/* 标题包装 - Figma: Frame 1321319551, gap 5px */
.citation-title-wrapper {
  display: flex;
  gap: 5px;
}

/* 标题 - Figma: style_IDTF6X, 14px, font-weight 400, #000000, line-height 1.6 */
.citation-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  color: #000000;
  margin: 0;
}

/* 元信息 */
.citation-meta {
  display: flex;
  flex-direction: column;
}

/* 日期 - Figma: style_9J33YT, 12px, font-weight 400, #86909C, line-height 1.6 */
.citation-date {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.6;
  color: #86909C;
}
</style>
