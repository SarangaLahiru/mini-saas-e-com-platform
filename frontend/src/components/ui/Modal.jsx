import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Prevent background scrolling on mobile
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[98vw]',
  }
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Render modal using portal to body, ensuring it's above everything
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{ 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            position: 'fixed'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        
        {/* Modal Container */}
        <div className="relative flex min-h-screen items-start justify-center p-4 sm:p-6 py-8">
          <motion.div
            className={clsx(
              'relative bg-white rounded-xl shadow-strong w-full flex flex-col',
              sizeClasses[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: '90vh',
              minHeight: 'auto'
            }}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white rounded-t-xl z-10">
                <h3 className="text-xl font-bold text-gray-900">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}
            
            <div 
              className="p-6 overflow-y-auto flex-1"
              style={{ 
                maxHeight: title ? 'calc(90vh - 88px)' : 'calc(90vh - 48px)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
