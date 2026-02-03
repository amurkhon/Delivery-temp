import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, CartItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.cartQuantity, 0)
  )

  const totalAmount = computed(() => 
    items.value.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  const productIds = computed(() => {
    const ids: number[] = []
    items.value.forEach(item => {
      for (let i = 0; i < item.cartQuantity; i++) {
        ids.push(item.id)
      }
    })
    return ids
  })

  // Actions
  const addItem = (product: Product) => {
    const existing = items.value.find(item => item.id === product.id)
    
    if (existing) {
      // No stock limit - just increment
      existing.cartQuantity++
      return true
    }
    
    items.value.push({
      ...product,
      cartQuantity: 1
    })
    return true
  }

  const removeItem = (productId: number) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.cartQuantity = quantity
      }
    }
  }

  const incrementQuantity = (productId: number) => {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      item.cartQuantity++
    }
  }

  const decrementQuantity = (productId: number) => {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      if (item.cartQuantity > 1) {
        item.cartQuantity--
      } else {
        removeItem(productId)
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }

  const toggleCart = () => {
    isOpen.value = !isOpen.value
  }

  const openCart = () => {
    isOpen.value = true
  }

  const closeCart = () => {
    isOpen.value = false
  }

  const isInCart = (productId: number) => {
    return items.value.some(item => item.id === productId)
  }

  const getItemQuantity = (productId: number) => {
    const item = items.value.find(i => i.id === productId)
    return item?.cartQuantity || 0
  }

  return {
    // State
    items,
    isOpen,
    // Getters
    totalItems,
    totalAmount,
    isEmpty,
    productIds,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    isInCart,
    getItemQuantity
  }
}, {
  persist: {
    pick: ['items']
  }
})
