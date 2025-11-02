// Toast utility - Drop-in replacement for react-hot-toast
// This file provides the same API as react-hot-toast but uses our custom toast system

const toast = {
  success: (message, duration = 3000) => {
    if (typeof window !== 'undefined') {
      // Try to use the toast from context if available
      if (window.__toast) {
        window.__toast.success(message, duration)
      } else {
        // Fallback to event system
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message, type: 'success', duration },
        }))
      }
    }
  },
  error: (message, duration = 5000) => {
    if (typeof window !== 'undefined') {
      if (window.__toast) {
        window.__toast.error(message, duration)
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message, type: 'error', duration },
        }))
      }
    }
  },
  warning: (message, duration = 4000) => {
    if (typeof window !== 'undefined') {
      if (window.__toast) {
        window.__toast.warning(message, duration)
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message, type: 'warning', duration },
        }))
      }
    }
  },
  info: (message, duration = 4000) => {
    if (typeof window !== 'undefined') {
      if (window.__toast) {
        window.__toast.info(message, duration)
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message, type: 'info', duration },
        }))
      }
    }
  },
  alert: (message, duration = 4000) => {
    if (typeof window !== 'undefined') {
      if (window.__toast) {
        window.__toast.alert(message, duration)
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message, type: 'alert', duration },
        }))
      }
    }
  },
}

export default toast

