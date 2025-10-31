import React from 'react'
import { motion } from 'framer-motion'

const Skeleton = ({ 
  variant = 'text', 
  className = '', 
  lines = 1,
  height = 'h-4',
  width = 'w-full'
}) => {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  
  const variants = {
    text: `${baseClasses} ${height} ${width}`,
    card: `${baseClasses} h-32 w-full`,
    avatar: `${baseClasses} h-10 w-10 rounded-full`,
    button: `${baseClasses} h-10 w-24`,
    image: `${baseClasses} h-48 w-full`,
    table: `${baseClasses} h-12 w-full`,
  }

  const classes = `${variants[variant]} ${className}`

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={classes}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}

// Specific skeleton components
Skeleton.Product = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
    <Skeleton variant="image" className="h-48 w-full mb-4" />
    <Skeleton variant="text" className="h-4 w-3/4 mb-2" />
    <Skeleton variant="text" className="h-4 w-1/2 mb-2" />
    <Skeleton variant="text" className="h-6 w-1/3" />
  </div>
)

Skeleton.Card = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <Skeleton variant="text" className="h-6 w-1/3 mb-4" />
    <Skeleton variant="text" lines={3} className="mb-4" />
    <Skeleton variant="button" className="h-10 w-24" />
  </div>
)

Skeleton.Table = ({ rows = 5, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
    <div className="p-6">
      <Skeleton variant="text" className="h-6 w-1/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton variant="avatar" />
            <Skeleton variant="text" className="h-4 w-1/3" />
            <Skeleton variant="text" className="h-4 w-1/4" />
            <Skeleton variant="text" className="h-4 w-1/6" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

Skeleton.List = ({ items = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-4 w-1/2 mb-2" />
          <Skeleton variant="text" className="h-3 w-1/3" />
        </div>
        <Skeleton variant="button" />
      </div>
    ))}
  </div>
)

export default Skeleton