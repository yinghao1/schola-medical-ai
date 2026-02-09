<template>
  <!-- 全局错误提示容器 -->
  <div class="error-container">
    <ErrorToast
      v-for="error in errors"
      :key="error.id"
      :message="error.message"
      :type="error.type"
      :duration="error.duration"
      @close="removeError(error.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useErrorStore } from '@/stores'
import ErrorToast from './ErrorToast.vue'

// Store
const errorStore = useErrorStore()
const { errors } = storeToRefs(errorStore)
const { removeError } = errorStore
</script>

<style scoped>
.error-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.error-container > * {
  pointer-events: auto;
}
</style>
