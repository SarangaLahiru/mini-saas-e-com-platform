import React from 'react'
import { motion } from 'framer-motion'

const SkeletonCard = ({ 
  variant = 'product',
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showPrice = true,
  showButton = true
}) => {
  const variants = {
    product: {
      image: 'aspect-square',
      title: 'h-4 w-3/4',
      description: 'h-3 w-full',
      price: 'h-5 w-1/3',
      button: 'h-10 w-full'
    },
    user: {
      image: 'w-12 h-12 rounded-full',
      title: 'h-4 w-24',
      description: 'h-3 w-32',
      price: 'h-3 w-20',
      button: 'h-8 w-20'
    },
    category: {
      image: 'aspect-video',
      title: 'h-5 w-32',
      description: 'h-3 w-24',
      price: 'h-4 w-20',
      button: 'h-8 w-24'
    }
  }

  const currentVariant = variants[variant] || variants.product

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {/* Image Skeleton */}
      {showImage && (
        <div className="mb-4">
          <div className={`bg-gray-200 rounded-lg animate-pulse ${currentVariant.image}`} />
        </div>
      )}

      {/* Content Skeleton */}
      <div className="space-y-3">
        {/* Title Skeleton */}
        {showTitle && (
          <div className={`bg-gray-200 rounded animate-pulse ${currentVariant.title}`} />
        )}

        {/* Description Skeleton */}
        {showDescription && (
          <div className="space-y-2">
            <div className={`bg-gray-200 rounded animate-pulse ${currentVariant.description}`} />
            <div className={`bg-gray-200 rounded animate-pulse h-3 w-2/3`} />
          </div>
        )}

        {/* Price Skeleton */}
        {showPrice && (
          <div className={`bg-gray-200 rounded animate-pulse ${currentVariant.price}`} />
        )}

        {/* Button Skeleton */}
        {showButton && (
          <div className={`bg-gray-200 rounded animate-pulse ${currentVariant.button}`} />
        )}
      </div>
    </motion.div>
  )
}

export default SkeletonCard
