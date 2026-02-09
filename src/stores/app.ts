import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏状态
  const sidebarCollapsed = ref(false)

  // 当前激活的导航
  const activeNav = ref('evidence')

  // 移动端菜单状态
  const mobileMenuOpen = ref(false)

  // 计算属性
  const sidebarWidth = computed(() => {
    return sidebarCollapsed.value ? '64px' : '240px'
  })

  // 方法
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function collapseSidebar() {
    sidebarCollapsed.value = true
  }

  function expandSidebar() {
    sidebarCollapsed.value = false
  }

  function setActiveNav(navId: string) {
    activeNav.value = navId
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  return {
    // 状态
    sidebarCollapsed,
    activeNav,
    mobileMenuOpen,
    // 计算属性
    sidebarWidth,
    // 方法
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    setActiveNav,
    toggleMobileMenu,
    closeMobileMenu
  }
})
