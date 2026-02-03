import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const showToast = (message: string, type: Toast['type'] = 'success', duration = 4000) => {
    const id = ++toastId
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string) => showToast(message, 'success')
  const error = (message: string) => showToast(message, 'error')
  const warning = (message: string) => showToast(message, 'warning')
  const info = (message: string) => showToast(message, 'info')

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
