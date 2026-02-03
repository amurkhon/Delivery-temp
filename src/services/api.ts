import type {
  SignUpData,
  SignInData,
  AuthResponse,
  Product,
  ProductCreateData,
  ProductStatus,
  Order,
  OrderCreateData,
  OrderUpdateData,
  User
} from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // ==================== AUTH ====================
  
  async signup(data: SignUpData): Promise<User> {
    return this.request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async signin(data: SignInData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/logout', {
      method: 'POST'
    })
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin/refresh')
  }

  // ==================== PRODUCTS ====================

  async getProducts(status: ProductStatus = 'available'): Promise<Product[]> {
    return this.request<Product[]>(`/product/all?status=${status}`)
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/product/single/${id}`)
  }

  async createProduct(data: ProductCreateData): Promise<Product> {
    return this.request<Product>('/product/create', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProduct(id: number, data: ProductCreateData): Promise<Product> {
    return this.request<Product>(`/product/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProduct(id: number): Promise<Product> {
    return this.request<Product>(`/product/delete/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== ORDERS ====================

  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/order/all')
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/order/single/${id}`)
  }

  async createOrder(data: OrderCreateData): Promise<Order> {
    return this.request<Order>('/order/create', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateOrderStatus(id: number, data: OrderUpdateData): Promise<Order> {
    return this.request<Order>(`/order/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

export const api = new ApiService()
export default api
