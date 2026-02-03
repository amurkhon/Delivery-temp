<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const form = ref({
  username_or_email: '',
  password: ''
})

const errors = ref({
  username_or_email: '',
  password: ''
})

const isLoading = ref(false)

const isFormValid = computed(() => {
  return form.value.username_or_email.trim() && form.value.password.trim()
})

const validateForm = () => {
  errors.value = { username_or_email: '', password: '' }
  let valid = true

  if (!form.value.username_or_email.trim()) {
    errors.value.username_or_email = 'Email or username is required'
    valid = false
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    await authStore.signin({
      username_or_email: form.value.username_or_email.trim(),
      password: form.value.password
    })

    toast.success('Welcome back!')
    
    const redirect = route.query.redirect as string
    router.push(redirect || '/products')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
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
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your account to continue</p>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="auth-form">
          <BaseInput
            v-model="form.username_or_email"
            label="Email or Username"
            placeholder="Enter your email or username"
            :error="errors.username_or_email"
            required
          />

          <BaseInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :error="errors.password"
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
            Sign In
          </BaseButton>
        </form>

        <!-- Footer -->
        <p class="auth-footer">
          Don't have an account?
          <RouterLink to="/signup" class="auth-link">Sign up</RouterLink>
        </p>
      </BaseCard>

      <!-- Demo Credentials -->
      <div class="demo-info">
        <p class="demo-title">Demo Credentials</p>
        <p class="demo-text">Use any email/username from signup</p>
      </div>
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

.demo-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 12px;
  text-align: center;
}

.demo-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.demo-text {
  font-size: 0.8rem;
  color: var(--text-muted);
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
