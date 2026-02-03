<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/products/ProductCard.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const productsStore = useProductsStore()
const cartStore = useCartStore()

const activeCategory = ref<string>('all')

const categories = [
  { value: 'all', label: 'All', icon: '🛍️' },
  { value: 'food', label: 'Food', icon: '🍔' },
  { value: 'drink', label: 'Drinks', icon: '🥤' },
  { value: 'other', label: 'Other', icon: '📦' }
]

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return productsStore.products
  }
  return productsStore.products.filter(p => p.product_category === activeCategory.value)
})

const stats = computed(() => ({
  total: productsStore.products.length,
  inCart: cartStore.totalItems,
  cartTotal: cartStore.totalAmount
}))

onMounted(() => {
  productsStore.fetchProducts()
})

const formatPrice = (price: number) => '$' + price.toFixed(2)
</script>

<template>
  <div class="products-page">
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Browse our delicious menu and add items to your cart</p>
        </div>
        
        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Products</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.inCart }}</span>
            <span class="stat-label">In Cart</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value highlight">{{ formatPrice(stats.cartTotal) }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </header>

      <!-- Category Filter -->
      <div class="category-filter">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="category-btn"
          :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          <span class="category-icon">{{ cat.icon }}</span>
          <span class="category-label">{{ cat.label }}</span>
        </button>
      </div>

      <!-- Products Grid -->
      <div v-if="productsStore.isLoading" class="loading-container">
        <LoadingSpinner size="lg" center />
      </div>

      <div v-else-if="filteredProducts.length === 0">
        <EmptyState
          icon="📦"
          title="No products found"
          description="There are no products available in this category"
        />
      </div>

      <div v-else class="products-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background: var(--background);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.quick-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

.stat-value.highlight {
  color: var(--secondary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--border);
}

.category-filter {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-muted);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.category-btn:hover {
  border-color: var(--primary);
  color: var(--text);
}

.category-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.category-icon {
  font-size: 1.1rem;
}

.loading-container {
  padding: 4rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    gap: 1.5rem;
  }

  .quick-stats {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .products-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .category-filter {
    gap: 0.5rem;
  }

  .category-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}
</style>
