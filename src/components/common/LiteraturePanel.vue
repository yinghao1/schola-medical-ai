<template>
  <transition name="slide-panel">
    <div v-if="pubmedStore.isPanelOpen" class="literature-panel">
      <!-- 标题栏 -->
      <div class="panel-header">
        <div class="header-left">
          <button
            v-if="pubmedStore.showSettings"
            class="header-back-btn"
            @click="pubmedStore.closeSettings"
            aria-label="返回"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="#333333" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="header-title">{{ pubmedStore.showSettings ? '推荐设置' : '文献推荐' }}</span>
          <span v-if="!pubmedStore.showSettings" class="header-badge">基于您的兴趣领域</span>
        </div>
        <div class="header-right">
          <!-- 设置按钮（仅在文献列表视图显示） -->
          <button
            v-if="!pubmedStore.showSettings"
            class="header-icon-btn"
            @click="pubmedStore.openSettings"
            aria-label="推荐设置"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.07005 14.3723C7.68384 14.7267 8.43933 14.7297 9.05597 14.3804L13.0793 12.1008C13.7111 11.7429 14.0992 11.0706 14.0933 10.3445L14.0558 5.72043C14.05 5.01172 13.6696 4.35898 13.0559 4.00461L8.93845 1.62743C8.32468 1.27306 7.56921 1.26999 6.95258 1.61935L2.92916 3.89884C2.29735 4.25679 1.9092 4.92909 1.91511 5.65523L1.95272 10.2794C1.95849 10.9881 2.33888 11.6408 2.95265 11.9951L7.07005 14.3723Z" stroke="#333333" stroke-width="1.3" stroke-linejoin="round"/>
              <path d="M8.00423 9.99626C9.10681 9.99626 10.0007 9.10242 10.0007 7.99984C10.0007 6.89725 9.10681 6.00342 8.00423 6.00342C6.90165 6.00342 6.00781 6.89725 6.00781 7.99984C6.00781 9.10242 6.90165 9.99626 8.00423 9.99626Z" stroke="#333333" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
            <span class="action-tooltip">推荐设置</span>
          </button>
          <!-- 关闭按钮（仅在文献列表视图显示） -->
          <button v-if="!pubmedStore.showSettings" class="close-btn" @click="pubmedStore.closePanel" aria-label="关闭">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M3 13L13 3" stroke="#333333" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="action-tooltip tooltip-right">关闭</span>
          </button>
        </div>
      </div>

      <!-- ==================== 设置面板视图 ==================== -->
      <div v-if="pubmedStore.showSettings" class="settings-view">
        <!-- 1. 时间窗口 -->
        <div class="settings-item">
          <label class="settings-label">时间窗口</label>
          <div class="settings-select-wrap">
            <select v-model="draft.timeWindow" class="settings-select">
              <option :value="30">近30天</option>
              <option :value="90">近90天</option>
              <option :value="180">近180天</option>
            </select>
            <svg class="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#86909C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- 2. 期刊筛选 -->
        <div class="settings-item">
          <label class="settings-label">期刊筛选</label>
          <div class="settings-select-wrap">
            <select v-model="draft.journalFilter" class="settings-select">
              <option value="all">所有期刊</option>
              <option value="highIF">高影响因子 (IF&gt;10)</option>
              <option value="top">顶级期刊</option>
            </select>
            <svg class="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#86909C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- 3. 每日推荐数量 -->
        <div class="settings-item">
          <label class="settings-label">每日推荐数量</label>
          <div class="settings-counter">
            <button
              class="counter-btn"
              :disabled="draft.dailyCount <= 1"
              @click="draft.dailyCount = Math.max(1, draft.dailyCount - 1)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6H9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
            <input
              class="counter-value"
              type="text"
              inputmode="numeric"
              :value="draft.dailyCount"
              @input="onDailyCountInput"
              @blur="onDailyCountBlur"
            />
            <button
              class="counter-btn"
              :disabled="draft.dailyCount >= 500"
              @click="draft.dailyCount = Math.min(500, draft.dailyCount + 1)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 4. 个人偏好 -->
        <div class="settings-item">
          <label class="settings-label">个人偏好</label>
          <div class="settings-textarea-wrap">
            <textarea
              v-model="draft.personalPreference"
              class="settings-textarea"
              placeholder="描述您的偏好,如：关注肿瘤免疫治疗领域的最新研究进展"
              maxlength="500"
              rows="4"
            ></textarea>
            <span class="textarea-count" :class="{ 'is-limit': draft.personalPreference.length >= 500 }">
              {{ draft.personalPreference.length }}/500
            </span>
          </div>
        </div>

        <!-- 5. 操作按钮 -->
        <div class="settings-actions">
          <button class="settings-cancel-btn" @click="handleCancelSettings">取消</button>
          <button class="settings-save-btn" @click="handleSaveSettings">
            <span v-if="saveSuccess" class="save-success-text">✓ 已保存</span>
            <span v-else>保存设置</span>
          </button>
        </div>
      </div>

      <!-- ==================== 文献列表视图 ==================== -->
      <template v-else>
        <!-- 关键词区域 -->
        <div class="keywords-section">
          <div class="keywords-row">
            <div class="keywords-wrap">
              <!-- 关键词展示（不可点击，带删除按钮） -->
              <span
                v-for="kw in pubmedStore.keywords"
                :key="kw.id"
                class="keyword-chip"
              >
                {{ kw.label }}
                <button
                  class="keyword-remove"
                  @click="confirmDeleteKeyword(kw.id, kw.label)"
                  aria-label="删除关键词"
                >×</button>
              </span>
              <!-- 无关键词提示 -->
              <span v-if="pubmedStore.keywords.length === 0" class="keywords-empty">
                暂无关键词，请添加
              </span>
            </div>
            <!-- 更新推荐按钮 -->
            <button
              class="keyword-action-btn"
              :class="{ 'is-loading': pubmedStore.isLoading }"
              @click="pubmedStore.fetchArticles()"
              :disabled="pubmedStore.isLoading"
              aria-label="更新推荐"
            >
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                <path d="M0 4.6C0 2.05949 2.05949 0 4.6 0H18.4C20.9405 0 23 2.05949 23 4.6V18.4C23 20.9405 20.9405 23 18.4 23H4.6C2.05949 23 0 20.9405 0 18.4V4.6Z" fill="#F4F5F7"/>
                <g class="refresh-icon">
                  <path d="M16.1 11.5C16.1 14.0405 14.0405 16.1 11.5 16.1C8.95949 16.1 6.9 14.0405 6.9 11.5C6.9 8.95949 8.95949 6.9 11.5 6.9C13.1 6.9 14.5 7.7 15.3 8.9" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16.1 6.9V8.9H14.1" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
              </svg>
              <span class="action-tooltip">更新推荐</span>
            </button>
            <!-- 关键词管理按钮 -->
            <button class="keyword-action-btn" @click="showManager = !showManager" aria-label="关键词管理">
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                <path d="M0 4.6C0 2.05949 2.05949 0 4.6 0H18.4C20.9405 0 23 2.05949 23 4.6V18.4C23 20.9405 20.9405 23 18.4 23H4.6C2.05949 23 0 20.9405 0 18.4V4.6Z" fill="#F4F5F7"/>
                <path d="M16.2695 8.68359H11.0195" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.7695 14.5166H7.51953" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14.5156 16.2671C15.4821 16.2671 16.2656 15.4836 16.2656 14.5171C16.2656 13.5506 15.4821 12.7671 14.5156 12.7671C13.5491 12.7671 12.7656 13.5506 12.7656 14.5171C12.7656 15.4836 13.5491 16.2671 14.5156 16.2671Z" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.68359 10.4336C9.65009 10.4336 10.4336 9.65009 10.4336 8.68359C10.4336 7.7171 9.65009 6.93359 8.68359 6.93359C7.7171 6.93359 6.93359 7.7171 6.93359 8.68359C6.93359 9.65009 7.7171 10.4336 8.68359 10.4336Z" stroke="#4E5969" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="action-tooltip tooltip-right">关键词管理</span>
            </button>
          </div>

          <!-- 关键词管理弹出层 -->
          <transition name="fade">
            <div v-if="showManager" class="keyword-manager">
              <div class="keyword-manager-header">
                <span class="keyword-manager-title">关键词管理</span>
                <button class="keyword-manager-close" @click="showManager = false">×</button>
              </div>
              <div class="keyword-manager-list">
                <div v-for="kw in pubmedStore.keywords" :key="kw.id" class="keyword-manager-item">
                  <span>{{ kw.label }}</span>
                  <button
                    class="keyword-delete-btn"
                    @click="confirmDeleteKeyword(kw.id, kw.label)"
                  >×</button>
                </div>
                <span v-if="pubmedStore.keywords.length === 0" class="keyword-manager-empty">
                  暂无关键词
                </span>
              </div>
              <div class="keyword-add-row">
                <input
                  v-model="newKeywordInput"
                  class="keyword-add-input"
                  placeholder="输入关键词，回车添加"
                  @keyup.enter="handleAddKeyword"
                />
                <button class="keyword-add-btn" @click="handleAddKeyword" :disabled="!newKeywordInput.trim()">
                  添加
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- 文献列表 -->
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
          <div v-else-if="pubmedStore.sortedArticles.length === 0" class="empty-state">
            暂无文献数据
          </div>

          <!-- 文献条目（按匹配度排序，分页显示） -->
          <template v-else>
            <TransitionGroup name="article-dismiss" tag="div" class="article-transition-group">
              <div
                v-for="article in pubmedStore.pagedArticles"
                :key="article.pmid"
                class="article-card"
              >
                <!-- 元数据行：期刊 | IF | 本月热文 -->
                <div class="article-meta-row">
                  <span class="meta-journal">{{ article.journal }}</span>
                  <template v-if="article.impactFactor">
                    <span class="meta-separator">|</span>
                    <span class="meta-if">IF {{ article.impactFactor }}</span>
                  </template>
                  <template v-if="article.isHot">
                    <span class="meta-separator">|</span>
                    <span class="meta-hot">本月热文</span>
                  </template>
                </div>

                <!-- 标题：最多 3 行，可点击跳转 PubMed -->
                <a
                  class="article-title"
                  :href="article.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{ article.title }}</a>

                <!-- 文献简介：最多 2 行 -->
                <div class="article-body">
                  {{ article.abstract || '暂无简介' }}
                </div>

                <!-- 操作按钮行 -->
                <div class="article-actions">
                  <button
                    class="action-btn"
                    :class="{ 'is-favorited': article.isFavorited }"
                    @click="pubmedStore.toggleFavorite(article.pmid)"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1.75L8.57 4.93L12.25 5.39L9.625 7.82L10.14 11.375L7 9.73L3.86 11.375L4.375 7.82L1.75 5.39L5.43 4.93L7 1.75Z"
                        :stroke="article.isFavorited ? '#FF7D00' : '#86909C'"
                        :fill="article.isFavorited ? '#FF7D00' : 'none'"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    {{ article.isFavorited ? '已收藏' : '收藏' }}
                  </button>
                  <a
                    :href="article.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="action-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5.25 2.625H3.5C2.85567 2.625 2.625 2.85567 2.625 3.5V10.5C2.625 11.1443 2.85567 11.375 3.5 11.375H10.5C11.1443 11.375 11.375 11.1443 11.375 10.5V8.75" stroke="#86909C" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8.75 2.625H11.375V5.25" stroke="#86909C" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M11.375 2.625L7 7" stroke="#86909C" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    查看原文
                  </a>
                  <button
                    class="action-btn"
                    @click="pubmedStore.dismissArticle(article.pmid)"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.25" stroke="#86909C" stroke-width="1"/>
                      <path d="M9.1 4.9L4.9 9.1" stroke="#86909C" stroke-width="1" stroke-linecap="round"/>
                      <path d="M4.9 4.9L9.1 9.1" stroke="#86909C" stroke-width="1" stroke-linecap="round"/>
                    </svg>
                    不感兴趣
                  </button>
                </div>
              </div>
            </TransitionGroup>

            <!-- 分页器：文献总数 > 10 时显示 -->
            <div v-if="pubmedStore.sortedArticles.length > 10" class="pagination">
              <!-- 上一页 -->
              <button
                class="page-arrow"
                :disabled="pubmedStore.currentPage <= 1"
                @click="handlePageChange(pubmedStore.currentPage - 1)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.75 3.5L5.25 7L8.75 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- 页码按钮 -->
              <button
                v-for="page in pubmedStore.totalPages"
                :key="page"
                class="page-num"
                :class="{ 'is-active': page === pubmedStore.currentPage }"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </button>

              <!-- 下一页 -->
              <button
                class="page-arrow"
                :disabled="pubmedStore.currentPage >= pubmedStore.totalPages"
                @click="handlePageChange(pubmedStore.currentPage + 1)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </template>
        </div>
      </template>

      <!-- Toast 通知 -->
      <transition name="toast-slide">
        <div v-if="pubmedStore.showToast" class="toast-notification">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" fill="#00B42A"/>
            <path d="M4.5 7L6.25 8.75L9.5 5.25" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ pubmedStore.toastMessage }}</span>
        </div>
      </transition>
    </div>
  </transition>

  <!-- 删除确认弹窗 -->
  <transition name="fade">
    <div v-if="deleteConfirm.show" class="confirm-overlay" @click.self="deleteConfirm.show = false">
      <div class="confirm-dialog">
        <p>确定删除关键词「{{ deleteConfirm.label }}」吗？</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="deleteConfirm.show = false">取消</button>
          <button class="confirm-ok" @click="doDeleteKeyword">确定</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { usePubmedStore } from '@/stores'
import type { PubMedSettings, TimeWindow, JournalFilter } from '@/types'

const pubmedStore = usePubmedStore()

// 列表容器引用
const listRef = ref<HTMLElement | null>(null)

// 关键词管理
const showManager = ref(false)
const newKeywordInput = ref('')

// 删除确认
const deleteConfirm = reactive({
  show: false,
  keywordId: '',
  label: ''
})

// 分页切换，滚动列表回到顶部
function handlePageChange(page: number) {
  pubmedStore.setPage(page)
  listRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// ===================== 设置草稿 =====================

/** 编辑中的设置草稿（未保存前不影响实际设置） */
const draft = reactive<PubMedSettings>({
  timeWindow: 30 as TimeWindow,
  journalFilter: 'all' as JournalFilter,
  dailyCount: 40,
  personalPreference: ''
})

/** 保存成功反馈 */
const saveSuccess = ref(false)

// 打开设置面板时，用当前设置初始化草稿
watch(() => pubmedStore.showSettings, (open) => {
  if (open) {
    const snapshot = pubmedStore.getSettingsSnapshot()
    draft.timeWindow = snapshot.timeWindow
    draft.journalFilter = snapshot.journalFilter
    draft.dailyCount = snapshot.dailyCount
    draft.personalPreference = snapshot.personalPreference
    saveSuccess.value = false
  }
})

function handleSaveSettings() {
  pubmedStore.saveSettings({ ...draft })
  saveSuccess.value = true
  // 1.5s 后自动关闭设置面板
  setTimeout(() => {
    if (saveSuccess.value) {
      pubmedStore.closeSettings()
      saveSuccess.value = false
    }
  }, 1500)
}

function handleCancelSettings() {
  pubmedStore.closeSettings()
}

/** 每日推荐数量 — 手动输入处理 */
function onDailyCountInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  if (raw === '') return
  const num = parseInt(raw, 10)
  if (num > 500) {
    pubmedStore.triggerToast('每日推荐数量不能超过 500 篇')
    draft.dailyCount = 500
    ;(e.target as HTMLInputElement).value = '500'
    return
  }
  draft.dailyCount = Math.max(1, num)
}

function onDailyCountBlur(e: FocusEvent) {
  const el = e.target as HTMLInputElement
  if (!el.value || isNaN(Number(el.value))) {
    el.value = String(draft.dailyCount)
    return
  }
  const num = parseInt(el.value, 10)
  if (num > 500) {
    pubmedStore.triggerToast('每日推荐数量不能超过 500 篇')
    draft.dailyCount = 500
  } else {
    draft.dailyCount = Math.max(1, num)
  }
  el.value = String(draft.dailyCount)
}

// ===================== 关键词操作 =====================

function handleAddKeyword() {
  const value = newKeywordInput.value.trim()
  if (!value) return
  pubmedStore.addKeyword(value, `${value}[MeSH]`)
  newKeywordInput.value = ''
}

function confirmDeleteKeyword(keywordId: string, label: string) {
  deleteConfirm.keywordId = keywordId
  deleteConfirm.label = label
  deleteConfirm.show = true
}

function doDeleteKeyword() {
  pubmedStore.removeKeyword(deleteConfirm.keywordId)
  deleteConfirm.show = false
}
</script>

<style scoped>
/* ============================================================
   面板容器
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
   标题栏
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

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

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

.header-back-btn {
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
  flex-shrink: 0;
}

.header-back-btn:hover {
  background-color: #FFFFFF;
}

.header-icon-btn {
  position: relative;
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

.header-icon-btn:hover {
  background-color: #FFFFFF;
}

.header-icon-btn:hover .action-tooltip {
  opacity: 1;
}

.close-btn {
  position: relative;
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
  background-color: #FFFFFF;
}

.close-btn:hover .action-tooltip {
  opacity: 1;
}

/* ============================================================
   设置面板
   ============================================================ */
.settings-view {
  flex: 1;
  overflow-y: auto;
  padding: 4px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scrollbar-width: thin;
  scrollbar-color: #E5E6EB transparent;
}

.settings-view::-webkit-scrollbar {
  width: 4px;
}

.settings-view::-webkit-scrollbar-thumb {
  background: #E5E6EB;
  border-radius: 2px;
}

.settings-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-label {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #1D2129;
}

/* 下拉选择 */
.settings-select-wrap {
  position: relative;
}

.settings-select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  border: 0.5px solid #E5E6EB;
  border-radius: 6px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #1D2129;
  background: #F7F8FA;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.15s, background-color 0.15s;
}

.settings-select:hover {
  background: #FFFFFF;
  border-color: #C9CDD4;
}

.settings-select:focus {
  background: #FFFFFF;
  border-color: #165DFF;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 数量计数器 */
.settings-counter {
  display: flex;
  align-items: center;
  gap: 0;
  height: 36px;
  border: 0.5px solid #E5E6EB;
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
  background: #F7F8FA;
}

.counter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #4E5969;
  transition: background-color 0.15s, color 0.15s;
  flex-shrink: 0;
}

.counter-btn:hover:not(:disabled) {
  background: #E8F3FF;
  color: #165DFF;
}

.counter-btn:disabled {
  color: #C9CDD4;
  cursor: not-allowed;
}

.counter-value {
  width: 48px;
  height: 36px;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1D2129;
  border: none;
  border-left: 0.5px solid #E5E6EB;
  border-right: 0.5px solid #E5E6EB;
  outline: none;
  line-height: 36px;
  background: #FFFFFF;
  padding: 0;
  -moz-appearance: textfield;
}

.counter-value::-webkit-outer-spin-button,
.counter-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 文本域 */
.settings-textarea-wrap {
  position: relative;
}

.settings-textarea {
  width: 100%;
  min-height: 88px;
  padding: 10px 12px 24px;
  border: 0.5px solid #E5E6EB;
  border-radius: 6px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1D2129;
  background: #F7F8FA;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s, background-color 0.15s;
}

.settings-textarea::placeholder {
  color: #C9CDD4;
}

.settings-textarea:hover {
  background: #FFFFFF;
  border-color: #C9CDD4;
}

.settings-textarea:focus {
  background: #FFFFFF;
  border-color: #165DFF;
}

.textarea-count {
  position: absolute;
  right: 10px;
  bottom: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #C9CDD4;
  pointer-events: none;
}

.textarea-count.is-limit {
  color: #F53F3F;
}

/* 操作按钮 */
.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}

.settings-cancel-btn {
  height: 36px;
  padding: 0 20px;
  background: #F7F8FA;
  border: 0.5px solid #E5E6EB;
  border-radius: 6px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.15s;
}

.settings-cancel-btn:hover {
  background: #E5E6EB;
  color: #1D2129;
}

.settings-save-btn {
  height: 36px;
  padding: 0 20px;
  background: linear-gradient(90deg, #006AEB 12%, #9863FB 88%);
  border: none;
  border-radius: 6px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 88px;
}

.settings-save-btn:hover {
  opacity: 0.9;
}

.save-success-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ============================================================
   关键词区域
   ============================================================ */
.keywords-section {
  padding: 0 20px;
  flex-shrink: 0;
  position: relative;
}

.keywords-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.keywords-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  row-gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}

/* 关键词标签（不可点击，纯展示 + 删除按钮） */
.keyword-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #4E5969;
  background: #F4F5F7;
  border-radius: 4px;
  padding: 4px 4px 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 关键词删除按钮（×） */
.keyword-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  color: #C9CDD4;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  border-radius: 2px;
  padding: 0;
  transition: all 0.15s;
}

.keyword-remove:hover {
  color: #F53F3F;
  background: rgba(245, 63, 63, 0.08);
}

/* 无关键词提示 */
.keywords-empty {
  font-size: 12px;
  color: #C9CDD4;
}

/* 操作按钮通用样式（更新 / 管理） */
.keyword-action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s;
}

.keyword-action-btn:hover {
  background: #E8F3FF;
}

.keyword-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 加载中旋转动画 — 只旋转图标，不旋转背景色块 */
.keyword-action-btn.is-loading .refresh-icon {
  transform-origin: 11.5px 11.5px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 悬停提示 */
.action-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #1D2129;
  color: #FFFFFF;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 20;
}

.action-tooltip::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #1D2129;
}

.keyword-action-btn:hover .action-tooltip {
  opacity: 1;
}

/* 右对齐 tooltip（防止右侧溢出） */
.action-tooltip.tooltip-right {
  left: auto;
  right: 0;
  transform: none;
}

.action-tooltip.tooltip-right::before {
  left: auto;
  right: 8px;
  transform: none;
}

/* 关键词管理弹出层 */
.keyword-manager {
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

.keyword-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.keyword-manager-title {
  font-size: 13px;
  font-weight: 500;
  color: #1D2129;
}

.keyword-manager-close {
  border: none;
  background: none;
  font-size: 16px;
  color: #86909C;
  cursor: pointer;
  padding: 0 4px;
}

.keyword-manager-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.keyword-manager-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #F7F8FA;
  border-radius: 4px;
  font-size: 12px;
  color: #4E5969;
}

.keyword-manager-empty {
  font-size: 12px;
  color: #C9CDD4;
}

.keyword-delete-btn {
  border: none;
  background: none;
  color: #86909C;
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  line-height: 1;
}

.keyword-delete-btn:hover {
  color: #F53F3F;
}

.keyword-add-row {
  display: flex;
  gap: 6px;
  min-width: 0;
}

.keyword-add-input {
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

.keyword-add-input:focus {
  border-color: #165DFF;
}

.keyword-add-btn {
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

.keyword-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================
   文献列表
   ============================================================ */
.article-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 0;
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

.article-transition-group {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ============================================================
   分页器
   ============================================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0 4px;
  flex-shrink: 0;
}

.page-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.page-arrow:hover:not(:disabled) {
  background: #F2F3F5;
  color: #1D2129;
}

.page-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.page-num:hover:not(.is-active) {
  background: #F2F3F5;
  color: #1D2129;
}

.page-num.is-active {
  background: #165DFF;
  color: #FFFFFF;
  font-weight: 500;
}

/* 文献卡片 — Figma: column, gap 8px, border-radius 6px */
.article-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 0.5px solid #E5E6EB;
  transition: background-color 0.15s;
}

.article-card:last-child {
  border-bottom: none;
}

/* 元数据行 — Figma: row, gap 10px, 12px Inter */
.article-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.meta-journal {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.21;
  color: #86909C;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-if {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.21;
  color: #F53F3F;
  white-space: nowrap;
}

.meta-hot {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.21;
  color: #FF7D00;
  white-space: nowrap;
}

.meta-separator {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 1.21;
  color: #E5E6EB;
  white-space: nowrap;
}

/* 标题 — Figma: PingFang SC 14px 500 #000000, max 3 lines */
.article-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #000000;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}

.article-title:hover {
  color: #165DFF;
}

/* 摘要/作者 — Figma: 12px, #4E5969, fixed 32px (2 lines) */
.article-body {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #4E5969;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 0;
  max-height: 33.6px; /* 12px * 1.4 * 2 = 33.6px */
}

/* 操作按钮行 — Figma: row, gap 8px */
.article-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

/* 操作按钮 — Figma: white bg, #E5E6EB border, border-radius 5px, padding 4px 8px */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 5px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: #86909C;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}

.action-btn:hover {
  background: #F7F8FA;
  border-color: #C9CDD4;
  color: #4E5969;
}

/* 隐藏操作按钮内的图标 */
.action-btn svg {
  display: none;
}

.action-btn.is-favorited {
  color: #FF7D00;
  border-color: rgba(255, 125, 0, 0.3);
  background: rgba(255, 125, 0, 0.05);
}

.action-btn.is-favorited:hover {
  background: rgba(255, 125, 0, 0.1);
}

/* 不感兴趣删除动画 */
.article-dismiss-leave-active {
  transition: all 0.35s ease;
}

.article-dismiss-leave-to {
  opacity: 0;
  transform: translateX(30px);
  max-height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.article-dismiss-move {
  transition: transform 0.35s ease;
}

/* 分隔线（保留兼容） */
.article-divider {
  height: 0;
  border-bottom: 0.5px solid #E5E6EB;
  flex-shrink: 0;
}

/* 骨架屏 */
.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px 0;
}

.skeleton-item + .article-divider + .skeleton-item {
  /* 分割线两侧已有 padding，无需额外间距 */
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

/* ============================================================
   Toast 通知
   ============================================================ */
.toast-notification {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FFFFFF;
  border: 0.5px solid #E5E6EB;
  border-radius: 8px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #1D2129;
  z-index: 10002;
  white-space: nowrap;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
