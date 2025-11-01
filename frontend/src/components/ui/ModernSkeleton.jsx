import React from 'react'
import { motion } from 'framer-motion'

/**
 * Modern Skeleton Component with Shimmer Effect
 * Professional loading state with smooth animations
 */
const ModernSkeleton = ({
  variant = 'text',
  className = '',
  lines = 1,
  width = 'w-full',
  height = 'h-4',
  rounded = true,
}) => {
  const baseClasses = `${rounded ? 'rounded-lg' : ''} relative overflow-hidden bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${width} ${height} ${className}`

  // Add enhanced shimmer animation styles
  React.useEffect(() => {
    const styleId = 'modern-shimmer-animation-style'
    if (document.getElementById(styleId)) return // Already added
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes modernShimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .modern-shimmer {
        background: linear-gradient(
          90deg,
          #f3f4f6 0%,
          #e5e7eb 20%,
          #f9fafb 40%,
          #e5e7eb 60%,
          #f3f4f6 80%,
          #f3f4f6 100%
        );
        background-size: 200% 100%;
        animation: modernShimmer 1.5s ease-in-out infinite;
      }
      .modern-shimmer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.6),
          transparent
        );
        animation: modernShimmer 1.5s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) document.head.removeChild(existingStyle)
    }
  }, [])

  if (lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} modern-shimmer`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.08,
              duration: 0.4,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={`${baseClasses} modern-shimmer`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  )
}

// Specific Skeleton Variants
ModernSkeleton.Card = ({ className = '', children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
  >
    {children || (
      <>
        <ModernSkeleton variant="text" width="w-1/3" height="h-6" className="mb-4" />
        <ModernSkeleton variant="text" lines={3} className="mb-4" />
        <ModernSkeleton variant="button" width="w-24" height="h-10" />
      </>
    )}
  </motion.div>
)

ModernSkeleton.Form = ({ fields = 5, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index}>
        <ModernSkeleton width="w-1/4" height="h-4" className="mb-2" />
        <ModernSkeleton width="w-full" height="h-12" />
      </div>
    ))}
  </div>
)

ModernSkeleton.Product = ({ className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}
  >
    <ModernSkeleton variant="image" width="w-full" height="h-48" rounded={false} className="rounded-t-xl" />
    <div className="p-4 space-y-3">
      <ModernSkeleton width="w-3/4" height="h-5" className="mb-1" />
      <ModernSkeleton width="w-1/2" height="h-4" className="mb-2" />
      <ModernSkeleton width="w-1/3" height="h-6" />
    </div>
  </motion.div>
)

ModernSkeleton.Avatar = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }
  return (
    <ModernSkeleton
      variant="circle"
      width={sizes[size]}
      height={sizes[size]}
      className={`rounded-full ${className}`}
    />
  )
}

ModernSkeleton.Button = ({ width = 'w-24', height = 'h-10', className = '' }) => (
  <ModernSkeleton width={width} height={height} className={className} />
)

ModernSkeleton.Table = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}>
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <ModernSkeleton key={i} width="w-24" height="h-4" />
        ))}
      </div>
    </div>
    <div className="bg-white divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <ModernSkeleton key={colIndex} width="w-24" height="h-4" />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export default ModernSkeleton

