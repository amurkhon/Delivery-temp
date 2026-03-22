import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/services/api'
import type {
  User,
  UserAdminUpdateData,
  UserRole,
  UserStatusUpdateData,
  UsersQueryParams
} from '@/types'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isMutating = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<UsersQueryParams>({ q: '' })

  const totalUsers = computed(() => users.value.length)
  const activeUsers = computed(() => users.value.filter(u => u.is_active).length)
  const adminUsers = computed(() => users.value.filter(u => u.role === 'admin').length)

  const setFilters = (next: UsersQueryParams) => {
    filters.value = {
      role: next.role,
      is_active: next.is_active,
      q: next.q ?? ''
    }
  }

  const patchUserInList = (updatedUser: User) => {
    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index > -1) {
      users.value[index] = updatedUser
    }
    if (selectedUser.value?.id === updatedUser.id) {
      selectedUser.value = updatedUser
    }
  }

  const fetchUsers = async (nextFilters?: UsersQueryParams) => {
    isLoading.value = true
    error.value = null
    try {
      if (nextFilters) {
        setFilters(nextFilters)
      }
      users.value = await api.getUsers(filters.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users'
      users.value = []
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async (userId: number) => {
    isLoading.value = true
    error.value = null
    try {
      selectedUser.value = await api.getUser(userId)
      return selectedUser.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch user'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (userId: number, payload: UserAdminUpdateData) => {
    isMutating.value = true
    error.value = null
    const previous = users.value.find(u => u.id === userId)
    try {
      const updated = await api.updateUser(userId, payload)
      patchUserInList(updated)
      return updated
    } catch (e) {
      if (previous) {
        patchUserInList(previous)
      }
      error.value = e instanceof Error ? e.message : 'Failed to update user'
      throw e
    } finally {
      isMutating.value = false
    }
  }

  const updateUserRole = async (userId: number, role: UserRole) => {
    isMutating.value = true
    error.value = null
    const previous = users.value.find(u => u.id === userId)
    try {
      const updated = await api.updateUserRole(userId, { role })
      patchUserInList(updated)
      return updated
    } catch (e) {
      if (previous) {
        patchUserInList(previous)
      }
      error.value = e instanceof Error ? e.message : 'Failed to update role'
      throw e
    } finally {
      isMutating.value = false
    }
  }

  const updateUserStatus = async (userId: number, payload: UserStatusUpdateData) => {
    isMutating.value = true
    error.value = null
    const previous = users.value.find(u => u.id === userId)
    try {
      const updated = await api.updateUserStatus(userId, payload)
      patchUserInList(updated)
      return updated
    } catch (e) {
      if (previous) {
        patchUserInList(previous)
      }
      error.value = e instanceof Error ? e.message : 'Failed to update status'
      throw e
    } finally {
      isMutating.value = false
    }
  }

  return {
    users,
    selectedUser,
    isLoading,
    isMutating,
    error,
    filters,
    totalUsers,
    activeUsers,
    adminUsers,
    setFilters,
    fetchUsers,
    fetchUser,
    updateUser,
    updateUserRole,
    updateUserStatus
  }
})
