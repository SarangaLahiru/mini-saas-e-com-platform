import React from 'react'

const CartItemSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-start space-x-3 py-4 border-b border-gray-200 last:border-b-0 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Price and quantity skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CartItemSkeleton

