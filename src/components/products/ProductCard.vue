<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const cartStore = useCartStore()
const toast = useToast()
const currentImageIndex = ref(0)

const sortedImages = computed(() => {
  const images = props.product.images || []
  if (!images.length) return []
  return [...images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return a.sort_order - b.sort_order
  })
})

const currentImageUrl = computed(() => {
  const images = sortedImages.value
  if (!images.length) return null
  const img = images[currentImageIndex.value] || images[0]
  return api.getImageUrl(img.url)
})

const hasMultipleImages = computed(() => sortedImages.value.length > 1)

const showPrevImage = () => {
  const len = sortedImages.value.length
  if (len > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + len) % len
  }
}

const showNextImage = () => {
  const len = sortedImages.value.length
  if (len > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % len
  }
}

watch(() => props.product.id, () => {
  currentImageIndex.value = 0
})

const categoryIcon = computed(() => {
  const icons: Record<string, string> = {
    food: '🍔',
    drink: '🥤',
    other: '📦'
  }
  return icons[props.product.product_category] || '📦'
})

const volumeLabel = computed(() => {
  const labels: Record<string, string> = {
    small: 'S',
    medium: 'M',
    large: 'L'
  }
  return labels[props.product.volume] || 'M'
})

const volumeText = computed(() => {
  const texts: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  }
  return texts[props.product.volume] || 'Medium'
})

const isInCart = computed(() => cartStore.isInCart(props.product.id))
const cartQuantity = computed(() => cartStore.getItemQuantity(props.product.id))
const isAvailable = computed(() => props.product.status === 'available')

const formatPrice = (price: number) => {
  return '$' + price.toFixed(2)
}

const addToCart = () => {
  const added = cartStore.addItem(props.product)
  if (added) {
    toast.success(`${props.product.name} added to cart`)
  }
}

const incrementQuantity = () => {
  cartStore.incrementQuantity(props.product.id)
}

const decrementQuantity = () => {
  cartStore.decrementQuantity(props.product.id)
}
</script>

<template>
  <div class="product-card" :class="{ unavailable: !isAvailable }">
    <div class="product-image">
      <img
        v-if="currentImageUrl"
        :src="currentImageUrl"
        :alt="product.name"
        class="product-photo"
      />
      <span v-else class="product-icon">{{ categoryIcon }}</span>
      <button
        v-if="hasMultipleImages"
        type="button"
        class="carousel-btn carousel-prev"
        aria-label="Previous image"
        @click.stop="showPrevImage"
      >
        ‹
      </button>
      <button
        v-if="hasMultipleImages"
        type="button"
        class="carousel-btn carousel-next"
        aria-label="Next image"
        @click.stop="showNextImage"
      >
        ›
      </button>
      <div v-if="hasMultipleImages" class="carousel-dots">
        <button
          v-for="(_, i) in sortedImages"
          :key="i"
          type="button"
          class="carousel-dot"
          :class="{ active: i === currentImageIndex }"
          :aria-label="`Go to image ${i + 1}`"
          @click.stop="currentImageIndex = i"
        />
      </div>
      <span class="product-category">{{ product.product_category }}</span>
      <span class="product-volume">{{ volumeLabel }}</span>
    </div>
    
    <div class="product-body">
      <h3 class="product-name">{{ product.name }}</h3>
      
      <div class="product-meta">
        <span class="product-price">{{ formatPrice(product.price) }}</span>
        <span class="product-size">{{ volumeText }}</span>
      </div>
      
      <div class="product-actions">
        <template v-if="!isAvailable">
          <BaseButton disabled block>
            Unavailable
          </BaseButton>
        </template>
        <template v-else-if="!isInCart">
          <BaseButton @click="addToCart" block>
            Add to Cart
          </BaseButton>
        </template>
        <template v-else>
          <div class="quantity-controls">
            <button class="qty-btn" @click="decrementQuantity">−</button>
            <span class="qty-value">{{ cartQuantity }}</span>
            <button class="qty-btn" @click="incrementQuantity">+</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: var(--transition);
}

.product-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.product-card.unavailable {
  opacity: 0.6;
}

.product-card.unavailable:hover {
  transform: none;
  border-color: var(--border);
}

.product-image {
  position: relative;
  height: 240px;
  background: linear-gradient(135deg, var(--surface-light) 0%, var(--surface) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-icon {
  font-size: 4rem;
}

.product-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.35rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: capitalize;
}

.product-volume {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  z-index: 2;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-prev {
  left: 0.5rem;
}

.carousel-next {
  right: 0.5rem;
}

.carousel-dots {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.35rem;
  z-index: 2;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: var(--transition);
}

.carousel-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.carousel-dot.active {
  background: white;
  width: 10px;
  height: 10px;
}

.product-body {
  padding: 1.25rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--secondary);
}

.product-size {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  padding: 0.25rem 0.75rem;
  background: var(--surface-light);
  border-radius: 20px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--surface-light);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.5rem;
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.qty-btn:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}
</style>
