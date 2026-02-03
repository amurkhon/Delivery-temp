<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const toast = useToast()

const isLoading = computed(() => ordersStore.isLoading)

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    food: '🍔',
    drink: '🥤',
    other: '📦'
  }
  return icons[category] || '📦'
}

const formatPrice = (price: number) => '$' + price.toFixed(2)

const handleCheckout = async () => {
  if (cartStore.isEmpty) {
    toast.warning('Your cart is empty')
    return
  }

  try {
    await ordersStore.createOrder({
      product_ids: cartStore.productIds
    })
    
    cartStore.clearCart()
    cartStore.closeCart()
    toast.success('Order placed successfully!')
    router.push('/orders')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    toast.error(message)
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="cartStore.isOpen"
        class="cart-overlay"
        @click="cartStore.closeCart"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <aside v-if="cartStore.isOpen" class="cart-sidebar">
        <!-- Header -->
        <header class="cart-header">
          <h2 class="cart-title">
            <span class="cart-icon">🛒</span>
            Shopping Cart
          </h2>
          <button class="cart-close" @click="cartStore.closeCart">✕</button>
        </header>

        <!-- Body -->
        <div class="cart-body">
          <!-- Empty State -->
          <div v-if="cartStore.isEmpty" class="cart-empty">
            <div class="empty-icon">🛒</div>
            <h3 class="empty-title">Your cart is empty</h3>
            <p class="empty-text">Add some products to get started</p>
            <BaseButton variant="outline" @click="cartStore.closeCart">
              Continue Shopping
            </BaseButton>
          </div>

          <!-- Cart Items -->
          <div v-else class="cart-items">
            <TransitionGroup name="list">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="cart-item"
              >
                <div class="item-icon">
                  {{ getCategoryIcon(item.product_category) }}
                </div>
                
                <div class="item-info">
                  <h4 class="item-name">{{ item.name }}</h4>
                  <span class="item-price">{{ formatPrice(item.price) }}</span>
                </div>
                
                <div class="item-controls">
                  <button
                    class="qty-btn"
                    @click="cartStore.decrementQuantity(item.id)"
                  >
                    −
                  </button>
                  <span class="qty-value">{{ item.cartQuantity }}</span>
                  <button
                    class="qty-btn"
                    @click="cartStore.incrementQuantity(item.id)"
                  >
                    +
                  </button>
                </div>
                
                <div class="item-total">
                  {{ formatPrice(item.price * item.cartQuantity) }}
                </div>
                
                <button
                  class="item-remove"
                  @click="cartStore.removeItem(item.id)"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Footer -->
        <footer v-if="!cartStore.isEmpty" class="cart-footer">
          <div class="cart-summary">
            <div class="summary-row">
              <span>Items</span>
              <span>{{ cartStore.totalItems }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span class="total-amount">{{ formatPrice(cartStore.totalAmount) }}</span>
            </div>
          </div>
          
          <BaseButton
            variant="success"
            size="lg"
            block
            :loading="isLoading"
            @click="handleCheckout"
          >
            Checkout
          </BaseButton>
          
          <button class="clear-cart" @click="cartStore.clearCart">
            Clear Cart
          </button>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
}

.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: var(--surface);
  border-left: 1px solid var(--border);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.cart-icon {
  font-size: 1.5rem;
}

.cart-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-light);
  border: none;
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);
}

.cart-close:hover {
  background: var(--border);
  color: var(--text);
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.empty-text {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-light);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.item-icon {
  width: 50px;
  height: 50px;
  background: var(--surface);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.item-info {
  min-width: 0;
}

.item-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.qty-btn:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 700;
  color: var(--secondary);
  white-space: nowrap;
}

.item-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.item-remove:hover {
  background: var(--danger);
  color: white;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}

.cart-summary {
  margin-bottom: 1.25rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.summary-row.total {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 1px solid var(--border);
  font-weight: 600;
  color: var(--text);
  font-size: 1.1rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary);
}

.clear-cart {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.clear-cart:hover {
  color: var(--danger);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 480px) {
  .cart-sidebar {
    width: 100%;
  }

  .cart-item {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 0.75rem;
  }

  .item-controls {
    grid-column: 1 / 2;
    grid-row: 2;
  }

  .item-total {
    grid-column: 2;
    grid-row: 2;
    text-align: right;
  }

  .item-remove {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  .cart-item {
    position: relative;
    padding-right: 2.5rem;
  }
}
</style>
