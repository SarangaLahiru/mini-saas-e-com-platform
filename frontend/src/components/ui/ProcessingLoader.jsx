import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernSkeleton from './ModernSkeleton'

/**
 * Modern Processing Loader Component
 * Displays a skeleton-style processing state with placeholder animations
 */
const ProcessingLoader = ({
  message = 'Processing...',
  subMessage = 'Please wait while we process your request',
  variant = 'default', // 'default', 'success', 'warning', 'error'
  showProgress = false,
  progress = 0,
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
  skeletonStyle = true, // Use skeleton style instead of spinner
}) => {
  const sizeClasses = {
    sm: { spinner: 'w-8 h-8', container: 'p-4', text: 'text-sm' },
    md: { spinner: 'w-12 h-12', container: 'p-8', text: 'text-base' },
    lg: { spinner: 'w-16 h-16', container: 'p-12', text: 'text-lg' },
  }

  const variantClasses = {
    default: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  }

  const sizes = sizeClasses[size] || sizeClasses.md
  const colorClass = variantClasses[variant] || variantClasses.default

  // Skeleton-style processing loader
  if (skeletonStyle) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`space-y-4 ${className}`}
      >
        {/* Icon/Spinner Skeleton */}
        <div className="flex justify-center mb-6">
          {variant === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center bg-opacity-10`}
            >
              <motion.svg
                className="w-10 h-10 text-success-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                  }}
                />
              </motion.svg>
            </motion.div>
          ) : (
            <div className="relative w-16 h-16">
              <ModernSkeleton width="w-16" height="h-16" className="rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ModernSkeleton width="w-8" height="h-8" className="rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar Skeleton */}
        {showProgress && (
          <div className="w-full max-w-xs mx-auto mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${colorClass} bg-current`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Message Skeleton */}
        <div className="text-center space-y-2">
          <ModernSkeleton width="w-48" height="h-6" className="mx-auto" />
          {subMessage && (
            <ModernSkeleton width="w-64" height="h-4" className="mx-auto" />
          )}
        </div>

        {/* Processing Indicator */}
        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-gray-300 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    )
  }

  // Original spinner style (for backward compatibility)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center ${sizes.container} ${className}`}
    >
      {/* Animated Spinner Container or Success Icon */}
      <div className={`relative ${sizes.spinner} mb-6`}>
        {variant === 'success' ? (
          // Success checkmark animation
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className={`w-full h-full ${colorClass} rounded-full flex items-center justify-center bg-opacity-10`}
          >
            <motion.svg
              className={`${sizes.spinner === 'w-8 h-8' ? 'w-6 h-6' : sizes.spinner === 'w-12 h-12' ? 'w-8 h-8' : 'w-12 h-12'} ${colorClass}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              />
            </motion.svg>
          </motion.div>
        ) : (
          <>
            {/* Outer Rotating Circle */}
            <motion.div
              className={`absolute inset-0 border-4 border-gray-200 rounded-full`}
            />
            <motion.div
              className={`absolute inset-0 border-4 ${colorClass} border-t-transparent rounded-full`}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Inner Pulsing Circle */}
            <motion.div
              className={`absolute inset-2 ${colorClass} bg-opacity-20 rounded-full`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Center Dot */}
            <motion.div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 ${colorClass} bg-current rounded-full`}
              animate={{
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${colorClass} bg-current`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`font-semibold ${sizes.text} ${colorClass} mb-2`}
        >
          {message}
        </motion.p>
        {subMessage && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-sm text-gray-600`}
          >
            {subMessage}
          </motion.p>
        )}
      </div>

      {/* Animated Dots */}
      <motion.div
        className="flex space-x-1 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 ${colorClass} bg-current rounded-full`}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

/**
 * Processing Steps Component
 * Shows step-by-step processing with checkmarks
 */
ProcessingLoader.Steps = ({
  steps = [],
  currentStep = 0,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        const isPending = index > currentStep

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            {/* Step Indicator */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-success-600 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              ) : isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
                />
              ) : (
                <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ProcessingLoader

