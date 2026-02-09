<template>
  <div class="search-input-wrapper">
    <!-- 搜索框容器 - Figma: border-radius 28px, shadow 0px 5px 30px rgba(41,14,0,0.05) -->
    <div
      :class="[
        'search-input-container',
        { 'search-input-focused': isFocused }
      ]"
    >
      <!-- 输入区域 -->
      <div class="input-area">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="placeholder"
          :rows="1"
          :disabled="disabled"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown="handleKeydown"
          class="search-textarea"
        />
      </div>

      <!-- 底部工具栏 -->
      <div class="input-toolbar">
        <!-- 深度思考按钮 - Figma: Frame 1321319579, border-radius 100px -->
        <button
          @click="toggleDeepThinking"
          :class="[
            'deep-thinking-btn',
            { 'deep-thinking-active': deepThinkingEnabled }
          ]"
        >
          <!-- 深度思考图标 -->
          <div class="deep-thinking-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.36073 5.47255C7.67107 5.19843 8.14507 5.22784 8.41933 5.53798C8.69355 5.84843 8.66434 6.32236 8.3539 6.59658C8.04868 6.8662 7.74565 7.15049 7.44667 7.44814C5.62148 9.28197 4.32726 11.2506 3.69374 12.9247C3.37656 13.7629 3.2379 14.4943 3.25624 15.079C3.27218 15.5853 3.4028 15.9483 3.60488 16.2001L3.69667 16.3017L3.69863 16.3046C4.18543 16.7938 5.24014 16.9591 6.89296 16.3739C7.28337 16.2357 7.71168 16.4406 7.84999 16.831C7.98802 17.2213 7.78416 17.6497 7.39394 17.788C5.62843 18.4131 3.77742 18.5101 2.63515 17.3622V17.3612C2.04134 16.7681 1.78281 15.9717 1.75624 15.1259C1.72983 14.284 1.92861 13.3507 2.29042 12.3944C3.01498 10.4797 4.44599 8.33635 6.38613 6.38759L6.38808 6.38564C6.70812 6.06701 7.03305 5.76202 7.36073 5.47255ZM5.53847 11.581C5.84885 11.3068 6.32283 11.3361 6.59706 11.6464C6.86593 11.9508 7.14895 12.2535 7.4457 12.5517C9.28002 14.3779 11.2505 15.6727 12.9252 16.3065C13.7633 16.6237 14.4948 16.7633 15.0795 16.745C15.6583 16.7268 16.0498 16.558 16.3021 16.3046L16.3051 16.3017C16.7942 15.8147 16.9597 14.7602 16.3744 13.1073C16.2364 12.717 16.4413 12.2886 16.8314 12.1503C17.2217 12.0123 17.6502 12.2171 17.7885 12.6073C18.413 14.3714 18.5096 16.2188 17.3646 17.3612L17.3656 17.3622C16.7722 17.9585 15.9739 18.2174 15.1264 18.244C14.2845 18.2704 13.3512 18.0717 12.3949 17.7099C10.4803 16.9853 8.33672 15.5552 6.38808 13.6151L6.38613 13.6122C6.06746 13.2921 5.76253 12.9673 5.47304 12.6395C5.19907 12.3292 5.22825 11.8551 5.53847 11.581ZM12.6068 2.21279C14.3709 1.58814 16.2201 1.48998 17.3627 2.63466C17.959 3.22803 18.2178 4.0265 18.2445 4.87392C18.271 5.71598 18.0723 6.64983 17.7103 7.60634C16.9858 9.52096 15.5556 11.6636 13.6156 13.6122L13.6127 13.6151C13.2926 13.9338 12.9678 14.2387 12.64 14.5282C12.3297 14.8022 11.8557 14.7729 11.5814 14.4628C11.3075 14.1524 11.3368 13.6784 11.6469 13.4042C11.9523 13.1344 12.2559 12.8495 12.5551 12.5517C14.3801 10.7179 15.6736 8.74908 16.307 7.07509C16.6242 6.23702 16.7638 5.50647 16.7455 4.92177C16.7273 4.34259 16.5587 3.95049 16.3051 3.69814L16.3021 3.69619C15.8152 3.2071 14.7607 3.0406 13.1078 3.62587C12.7175 3.76391 12.2891 3.56004 12.1508 3.16982C12.0127 2.77968 12.217 2.35134 12.6068 2.21279ZM10.0072 6.9999C10.055 7.77825 10.3855 8.51291 10.9369 9.06435C11.4883 9.61559 12.2222 9.94619 13.0004 9.99404V10.0058C12.2221 10.0536 11.4883 10.3851 10.9369 10.9364C10.3856 11.4878 10.0551 12.2217 10.0072 12.9999H9.99452C9.94675 12.2217 9.61615 11.4878 9.06484 10.9364C8.51336 10.385 7.77882 10.0535 7.00038 10.0058V9.99404C7.77882 9.94633 8.51336 9.6158 9.06484 9.06435C9.6163 8.51289 9.94683 7.77831 9.99452 6.9999H10.0072ZM4.87441 1.75576C5.71637 1.72933 6.65043 1.92806 7.60683 2.28994C9.40181 2.9692 11.3974 4.26896 13.2455 6.02724L13.6127 6.38564L13.6156 6.38759C13.9343 6.70768 14.2392 7.03251 14.5287 7.36025C14.8028 7.67053 14.7733 8.14456 14.4633 8.41884C14.1528 8.69291 13.6779 8.66381 13.4037 8.35341C13.1341 8.04821 12.8498 7.74515 12.5521 7.44619V7.44521C10.7185 5.62032 8.74947 4.32667 7.07558 3.69326C6.23767 3.37623 5.50686 3.23748 4.92226 3.25576C4.34322 3.274 3.95094 3.44263 3.69863 3.69619L3.69667 3.69814C3.20758 4.18501 3.04124 5.23979 3.62636 6.89248C3.76458 7.28283 3.56056 7.71113 3.17031 7.84951C2.77993 7.98756 2.35053 7.78379 2.2123 7.39345C1.58719 5.62794 1.49029 3.77699 2.63808 2.63466C3.2311 2.04041 4.02839 1.78245 4.87441 1.75576Z"
                :fill="deepThinkingEnabled ? '#1D5CFF' : '#000000'"
              />
            </svg>
          </div>
          <!-- 文字 - Figma: 14px, font-weight 400 -->
          <span>深度思考</span>
          <!-- 关闭图标 - 仅在激活状态显示 -->
          <div
            v-if="deepThinkingEnabled"
            @click.stop="closeDeepThinking"
            class="close-icon"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </button>

        <!-- 发送按钮 - Figma: Frame 123429, 34x34, border-radius 31.5px -->
        <button
          @click="handleSubmit"
          :disabled="!canSubmit && !props.isGenerating"
          :class="[
            'send-btn',
            (canSubmit || props.isGenerating) && !props.disabled ? 'send-btn-active' : 'send-btn-disabled'
          ]"
        >
          <!-- 上箭头图标 -->
          <svg v-if="!props.isGenerating" width="14" height="16" viewBox="0 0 14 16" fill="none">
            <path d="M7 1L7 15" stroke="white" stroke-width="2" stroke-linecap="round" />
            <path d="M1 7L7 1L13 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- 停止图标 -->
          <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect width="12" height="12" rx="2" fill="white" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 底部提示 -->
    <p v-if="showHint" class="input-hint">
      内容由 AI 生成，仅供参考
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

// Props
interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  isGenerating?: boolean
  deepThinkingEnabled?: boolean
  showHint?: boolean
  maxRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入一个医学问题、临床疑问、复杂病例',
  disabled: false,
  isGenerating: false,
  deepThinkingEnabled: false,
  showHint: true,
  maxRows: 6
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', value: string): void
  (e: 'stop'): void
  (e: 'toggle-deep-thinking'): void
  (e: 'close-deep-thinking'): void
}>()

// Refs
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)
const inputText = ref(props.modelValue)

// 计算属性
const canSubmit = computed(() => {
  return inputText.value.trim().length > 0
})

// 监听 props 变化
watch(() => props.modelValue, (newVal) => {
  inputText.value = newVal
})

// 方法
function handleFocus() {
  isFocused.value = true
}

function handleBlur() {
  isFocused.value = false
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  inputText.value = target.value
  emit('update:modelValue', target.value)
  adjustTextareaHeight()
}

function handleKeydown(event: KeyboardEvent) {
  // Cmd/Ctrl + Enter 提交
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
    return
  }

  // Enter 不带 Shift 提交
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function handleSubmit() {
  // 如果正在生成，点击按钮触发停止
  if (props.isGenerating) {
    emit('stop')
    return
  }

  if (!canSubmit.value || props.disabled) return

  emit('submit', inputText.value.trim())
  inputText.value = ''
  emit('update:modelValue', '')

  nextTick(() => {
    adjustTextareaHeight()
  })
}

function toggleDeepThinking() {
  emit('toggle-deep-thinking')
}

function closeDeepThinking() {
  emit('close-deep-thinking')
}

function adjustTextareaHeight() {
  const textarea = textareaRef.value
  if (!textarea) return

  // 重置高度以获取正确的 scrollHeight
  textarea.style.height = 'auto'

  // 计算新高度
  const lineHeight = 24 // 行高
  const maxHeight = lineHeight * props.maxRows
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)

  textarea.style.height = `${newHeight}px`
}

// 生命周期
onMounted(() => {
  adjustTextareaHeight()
})
</script>

<style scoped>
.search-input-wrapper {
  width: 100%;
}

/* 搜索框容器 - Figma: border-radius 28px, shadow 0px 5px 30px rgba(41,14,0,0.05), border #E5E6EB */
.search-input-container {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 28px;
  border: 1px solid #EFEFEF;
  box-shadow: 0px 5px 30px 0px rgba(41, 14, 0, 0.05);
  transition: all 0.2s ease;
}

.search-input-focused {
  border-color: #4080FF;
  box-shadow: 0px 5px 30px 0px rgba(41, 14, 0, 0.08);
}

/* 输入区域 - Figma: padding 20px 24px */
.input-area {
  padding: 20px 20px 8px;
}

/* 文本框 - Figma: 16px, #86909C placeholder */
.search-textarea {
  width: 100%;
  background: transparent;
  color: #000000;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  resize: none;
  outline: none;
  border: none;
  height: 42px;
  min-height: 42px;
  max-height: 144px;
}

.search-textarea::placeholder {
  color: #86909C;
}

.search-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 工具栏 - Figma: 底部区域 */
.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px 10px 16px;
}

/* 深度思考按钮 - Figma: Frame 1321319579, height 34px, min-width 105px, border-radius 100px, border #E5E6EB */
.deep-thinking-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 34px;
  min-width: 105px;
  padding: 0 15px;
  border-radius: 100px;
  border: 1px solid #E5E6EB;
  background: transparent;
  color: #000000;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.deep-thinking-btn:hover {
  background-color: #F7F8FA;
}

/* 深度思考激活状态 - Figma: 蓝色背景，border #BEDAFF */
.deep-thinking-active {
  background: #E8F3FF;
  border-color: #BEDAFF;
  color: #1D5CFF;
  padding: 0 8px 0 15px;
}

.deep-thinking-active:hover {
  background: #D9EBFF;
}

.deep-thinking-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

/* 关闭图标 */
.close-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  color: #1D5CFF;
  cursor: pointer;
  transition: opacity 0.2s;
}

.close-icon:hover {
  opacity: 0.7;
}

/* 发送按钮 - Figma: Frame 123429, 34x34, border-radius 31.5px */
.send-btn {
  width: 34px;
  height: 34px;
  border-radius: 31.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

/* 发送按钮激活状态 */
.send-btn-active {
  background-color: #1D5CFF;
}

.send-btn-active:hover {
  background-color: #0D4CFF;
  transform: scale(1.05);
}

.send-btn-active:active {
  transform: scale(0.95);
}

/* 发送按钮禁用状态 */
.send-btn-disabled {
  background-color: #C9CDD4;
  cursor: not-allowed;
}

/* 底部提示 - Figma: 居中, 12px, #86909C */
.input-hint {
  display: none;
}
</style>
