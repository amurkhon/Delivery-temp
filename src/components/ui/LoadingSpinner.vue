<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  center?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  center: false
})
</script>

<template>
  <div class="loading" :class="{ center }">
    <div class="spinner" :class="[`spinner-${size}`]"></div>
  </div>
</template>

<style scoped>
.loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loading.center {
  width: 100%;
  padding: 3rem;
}

.spinner {
  border-radius: 50%;
  border: 3px solid var(--surface-light);
  border-top-color: var(--primary);
  animation: spin 0.8s linear infinite;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-md {
  width: 40px;
  height: 40px;
}

.spinner-lg {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
