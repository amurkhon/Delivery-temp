<script setup lang="ts">
interface Props {
  padding?: boolean
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true,
  hoverable: false
})
</script>

<template>
  <div class="card" :class="{ 'card-padding': padding, 'card-hoverable': hoverable }">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  transition: var(--transition);
}

.card-padding {
  padding: 1.5rem;
}

.card-hoverable:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .card-padding {
    padding: 1rem;
  }
}
</style>
