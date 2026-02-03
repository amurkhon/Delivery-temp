import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductCreateData, ProductStatus } from '@/types'
import api from '@/services/api'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const availableProducts = computed(() => 
    products.value.filter(p => p.status === 'available')
  )

  const productsByCategory = computed(() => {
    const grouped: Record<string, Product[]> = {
      food: [],
      drink: [],
      other: []
    }
    products.value.forEach(p => {
      if (p.status === 'available') {
        grouped[p.product_category]?.push(p)
      }
    })
    return grouped
  })

  const totalProducts = computed(() => products.value.length)

  // Actions
  const fetchProducts = async (status: ProductStatus = 'available') => {
    isLoading.value = true
    error.value = null
    try {
      products.value = await api.getProducts(status)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch products'
      products.value = []
    } finally {
      isLoading.value = false
    }
  }

  const fetchProduct = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      currentProduct.value = await api.getProduct(id)
      return currentProduct.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch product'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createProduct = async (data: ProductCreateData) => {
    isLoading.value = true
    error.value = null
    try {
      const product = await api.createProduct(data)
      products.value.push(product)
      return product
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create product'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateProduct = async (id: number, data: ProductCreateData) => {
    isLoading.value = true
    error.value = null
    try {
      const product = await api.updateProduct(id, data)
      const index = products.value.findIndex(p => p.id === id)
      if (index > -1) {
        products.value[index] = product
      }
      return product
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update product'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await api.deleteProduct(id)
      const index = products.value.findIndex(p => p.id === id)
      if (index > -1) {
        products.value.splice(index, 1)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete product'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const getProductById = (id: number) => {
    return products.value.find(p => p.id === id)
  }

  return {
    // State
    products,
    currentProduct,
    isLoading,
    error,
    // Getters
    availableProducts,
    productsByCategory,
    totalProducts,
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
  }
})
