<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/products')
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="not-found-icon">🔍</div>
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">Page Not Found</h2>
      <p class="not-found-description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <BaseButton @click="goHome" size="lg">
        Go to Homepage
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.not-found-code {
  font-size: 6rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.75rem;
}

.not-found-description {
  color: var(--text-muted);
  margin-bottom: 2rem;
}
</style>
