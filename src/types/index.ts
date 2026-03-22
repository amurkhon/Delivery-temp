// User types
export type UserRole = 'admin' | 'member' | 'staff'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
  is_staff: boolean
  created_at: string
  updated_at: string
}

export interface SignUpData {
  username: string
  email: string
  password: string
  confirm_password: string
  role?: string
}

export interface SignInData {
  username_or_email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: {
    access_token: string
    refresh_token: string 
  }
}

export interface UsersQueryParams {
  role?: UserRole
  is_active?: boolean
  q?: string
}

export interface UserAdminUpdateData {
  username?: string
  email?: string
  is_staff?: boolean
}

export interface UserRoleUpdateData {
  role: UserRole
}

export interface UserStatusUpdateData {
  is_active: boolean
}

// Product types
export type ProductCategory = 'food' | 'drink' | 'other'
export type ProductStatus = 'available' | 'unavailable' | 'deleted'
export type ProductVolume = 'small' | 'medium' | 'large'

export interface ProductImage {
  id: number
  product_id: number
  url: string
  is_primary: boolean
  sort_order: number
}

export interface Product {
  id: number
  name: string
  price: number
  volume: ProductVolume
  product_category: ProductCategory
  status: ProductStatus
  created_at: string
  updated_at: string
  images?: ProductImage[]
}

export interface ProductCreateData {
  name: string
  price: number
  volume: ProductVolume
  product_category: ProductCategory
  status?: ProductStatus
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export interface Order {
  id: number
  user_id: number
  quantity: number
  total_amount: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface OrderCreateData {
  product_ids: number[]
}

export interface OrderUpdateData {
  status: OrderStatus
}

// Cart types
export interface CartItem extends Product {
  cartQuantity: number
}

// API Response types
export interface ApiError {
  detail: string
}
