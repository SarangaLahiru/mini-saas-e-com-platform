import React from 'react'
import { motion } from 'framer-motion'

const SkeletonLoader = ({ 
  type = 'text', 
  width = '100%', 
  height = '20px', 
  className = '',
  count = 1 
}) => {
  const skeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <motion.div
            variants={skeletonVariants}
            animate="animate"
            className={`bg-gray-200 rounded ${className}`}
            style={{ width, height }}
          />
        )
      case 'circle':
        return (
          <motion.div
            variants={skeletonVariants}
            animate="animate"
            className={`bg-gray-200 rounded-full ${className}`}
            style={{ width, height }}
          />
        )
      case 'card':
        return (
          <motion.div
            variants={skeletonVariants}
            animate="animate"
            className={`bg-gray-200 rounded-lg p-4 ${className}`}
            style={{ width, height }}
          >
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </motion.div>
        )
      case 'form':
        return (
          <motion.div
            variants={skeletonVariants}
            animate="animate"
            className={`bg-gray-200 rounded-lg p-6 ${className}`}
            style={{ width, height }}
          >
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>
            {renderSkeleton()}
          </div>
        ))}
      </div>
    )
  }

  return renderSkeleton()
}

export default SkeletonLoader
