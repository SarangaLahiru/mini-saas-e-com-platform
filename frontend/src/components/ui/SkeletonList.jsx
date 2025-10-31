import React from 'react'
import { motion } from 'framer-motion'
import SkeletonCard from './SkeletonCard'

const SkeletonList = ({ 
  count = 4,
  variant = 'product',
  className = '',
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}) => {
  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonCard variant={variant} />
        </motion.div>
      ))}
    </div>
  )
}

export default SkeletonList
