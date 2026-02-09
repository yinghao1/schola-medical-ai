import { defineStore } from 'pinia'
import { ref } from 'vue'

// 错误类型
export type ErrorType = 'error' | 'warning' | 'info'

// 错误项接口
export interface ErrorItem {
  id: string
  message: string
  type: ErrorType
  duration?: number
}

export const useErrorStore = defineStore('error', () => {
  // 状态
  const errors = ref<ErrorItem[]>([])

  // 生成唯一 ID
  function generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 显示错误
  function showError(message: string, duration = 5000) {
    const error: ErrorItem = {
      id: generateId(),
      message,
      type: 'error',
      duration
    }
    errors.value.push(error)
    return error.id
  }

  // 显示警告
  function showWarning(message: string, duration = 5000) {
    const error: ErrorItem = {
      id: generateId(),
      message,
      type: 'warning',
      duration
    }
    errors.value.push(error)
    return error.id
  }

  // 显示信息
  function showInfo(message: string, duration = 3000) {
    const error: ErrorItem = {
      id: generateId(),
      message,
      type: 'info',
      duration
    }
    errors.value.push(error)
    return error.id
  }

  // 移除错误
  function removeError(id: string) {
    const index = errors.value.findIndex(e => e.id === id)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }

  // 清除所有错误
  function clearAll() {
    errors.value = []
  }

  return {
    errors,
    showError,
    showWarning,
    showInfo,
    removeError,
    clearAll
  }
})
