<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import type { OrderStatus } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const ordersStore = useOrdersStore()

const activeTab = ref<'all' | OrderStatus>('all')

const tabs = [
  { value: 'all', label: 'All Orders', icon: '📋' },
  { value: 'pending', label: 'Pending', icon: '⏳' },
  { value: 'confirmed', label: 'Confirmed', icon: '✅' },
  { value: 'delivered', label: 'Delivered', icon: '🚀' },
  { value: 'cancelled', label: 'Cancelled', icon: '❌' }
]

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return ordersStore.orders
  }
  return ordersStore.orders.filter(o => o.status === activeTab.value)
})

const stats = computed(() => ({
  total: ordersStore.totalOrders,
  pending: ordersStore.pendingOrders.length,
  completed: ordersStore.completedOrders.length,
  revenue: ordersStore.totalRevenue
}))

onMounted(() => {
  ordersStore.fetchOrders()
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => '$' + (price || 0).toFixed(2)

const getStatusClass = (status: OrderStatus) => `status-${status}`

const getStatusIcon = (status: OrderStatus) => {
  const icons: Record<OrderStatus, string> = {
    pending: '⏳',
    confirmed: '✅',
    delivered: '🚀',
    cancelled: '❌'
  }
  return icons[status]
}
</script>

<template>
  <div class="orders-page">
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Orders</h1>
          <p class="page-subtitle">Track and manage your orders</p>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <BaseCard class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Total Orders</span>
          </div>
        </BaseCard>
        
        <BaseCard class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-value warning">{{ stats.pending }}</span>
            <span class="stat-label">Pending</span>
          </div>
        </BaseCard>
        
        <BaseCard class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value success">{{ stats.completed }}</span>
            <span class="stat-label">Delivered</span>
          </div>
        </BaseCard>
        
        <BaseCard class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value primary">{{ formatPrice(stats.revenue) }}</span>
            <span class="stat-label">Total Spent</span>
          </div>
        </BaseCard>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value as any"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Orders List -->
      <div v-if="ordersStore.isLoading" class="loading-container">
        <LoadingSpinner size="lg" center />
      </div>

      <div v-else-if="filteredOrders.length === 0">
        <EmptyState
          icon="📋"
          title="No orders found"
          :description="activeTab === 'all' 
            ? 'Start shopping to see your orders here' 
            : `No ${activeTab} orders`"
        >
          <template #action>
            <RouterLink to="/products">
              <BaseButton>Browse Products</BaseButton>
            </RouterLink>
          </template>
        </EmptyState>
      </div>

      <div v-else class="orders-list">
        <BaseCard 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="order-card"
          hoverable
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">Order #{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <span class="order-status" :class="getStatusClass(order.status)">
              <span class="status-icon">{{ getStatusIcon(order.status) }}</span>
              {{ order.status }}
            </span>
          </div>
          
          <div class="order-body">
            <div class="order-detail">
              <span class="detail-label">Items</span>
              <span class="detail-value">{{ order.quantity }}</span>
            </div>
            <div class="order-detail">
              <span class="detail-label">Total</span>
              <span class="detail-value total">{{ formatPrice(order.total_amount) }}</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background: var(--background);
}

.page-container {
  max-width: 1200px;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: var(--surface-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.stat-value.primary { color: var(--primary-light); }
.stat-value.success { color: var(--secondary); }
.stat-value.warning { color: var(--warning); }

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--surface-light);
  color: var(--text);
}

.tab-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.loading-container {
  padding: 4rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  padding: 1.25rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-id {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text);
}

.order-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.order-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.status-confirmed {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-light);
}

.status-delivered {
  background: rgba(16, 185, 129, 0.15);
  color: var(--secondary);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.order-body {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.detail-value.total {
  color: var(--secondary);
  font-size: 1.25rem;
}

@media (max-width: 600px) {
  .orders-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .tab-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .tab-label {
    display: none;
  }
}
</style>
