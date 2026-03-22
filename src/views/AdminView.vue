<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import type { Product, ProductCreateData, ProductImage, User, UserRole } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const toast = useToast()

const showProductModal = ref(false)
const showImagesModal = ref(false)
const showEditUserModal = ref(false)
const isSubmitting = ref(false)
const isUploadingImages = ref(false)
const selectedProduct = ref<Product | null>(null)
const selectedUser = ref<User | null>(null)
const productImages = ref<ProductImage[]>([])
const imageFileInput = ref<HTMLInputElement | null>(null)
const userSearch = ref('')
const userRoleFilter = ref<'all' | UserRole>('all')
const userStatusFilter = ref<'all' | 'active' | 'inactive'>('all')

const userForm = ref({
  username: '',
  email: '',
  is_staff: false
})

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

const userRoleFilterOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'member', label: 'Member' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' }
]

const userRoleEditOptions = [
  { value: 'member', label: 'Member' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' }
]

const userStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const stats = computed(() => ({
  totalProducts: productsStore.totalProducts,
  totalOrders: ordersStore.totalOrders,
  pendingOrders: ordersStore.pendingOrders.length,
  totalRevenue: ordersStore.totalRevenue
}))

const currentUser = computed(() => authStore.user)

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchOrders(),
    usersStore.fetchUsers()
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

const openImagesModal = async (product: Product) => {
  selectedProduct.value = product
  showImagesModal.value = true
  try {
    productImages.value = await productsStore.fetchProductImages(product.id)
  } catch {
    productImages.value = product.images || []
  }
}

const closeImagesModal = () => {
  showImagesModal.value = false
  selectedProduct.value = null
  productImages.value = []
  imageFileInput.value = null
}

const triggerFileInput = () => {
  imageFileInput.value?.click()
}

const handleImageFilesSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length || !selectedProduct.value) return

  const validFiles = Array.from(files).filter(f =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
  )
  if (validFiles.length === 0) {
    toast.warning('Please select JPEG, PNG or WebP images')
    return
  }

  isUploadingImages.value = true
  try {
    await productsStore.uploadProductImages(selectedProduct.value.id, validFiles)
    productImages.value = await productsStore.fetchProductImages(selectedProduct.value.id)
    toast.success(`${validFiles.length} image(s) uploaded`)
    input.value = ''
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload images'
    toast.error(message)
  } finally {
    isUploadingImages.value = false
  }
}

const handleDeleteImage = async (imageId: number) => {
  if (!selectedProduct.value || !confirm('Delete this image?')) return
  try {
    await productsStore.deleteProductImage(selectedProduct.value.id, imageId)
    productImages.value = productImages.value.filter(img => img.id !== imageId)
    toast.success('Image deleted')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete image'
    toast.error(message)
  }
}

const handleSetPrimary = async (imageId: number) => {
  if (!selectedProduct.value) return
  try {
    await productsStore.setProductImagePrimary(selectedProduct.value.id, imageId)
    productImages.value = productImages.value.map(img =>
      ({ ...img, is_primary: img.id === imageId })
    )
    toast.success('Primary image updated')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set primary'
    toast.error(message)
  }
}

const getImageUrl = (url: string) => api.getImageUrl(url)

const hasStaffAccess = (user: User) => user.is_staff || user.role === 'staff' || user.role === 'admin'

const syncCurrentUser = (user: User) => {
  if (currentUser.value?.id === user.id) {
    authStore.setUser(user)
  }
}

const fetchUsers = async () => {
  await usersStore.fetchUsers({
    role: userRoleFilter.value === 'all' ? undefined : userRoleFilter.value,
    is_active:
      userStatusFilter.value === 'all'
        ? undefined
        : userStatusFilter.value === 'active',
    q: userSearch.value.trim() || undefined
  })
}

const resetUserFilters = async () => {
  userSearch.value = ''
  userRoleFilter.value = 'all'
  userStatusFilter.value = 'all'
  await fetchUsers()
}

const openEditUserModal = (user: User) => {
  selectedUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    is_staff: user.is_staff
  }
  showEditUserModal.value = true
}

const closeEditUserModal = () => {
  selectedUser.value = null
  showEditUserModal.value = false
}

const handleUpdateUser = async () => {
  if (!selectedUser.value) return

  const payload: { username?: string; email?: string; is_staff?: boolean } = {}
  const username = userForm.value.username.trim()
  const email = userForm.value.email.trim()

  if (username && username !== selectedUser.value.username) payload.username = username
  if (email && email !== selectedUser.value.email) payload.email = email
  if (userForm.value.is_staff !== selectedUser.value.is_staff) {
    if (selectedUser.value.id === currentUser.value?.id && !userForm.value.is_staff) {
      toast.warning('You cannot remove your own staff flag')
      return
    }
    payload.is_staff = userForm.value.is_staff
  }

  if (Object.keys(payload).length === 0) {
    toast.warning('No changes to save')
    return
  }

  try {
    const updated = await usersStore.updateUser(selectedUser.value.id, payload)
    syncCurrentUser(updated)
    toast.success('User updated successfully')
    closeEditUserModal()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user'
    toast.error(message)
  }
}

const handleChangeUserRole = async (user: User, value: string | number) => {
  const role = String(value) as UserRole

  if (role === user.role) return

  if (user.id === currentUser.value?.id) {
    toast.warning('You cannot change your own role')
    return
  }

  try {
    const updated = await usersStore.updateUserRole(user.id, role)
    console.log("updated: ", updated)
    syncCurrentUser(updated)
    toast.success(`Role updated to ${role}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update role'
    toast.error(message)
  }
}

const handleToggleUserStatus = async (user: User) => {
  const nextStatus = !user.is_active
  if (user.id === currentUser.value?.id && !nextStatus) {
    toast.warning('You cannot deactivate your own account')
    return
  }

  try {
    const updated = await usersStore.updateUserStatus(user.id, { is_active: nextStatus })
    syncCurrentUser(updated)
    toast.success(`User ${nextStatus ? 'activated' : 'deactivated'}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update status'
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
                <th>Images</th>
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
                    size="sm"
                    variant="secondary"
                    @click="openImagesModal(product)"
                  >
                    {{ (product.images?.length || 0) }} 📷
                  </BaseButton>
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

      <BaseCard class="users-card">
        <div class="card-header users-header">
          <h2 class="card-title">Users Management</h2>
          <div class="users-tools">
            <BaseButton variant="secondary" size="sm" @click="resetUserFilters">
              Reset
            </BaseButton>
            <BaseButton size="sm" @click="fetchUsers">
              Apply Filters
            </BaseButton>
          </div>
        </div>

        <div class="users-filters">
          <BaseInput
            v-model="userSearch"
            label="Search"
            placeholder="Username or email"
          />
          <BaseSelect
            v-model="userRoleFilter"
            :options="userRoleFilterOptions"
            label="Role"
          />
          <BaseSelect
            v-model="userStatusFilter"
            :options="userStatusOptions"
            label="Status"
          />
        </div>

        <div v-if="usersStore.isLoading" class="loading-container">
          <LoadingSpinner size="lg" center />
        </div>

        <div v-else-if="usersStore.users.length === 0">
          <EmptyState
            icon="👥"
            title="No users found"
            description="Try changing your filters or search query"
          />
        </div>

        <div v-else class="products-table-container">
          <table class="products-table users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersStore.users" :key="user.id">
                <td>#{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <BaseSelect
                    :model-value="user.role"
                    :options="userRoleEditOptions"
                    @update:model-value="handleChangeUserRole(user, $event)"
                  />
                </td>
                <td>
                  <span class="status-badge" :class="hasStaffAccess(user) ? 'status-available' : 'status-unavailable'">
                    {{ hasStaffAccess(user) ? 'Staff' : 'No' }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="user.is_active ? 'status-available' : 'status-deleted'">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="user-actions">
                    <BaseButton size="sm" variant="secondary" @click="openEditUserModal(user)">
                      Edit
                    </BaseButton>
                    <BaseButton
                      size="sm"
                      :variant="user.is_active ? 'danger' : 'success'"
                      @click="handleToggleUserStatus(user)"
                    >
                      {{ user.is_active ? 'Deactivate' : 'Activate' }}
                    </BaseButton>
                  </div>
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

    <!-- Image Management Modal -->
    <BaseModal
      v-model="showImagesModal"
      :title="`Manage Images: ${selectedProduct?.name ?? ''}`"
      size="lg"
    >
      <div v-if="selectedProduct" class="images-management">
        <input
          ref="imageFileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="hidden-input"
          @change="handleImageFilesSelected"
        />
        <div class="upload-zone" @click="triggerFileInput">
          <span v-if="!isUploadingImages">📤 Click to upload images (JPEG, PNG, WebP)</span>
          <span v-else>Uploading...</span>
        </div>
        <div v-if="productImages.length" class="images-grid">
          <div
            v-for="img in productImages"
            :key="img.id"
            class="image-item"
            :class="{ primary: img.is_primary }"
          >
            <img :src="getImageUrl(img.url)" :alt="`Product image ${img.id}`" class="image-preview" />
            <div class="image-actions">
              <BaseButton
                v-if="!img.is_primary"
                size="sm"
                @click="handleSetPrimary(img.id)"
              >
                Set Primary
              </BaseButton>
              <span v-else class="primary-badge">Primary</span>
              <BaseButton
                variant="danger"
                size="sm"
                @click="handleDeleteImage(img.id)"
              >
                Delete
              </BaseButton>
            </div>
          </div>
        </div>
        <p v-else class="no-images">No images yet. Upload some above.</p>
      </div>
      <template #footer>
        <BaseButton @click="closeImagesModal">Close</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showEditUserModal"
      :title="`Edit User: ${selectedUser?.username ?? ''}`"
      size="md"
    >
      <form @submit.prevent="handleUpdateUser">
        <BaseInput
          v-model="userForm.username"
          label="Username"
          placeholder="Enter username"
          required
        />

        <BaseInput
          v-model="userForm.email"
          type="email"
          label="Email"
          placeholder="Enter email"
          required
        />

        <label class="staff-checkbox">
          <input v-model="userForm.is_staff" type="checkbox" />
          <span>Staff privileges</span>
        </label>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="closeEditUserModal">
          Cancel
        </BaseButton>
        <BaseButton :loading="usersStore.isMutating" @click="handleUpdateUser">
          Save Changes
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

.users-card {
  margin-top: 2rem;
  padding: 0;
  overflow: hidden;
}

.users-header {
  gap: 1rem;
}

.users-tools {
  display: flex;
  gap: 0.75rem;
}

.users-filters {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem 0;
}

.users-table td :deep(.form-group) {
  margin-bottom: 0;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.staff-checkbox {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.staff-checkbox input {
  width: 16px;
  height: 16px;
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
  .users-filters {
    grid-template-columns: 1fr;
  }

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

  .users-tools {
    width: 100%;
  }

  .user-actions {
    flex-direction: column;
  }
}

.hidden-input {
  display: none;
}

.images-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-zone {
  padding: 2rem;
  border: 2px dashed var(--border);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: var(--transition);
}

.upload-zone:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--border);
}

.image-item.primary {
  border-color: var(--primary);
}

.image-preview {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.image-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--surface-light);
}

.primary-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  padding: 0.25rem 0.5rem;
}

.no-images {
  color: var(--text-muted);
  text-align: center;
  padding: 1rem;
}
</style>
