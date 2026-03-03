<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import CartSidebar from '@/components/cart/CartSidebar.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const authStore = useAuthStore()
</script>

<template>
  <div class="app">
    <AppHeader v-if="authStore.isAuthenticated" />
    
    <main class="main-content" :class="{ 'with-header': authStore.isAuthenticated }">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <CartSidebar v-if="authStore.isAuthenticated" />
    <ToastContainer />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content.with-header {
  padding-top: 70px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
