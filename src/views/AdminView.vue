<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { useToast } from '@/composables/useToast'
import type { ProductCreateData, ProductCategory, ProductVolume } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const toast = useToast()

const showProductModal = ref(false)
const isSubmitting = ref(false)

const productForm = ref<ProductCreateData>({
  name: '',
  price: 0,
  volume: 'medium',
  product_category: 'food'
})

const categoryOptions = [
  { value: 'food', label: '🍔 Food' },
  { value: 'drink', label: '🥤 Drink' },
  { value: 'other', label: '📦 Other' }
]

const volumeOptions = [
  { value: 'small', label: 'Small (S)' },
  { value: 'medium', label: 'Medium (M)' },
  { value: 'large', label: 'Large (L)' }
]

const stats = computed(() => ({
  totalProducts: productsStore.totalProducts,
  totalOrders: ordersStore.totalOrders,
  pendingOrders: ordersStore.pendingOrders.length,
  totalRevenue: ordersStore.totalRevenue
}))

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchOrders()
  ])
})

const formatPrice = (price: number) => '$' + (price || 0).toFixed(2)

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    food: '🍔',
    drink: '🥤',
    other: '📦'
  }
  return icons[category] || '📦'
}

const getVolumeLabel = (volume: string) => {
  const labels: Record<string, string> = {
    small: 'S',
    medium: 'M',
    large: 'L'
  }
  return labels[volume] || 'M'
}

const openProductModal = () => {
  productForm.value = {
    name: '',
    price: 0,
    volume: 'medium',
    product_category: 'food'
  }
  showProductModal.value = true
}

const handleCreateProduct = async () => {
  if (!productForm.value.name.trim()) {
    toast.warning('Product name is required')
    return
  }

  if (productForm.value.price <= 0) {
    toast.warning('Price must be greater than 0')
    return
  }

  isSubmitting.value = true
  try {
    await productsStore.createProduct({
      ...productForm.value,
      status: 'available'
    })
    toast.success('Product created successfully')
    showProductModal.value = false
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteProduct = async (id: number, name: string) => {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return

  try {
    await productsStore.deleteProduct(id)
    toast.success('Product deleted')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete product'
    toast.error(message)
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Admin Dashboard</h1>
          <p class="page-subtitle">Manage products and view statistics</p>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <BaseCard class="stat-card gradient-primary">
          <div class="stat-content">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalProducts }}</span>
              <span class="stat-label">Total Products</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card gradient-warning">
          <div class="stat-content">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalOrders }}</span>
              <span class="stat-label">Total Orders</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card gradient-info">
          <div class="stat-content">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.pendingOrders }}</span>
              <span class="stat-label">Pending Orders</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card gradient-success">
          <div class="stat-content">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <span class="stat-value">{{ formatPrice(stats.totalRevenue) }}</span>
              <span class="stat-label">Total Revenue</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Products Management -->
      <BaseCard class="products-card">
        <div class="card-header">
          <h2 class="card-title">Products Management</h2>
          <BaseButton @click="openProductModal">
            + Add Product
          </BaseButton>
        </div>

        <div v-if="productsStore.isLoading" class="loading-container">
          <LoadingSpinner size="lg" center />
        </div>

        <div v-else-if="productsStore.products.length === 0">
          <EmptyState
            icon="📦"
            title="No products yet"
            description="Create your first product to get started"
          >
            <template #action>
              <BaseButton @click="openProductModal">Add Product</BaseButton>
            </template>
          </EmptyState>
        </div>

        <div v-else class="products-table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productsStore.products" :key="product.id">
                <td>
                  <div class="product-cell">
                    <span class="product-icon">{{ getCategoryIcon(product.product_category) }}</span>
                    <span class="product-name">{{ product.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="category-badge">{{ product.product_category }}</span>
                </td>
                <td class="price-cell">{{ formatPrice(product.price) }}</td>
                <td>
                  <span class="volume-badge">
                    {{ getVolumeLabel(product.volume) }}
                  </span>
                </td>
                <td>
                  <span 
                    class="status-badge"
                    :class="[`status-${product.status}`]"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td>
                  <BaseButton
                    variant="danger"
                    size="sm"
                    @click="handleDeleteProduct(product.id, product.name)"
                  >
                    Delete
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>

    <!-- Create Product Modal -->
    <BaseModal
      v-model="showProductModal"
      title="Add New Product"
      size="md"
    >
      <form @submit.prevent="handleCreateProduct">
        <BaseInput
          v-model="productForm.name"
          label="Product Name"
          placeholder="Enter product name"
          required
        />

        <BaseInput
          v-model="productForm.price"
          type="number"
          label="Price"
          placeholder="0.00"
          required
        />

        <BaseSelect
          v-model="productForm.volume"
          :options="volumeOptions"
          label="Size"
        />

        <BaseSelect
          v-model="productForm.product_category"
          :options="categoryOptions"
          label="Category"
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="showProductModal = false">
          Cancel
        </BaseButton>
        <BaseButton
          :loading="isSubmitting"
          @click="handleCreateProduct"
        >
          Create Product
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background: var(--background);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  transform: translate(30%, -30%);
}

.gradient-primary::before { background: var(--primary); }
.gradient-warning::before { background: var(--warning); }
.gradient-info::before { background: #06b6d4; }
.gradient-success::before { background: var(--secondary); }

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: var(--surface-light);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.products-card {
  padding: 0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.loading-container {
  padding: 4rem;
}

.products-table-container {
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.products-table th {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  background: var(--surface-light);
}

.products-table tbody tr:hover {
  background: var(--surface-light);
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-icon {
  font-size: 1.5rem;
}

.product-name {
  font-weight: 500;
  color: var(--text);
}

.category-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: var(--surface-light);
  border-radius: 6px;
  font-size: 0.8rem;
  text-transform: capitalize;
  color: var(--text-muted);
}

.price-cell {
  font-weight: 600;
  color: var(--secondary);
}

.volume-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-available {
  background: rgba(16, 185, 129, 0.15);
  color: var(--secondary);
}

.status-unavailable {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.status-deleted {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

@media (max-width: 900px) {
  .products-table th,
  .products-table td {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 600px) {
  .admin-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
