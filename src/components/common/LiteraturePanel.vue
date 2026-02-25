<template>
  <transition name="slide-panel">
    <div v-if="pubmedStore.isPanelOpen" class="literature-panel">
      <!-- 标题栏 - Figma: Title, padding 12px 20px -->
      <div class="panel-header">
        <div class="header-left">
          <span class="header-title">文献推荐</span>
          <span class="header-badge">基于您的兴趣领域</span>
        </div>
        <button class="close-btn" @click="pubmedStore.closePanel" aria-label="关闭">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M3 13L13 3" stroke="#333333" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 标签区域 - Figma: Frame 1321319623, column, gap 6px -->
      <div class="tags-section">
        <div class="tags-row">
          <div class="tags-wrap">
            <button
              v-for="tag in pubmedStore.tags"
              :key="tag.id"
              class="tag-btn"
              :class="{ 'tag-active': pubmedStore.activeTagId === tag.id }"
              @click="pubmedStore.setActiveTag(tag.id)"
            >
              {{ tag.label }}
            </button>
          </div>
          <!-- 标签管理按钮 - Figma: Container 23x23 -->
          <button class="tag-manage-btn" @click="showTagManager = !showTagManager" aria-label="管理标签">
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
              <path d="M0 4.6C0 2.05949 2.05949 0 4.6 0H18.4C20.9405 0 23 2.05949 23 4.6V18.4C23 20.9405 20.9405 23 18.4 23H4.6C2.05949 23 0 20.9405 0 18.4V4.6Z" fill="#F4F5F7"/>
              <path d="M16.2695 8.68359H11.0195" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12.7695 14.5166H7.51953" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5156 16.2671C15.4821 16.2671 16.2656 15.4836 16.2656 14.5171C16.2656 13.5506 15.4821 12.7671 14.5156 12.7671C13.5491 12.7671 12.7656 13.5506 12.7656 14.5171C12.7656 15.4836 13.5491 16.2671 14.5156 16.2671Z" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.68359 10.4336C9.65009 10.4336 10.4336 9.65009 10.4336 8.68359C10.4336 7.7171 9.65009 6.93359 8.68359 6.93359C7.7171 6.93359 6.93359 7.7171 6.93359 8.68359C6.93359 9.65009 7.7171 10.4336 8.68359 10.4336Z" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- 标签管理弹出层 -->
        <transition name="fade">
          <div v-if="showTagManager" class="tag-manager">
            <div class="tag-manager-header">
              <span class="tag-manager-title">管理标签</span>
              <button class="tag-manager-close" @click="showTagManager = false">×</button>
            </div>
            <div class="tag-manager-list">
              <div v-for="tag in pubmedStore.tags" :key="tag.id" class="tag-manager-item">
                <span>{{ tag.label }}</span>
                <button
                  v-if="tag.id !== 'all'"
                  class="tag-delete-btn"
                  @click="confirmDeleteTag(tag.id, tag.label)"
                >×</button>
              </div>
            </div>
            <div class="tag-add-row">
              <input
                v-model="newTagInput"
                class="tag-add-input"
                placeholder="输入标签名称，回车添加"
                @keyup.enter="handleAddTag"
              />
              <button class="tag-add-btn" @click="handleAddTag" :disabled="!newTagInput.trim()">
                添加
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- 文献列表 - Figma: List, column, gap 16px, padding 0 20px -->
      <div class="article-list" ref="listRef">
        <!-- 骨架屏加载状态 -->
        <template v-if="pubmedStore.isLoading">
          <template v-for="n in 6" :key="'skeleton-' + n">
            <div class="skeleton-item">
              <div class="skeleton-title skeleton-shimmer"></div>
              <div class="skeleton-meta">
                <div class="skeleton-authors skeleton-shimmer"></div>
                <div class="skeleton-journal skeleton-shimmer"></div>
              </div>
            </div>
            <div v-if="n < 6" class="article-divider"></div>
          </template>
        </template>

        <!-- 错误状态 -->
        <div v-else-if="pubmedStore.error" class="error-state">
          <span>{{ pubmedStore.error }}</span>
          <button class="retry-btn" @click="pubmedStore.fetchArticles">重试</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="pubmedStore.filteredArticles.length === 0" class="empty-state">
          暂无文献数据
        </div>

        <!-- 文献条目 - Figma: 文献 + 分割线为兄弟节点 -->
        <template v-else>
          <template v-for="(article, index) in pubmedStore.filteredArticles" :key="article.pmid">
            <a
              :href="article.url"
              target="_blank"
              rel="noopener noreferrer"
              class="article-item"
            >
              <div class="article-title">{{ article.title }}</div>
              <div class="article-meta">
                <span v-if="article.authors?.length" class="article-authors">
                  {{ article.authors.join(', ') }}.
                </span>
                <span class="article-journal">
                  {{ article.journal }}{{ article.pubDate ? '. ' + article.pubDate : '' }}.
                </span>
              </div>
            </a>
            <div v-if="index < pubmedStore.filteredArticles.length - 1" class="article-divider"></div>
          </template>
        </template>
      </div>
    </div>
  </transition>

  <!-- 删除确认弹窗 -->
  <transition name="fade">
    <div v-if="deleteConfirm.show" class="confirm-overlay" @click.self="deleteConfirm.show = false">
      <div class="confirm-dialog">
        <p>确定删除标签「{{ deleteConfirm.label }}」吗？</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="deleteConfirm.show = false">取消</button>
          <button class="confirm-ok" @click="doDeleteTag">确定</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePubmedStore } from '@/stores'

const pubmedStore = usePubmedStore()

// 标签管理
const showTagManager = ref(false)
const newTagInput = ref('')

// 删除确认
const deleteConfirm = reactive({
  show: false,
  tagId: '',
  label: ''
})

function handleAddTag() {
  const value = newTagInput.value.trim()
  if (!value) return
  // 标签名即为 PubMed MeSH 查询词
  pubmedStore.addTag(value, `${value}[MeSH]`)
  newTagInput.value = ''
}

function confirmDeleteTag(tagId: string, label: string) {
  deleteConfirm.tagId = tagId
  deleteConfirm.label = label
  deleteConfirm.show = true
}

function doDeleteTag() {
  pubmedStore.removeTag(deleteConfirm.tagId)
  deleteConfirm.show = false
}
</script>

<style scoped>
/* ============================================================
   面板容器 - Figma: 文献推荐, 380x1080, column, gap 12px
   ============================================================ */
.literature-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: #FFFFFF;
  border-left: 0.5px solid #E5E6EB;
  box-shadow: 0px 5px 10px 0px rgba(41, 14, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10000;
}

/* 滑入动画 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
}

/* ============================================================
   标题栏 - Figma: Title, row, space-between, padding 12px 20px
   ============================================================ */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  flex-shrink: 0;
  background: linear-gradient(98deg, rgba(0, 106, 235, 0.08) 16.37%, rgba(152, 99, 251, 0.08) 83.76%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 标题文字 - Figma: 18px, 600, 渐变色填充 */
.header-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.4;
  background: linear-gradient(90deg, #006AEB 12%, #9863FB 88%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 徽章 - Figma: 11px, 400, #4E5969, bg #FFFFFF, padding 3px 6px, height 21px, radius 4px */
.header-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 21px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #4E5969;
  background: #FFFFFF;
  padding: 0 6px;
  border-radius: 4px;
  border: 0.5px solid #E5E6EB;
  box-sizing: border-box;
}

/* 关闭按钮 - Figma: 16x16 */
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: background-color 0.15s;
}

.close-btn:hover {
  background-color: #F2F3F5;
}

/* ============================================================
   标签区域 - Figma: column, gap 6px, padding 0 20px
   ============================================================ */
.tags-section {
  padding: 0 20px;
  flex-shrink: 0;
  position: relative;
}

.tags-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* 标签换行容器 - Figma: 多行展示，flex-wrap */
.tags-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  row-gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}

/* 标签按钮 - Figma: 11px, 400, padding 4px 8px, bg #F4F5F7, radius 4px */
.tag-btn {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #4E5969;
  background: #F4F5F7;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}

.tag-btn:hover {
  background: #E8F3FF;
  color: #165DFF;
}

/* 激活标签 - Figma: gradient 111deg, 16%/84%, 400 */
.tag-active {
  background: linear-gradient(111deg, #006AEB 16%, #9863FB 84%);
  color: #FFFFFF;
  font-weight: 400;
}

.tag-active:hover {
  background: linear-gradient(111deg, #006AEB 16%, #9863FB 84%);
  color: #FFFFFF;
}

/* 标签管理按钮 - Figma: Container 23x23 */
.tag-manage-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  border: none;
  background: #F4F5F7;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s;
}

.tag-manage-btn:hover {
  background: #E8F3FF;
}

/* 标签管理弹出层 */
.tag-manager {
  position: absolute;
  top: 40px;
  left: 20px;
  right: 20px;
  background: #FFFFFF;
  border: 0.5px solid #E5E6EB;
  border-radius: 8px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
  padding: 12px;
  z-index: 10;
}

.tag-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tag-manager-title {
  font-size: 13px;
  font-weight: 500;
  color: #1D2129;
}

.tag-manager-close {
  border: none;
  background: none;
  font-size: 16px;
  color: #86909C;
  cursor: pointer;
  padding: 0 4px;
}

.tag-manager-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag-manager-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #F7F8FA;
  border-radius: 4px;
  font-size: 12px;
  color: #4E5969;
}

.tag-delete-btn {
  border: none;
  background: none;
  color: #86909C;
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  line-height: 1;
}

.tag-delete-btn:hover {
  color: #F53F3F;
}

.tag-add-row {
  display: flex;
  gap: 6px;
  min-width: 0;
}

.tag-add-input {
  flex: 1;
  min-width: 0;
  height: 28px;
  border: 0.5px solid #E5E6EB;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  outline: none;
  color: #1D2129;
}

.tag-add-input:focus {
  border-color: #165DFF;
}

.tag-add-btn {
  height: 28px;
  padding: 0 12px;
  background: linear-gradient(90deg, #006AEB 12%, #9863FB 88%);
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================
   文献列表 - Figma: List, column, gap 16px, padding 0 20px
   ============================================================ */
.article-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: #E5E6EB transparent;
}

.article-list::-webkit-scrollbar {
  width: 4px;
}

.article-list::-webkit-scrollbar-thumb {
  background: #E5E6EB;
  border-radius: 2px;
}

/* 文献条目 - Figma: column, gap 8px, borderRadius 6px */
.article-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  flex-shrink: 0;
}

.article-item:hover .article-title {
  color: #165DFF;
}

/* 文献标题 - Figma: 14px, 500, #000000 */
.article-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #000000;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s;
}

/* 文献元信息容器 - Figma: column, gap 4px */
.article-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 作者 - Figma: Inter, 12px, 400, #86909C */
.article-authors {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.21;
  color: #86909C;
}

/* 期刊 - Figma: Inter, 12px, 400, #86909C */
.article-journal {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.21;
  color: #86909C;
}

/* 分割线 - Figma: Line, 0.5px, #E5E6EB（兄弟节点，非嵌套） */
.article-divider {
  height: 0;
  border-bottom: 0.5px solid #E5E6EB;
  flex-shrink: 0;
}

/* 骨架屏加载状态 */
.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #F2F3F5 25%, #E8E9EC 37%, #F2F3F5 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 16px;
  width: 100%;
}

.skeleton-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-authors {
  height: 12px;
  width: 40%;
}

.skeleton-journal {
  height: 12px;
  width: 70%;
}

@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #86909C;
  font-size: 13px;
}

.retry-btn {
  padding: 6px 16px;
  background: #F7F8FA;
  border: 0.5px solid #E5E6EB;
  border-radius: 4px;
  font-size: 12px;
  color: #4E5969;
  cursor: pointer;
}

.retry-btn:hover {
  background: #E8F3FF;
  color: #165DFF;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #86909C;
  font-size: 13px;
}

/* ============================================================
   删除确认弹窗
   ============================================================ */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.confirm-dialog {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 260px;
}

.confirm-dialog p {
  font-size: 14px;
  color: #1D2129;
  margin: 0 0 16px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirm-cancel,
.confirm-ok {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.confirm-cancel {
  background: #F7F8FA;
  color: #4E5969;
}

.confirm-cancel:hover {
  background: #E5E6EB;
}

.confirm-ok {
  background: #165DFF;
  color: #FFFFFF;
}

.confirm-ok:hover {
  background: #4080FF;
}

/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
