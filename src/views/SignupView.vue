<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirm_password: ''
})

const errors = ref({
  username: '',
  email: '',
  password: '',
  confirm_password: ''
})

const isLoading = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.username.trim() &&
    form.value.email.trim() &&
    form.value.password &&
    form.value.confirm_password
  )
})

const validateForm = () => {
  errors.value = { username: '', email: '', password: '', confirm_password: '' }
  let valid = true

  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
    valid = false
  } else if (form.value.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
    valid = false
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
    valid = false
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
    valid = false
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    valid = false
  }

  if (!form.value.confirm_password) {
    errors.value.confirm_password = 'Please confirm your password'
    valid = false
  } else if (form.value.password !== form.value.confirm_password) {
    errors.value.confirm_password = 'Passwords do not match'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    await authStore.signup({
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      confirm_password: form.value.confirm_password,
      role: 'member'
    })

    toast.success('Account created successfully! Please sign in.')
    router.push('/login')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <BaseCard class="auth-card">
        <!-- Logo -->
        <div class="auth-logo">
          <div class="logo-icon">🚀</div>
          <span class="logo-text">Delivery</span>
        </div>

        <!-- Title -->
        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Sign up to get started with Delivery</p>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="auth-form">
          <BaseInput
            v-model="form.username"
            label="Username"
            placeholder="Choose a username"
            :error="errors.username"
            required
          />

          <BaseInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            :error="errors.email"
            required
          />

          <BaseInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Create a password"
            :error="errors.password"
            required
          />

          <BaseInput
            v-model="form.confirm_password"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            :error="errors.confirm_password"
            required
          />

          <BaseButton
            type="submit"
            :loading="isLoading"
            :disabled="!isFormValid"
            block
            size="lg"
            class="submit-btn"
          >
            Create Account
          </BaseButton>
        </form>

        <!-- Footer -->
        <p class="auth-footer">
          Already have an account?
          <RouterLink to="/login" class="auth-link">Sign in</RouterLink>
        </p>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%);
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-card {
  padding: 2.5rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.submit-btn {
  margin-top: 0.5rem;
}

.auth-footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.auth-link {
  color: var(--primary-light);
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
}

.auth-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .auth-title {
    font-size: 1.5rem;
  }
}
</style>
