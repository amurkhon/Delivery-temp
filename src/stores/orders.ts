import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderCreateData, OrderStatus } from '@/types'
import api from '@/services/api'

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  )

  const completedOrders = computed(() => 
    orders.value.filter(o => o.status === 'delivered')
  )

  const totalOrders = computed(() => orders.value.length)

  const totalRevenue = computed(() => 
    orders.value.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  )

  const ordersByStatus = computed(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      pending: [],
      confirmed: [],
      delivered: [],
      cancelled: []
    }
    orders.value.forEach(o => {
      grouped[o.status]?.push(o)
    })
    return grouped
  })

  // Actions
  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      orders.value = await api.getOrders()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch orders'
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrder = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      currentOrder.value = await api.getOrder(id)
      return currentOrder.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch order'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (data: OrderCreateData) => {
    isLoading.value = true
    error.value = null
    try {
      const order = await api.createOrder(data)
      orders.value.unshift(order)
      return order
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create order'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    isLoading.value = true
    error.value = null
    try {
      const order = await api.updateOrderStatus(id, { status })
      const index = orders.value.findIndex(o => o.id === id)
      if (index > -1) {
        orders.value[index] = order
      }
      return order
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update order'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const getOrderById = (id: number) => {
    return orders.value.find(o => o.id === id)
  }

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    // Getters
    pendingOrders,
    completedOrders,
    totalOrders,
    totalRevenue,
    ordersByStatus,
    // Actions
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrderStatus,
    getOrderById
  }
})
