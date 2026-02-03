<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const isMobileMenuOpen = ref(false)

const navItems = computed(() => {
  const items = [
    { name: 'Products', route: 'products', icon: '🛍️' },
    { name: 'Orders', route: 'orders', icon: '📋' }
  ]
  
  if (authStore.isAdmin) {
    items.push({ name: 'Admin', route: 'admin', icon: '⚙️' })
  }
  
  return items
})

const isActive = (routeName: string) => route.name === routeName

const handleLogout = async () => {
  await authStore.logout()
  cartStore.clearCart()
  router.push({ name: 'login' })
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo -->
      <RouterLink to="/products" class="logo" @click="closeMobileMenu">
        <div class="logo-icon">🚀</div>
        <span class="logo-text">Delivery</span>
      </RouterLink>

      <!-- Desktop Navigation -->
      <nav class="nav-desktop">
        <RouterLink
          v-for="item in navItems"
          :key="item.route"
          :to="{ name: item.route }"
          class="nav-link"
          :class="{ active: isActive(item.route) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <!-- Right Section -->
      <div class="header-right">
        <!-- Cart Button -->
        <button class="cart-btn" @click="cartStore.toggleCart">
          <span class="cart-icon">🛒</span>
          <span class="cart-text">Cart</span>
          <span v-if="cartStore.totalItems > 0" class="cart-badge">
            {{ cartStore.totalItems }}
          </span>
        </button>

        <!-- User Menu -->
        <div class="user-menu">
          <div class="user-avatar">
            {{ authStore.username.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ authStore.username }}</span>
            <span class="user-role">{{ authStore.user?.role }}</span>
          </div>
        </div>

        <!-- Logout Button -->
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <span>🚪</span>
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span v-if="!isMobileMenuOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <Transition name="slide">
      <nav v-if="isMobileMenuOpen" class="nav-mobile">
        <RouterLink
          v-for="item in navItems"
          :key="item.route"
          :to="{ name: item.route }"
          class="nav-link-mobile"
          :class="{ active: isActive(item.route) }"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </RouterLink>
        <button class="nav-link-mobile logout" @click="handleLogout">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text);
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-desktop {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition);
}

.nav-link:hover {
  background: var(--surface-light);
  color: var(--text);
}

.nav-link.active {
  background: var(--primary);
  color: white;
}

.nav-icon {
  font-size: 1.1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--surface-light);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.cart-btn:hover {
  border-color: var(--primary);
  background: var(--surface);
}

.cart-icon {
  font-size: 1.1rem;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--danger);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--surface-light);
  border-radius: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.logout-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);
}

.logout-btn:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: white;
}

.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: var(--surface-light);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 1.25rem;
  cursor: pointer;
}

.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 1rem;
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.nav-link-mobile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 1rem;
  transition: var(--transition);
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
}

.nav-link-mobile:hover,
.nav-link-mobile.active {
  background: var(--surface-light);
  color: var(--text);
}

.nav-link-mobile.active {
  color: var(--primary-light);
}

.nav-link-mobile.logout {
  color: var(--danger);
}

/* Mobile Styles */
@media (max-width: 900px) {
  .nav-desktop {
    display: none;
  }

  .user-info {
    display: none;
  }

  .logout-btn {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-mobile {
    display: flex;
  }
}

@media (max-width: 600px) {
  .header-container {
    padding: 0 1rem;
  }

  .logo-text {
    display: none;
  }

  .cart-text {
    display: none;
  }

  .cart-btn {
    padding: 0.625rem;
  }

  .user-menu {
    padding: 0.5rem;
  }
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
