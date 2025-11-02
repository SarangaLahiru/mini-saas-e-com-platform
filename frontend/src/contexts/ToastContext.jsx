import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast = {
      id,
      message,
      type,
      duration,
    }

    setToasts((prev) => [...prev, toast])

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Listen for custom toast events (for backwards compatibility)
  useEffect(() => {
    const handleToastEvent = (event) => {
      const { message, type, duration } = event.detail
      addToast(message, type, duration)
    }

    window.addEventListener('toast', handleToastEvent)
    return () => window.removeEventListener('toast', handleToastEvent)
  }, [addToast])

  const toast = {
    success: (message, duration = 3000) => addToast(message, 'success', duration),
    error: (message, duration = 5000) => addToast(message, 'error', duration),
    warning: (message, duration = 4000) => addToast(message, 'warning', duration),
    info: (message, duration = 4000) => addToast(message, 'info', duration),
    alert: (message, duration = 4000) => addToast(message, 'alert', duration),
  }

  // Make toast available globally for backwards compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__toast = toast
    }
  }, [toast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context.toast
}

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return typeof window !== 'undefined' && createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={removeToast}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}

// Individual Toast Item (using forwardRef to avoid warnings)
const ToastItem = React.forwardRef(({ toast, onRemove, index }, ref) => {
  const { message, type, id } = toast

  const config = {
    success: {
      icon: CheckCircle2,
      iconGradient: 'from-emerald-400 to-green-500',
      iconBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/80',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      progressColor: 'bg-gradient-to-r from-emerald-500 to-green-600',
      shadowColor: 'shadow-emerald-500/20',
      glowColor: 'shadow-emerald-500/30',
    },
    error: {
      icon: XCircle,
      iconGradient: 'from-rose-400 to-red-500',
      iconBg: 'bg-gradient-to-br from-rose-50 to-red-50',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-200/80',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      progressColor: 'bg-gradient-to-r from-rose-500 to-red-600',
      shadowColor: 'shadow-rose-500/20',
      glowColor: 'shadow-rose-500/30',
    },
    warning: {
      icon: AlertTriangle,
      iconGradient: 'from-amber-400 to-yellow-500',
      iconBg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200/80',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      progressColor: 'bg-gradient-to-r from-amber-500 to-yellow-600',
      shadowColor: 'shadow-amber-500/20',
      glowColor: 'shadow-amber-500/30',
    },
    info: {
      icon: Info,
      iconGradient: 'from-blue-400 to-indigo-500',
      iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200/80',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      progressColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
      glowColor: 'shadow-blue-500/30',
    },
    alert: {
      icon: Sparkles,
      iconGradient: 'from-orange-400 to-amber-500',
      iconBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200/80',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      progressColor: 'bg-gradient-to-r from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/20',
      glowColor: 'shadow-orange-500/30',
    },
  }

  const toastConfig = config[type] || config.info
  const Icon = toastConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 100, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        x: 0, 
        scale: 1,
      }}
      exit={{ 
        opacity: 0, 
        x: 100, 
        scale: 0.9,
        transition: { duration: 0.2, ease: 'easeIn' }
      }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        delay: index * 0.05,
      }}
      className={`
        ${toastConfig.bgColor} 
        ${toastConfig.borderColor} 
        border 
        rounded-2xl 
        shadow-2xl 
        backdrop-blur-md
        p-5 
        pointer-events-auto
        relative
        overflow-hidden
      `}
      style={{ 
        minWidth: '360px', 
        maxWidth: '420px',
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }}
      whileHover={{ 
        scale: 1.01,
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      {/* Subtle Background Gradient Effect */}
      <motion.div
        className={`absolute inset-0 ${toastConfig.iconBg} opacity-30`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 0.4 }}
      />

      {/* Left Border Accent */}
      <motion.div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${toastConfig.iconGradient}`}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      <div className="relative flex items-start gap-4">
        {/* Icon with Gradient Background */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 12, 
            stiffness: 250,
            delay: 0.1,
          }}
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg`}
          style={{
            background: type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                        type === 'error' ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' :
                        type === 'warning' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                        type === 'alert' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' :
                        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          }}
        >
          {/* Icon with White Color */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="relative text-white"
          >
            <Icon className="w-6 h-6" strokeWidth={2.5} />
          </motion.div>

          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
            className={`text-sm font-medium ${toastConfig.textColor} leading-relaxed break-words`}
            style={{ lineHeight: '1.5' }}
          >
            {message}
          </motion.p>
        </div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          onClick={() => onRemove(id)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 group"
          aria-label="Close toast"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Progress Bar */}
      <ToastProgress duration={toast.duration} color={toastConfig.progressColor} />
    </motion.div>
  )
})

ToastItem.displayName = 'ToastItem'

// Progress Bar Component with Enhanced Animation
const ToastProgress = ({ duration, color }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration <= 0) return

    const interval = 30 // Update every 30ms for smoother animation
    const decrement = (100 / duration) * interval

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement
        return next <= 0 ? 0 : next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [duration])

  return (
    <div className="mt-4 h-1 bg-gray-100/60 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full relative shadow-sm`}
        initial={{ width: '100%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.03, ease: 'linear' }}
      >
        {/* Shimmer Effect on Progress Bar */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  )
}

// Export default toast object for backwards compatibility (uses events)
export default {
  success: (message, duration = 3000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message, type: 'success', duration },
      }))
    }
  },
  error: (message, duration = 5000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message, type: 'error', duration },
      }))
    }
  },
  warning: (message, duration = 4000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message, type: 'warning', duration },
      }))
    }
  },
  info: (message, duration = 4000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message, type: 'info', duration },
      }))
    }
  },
  alert: (message, duration = 4000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message, type: 'alert', duration },
      }))
    }
  },
}
