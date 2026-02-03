import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, SignUpData, SignInData, AuthResponse } from '@/types'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // Getters
  const isAdmin = computed(() => user.value?.is_staff)
  const username = computed(() => user.value?.username || '')

  // Actions
  const signup = async (data: SignUpData) => {
    const newUser = await api.signup(data)
    return newUser
  }

  const signin = async (data: SignInData) => {
    const response: AuthResponse = await api.signin(data)

    // We don't get full user data from signin, so we create a partial user
    // In a real app, you'd decode the JWT or have a /me endpoint
    console.log("response from signin:  " ,response)
    user.value = {
      id: response.user.id,
      username: response.user.username,
      email: response.user.email,
      role: response.user.role,
      is_active: true,
      is_staff: response.user.is_staff,
      created_at: response.user.created_at,
      updated_at: response.user.updated_at
    }
    isAuthenticated.value = true
    
    return response
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // Continue with logout even if API fails
    }
    user.value = null
    isAuthenticated.value = false
  }

  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const updateUserRole = (role: 'admin' | 'member') => {
    if (user.value) {
      user.value.role = role
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    // Getters
    isAdmin,
    username,
    // Actions
    signup,
    signin,
    logout,
    setUser,
    updateUserRole
  }
}, {
  persist: {
    pick: ['user', 'isAuthenticated']
  }
})
