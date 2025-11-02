import React from 'react'
import { motion } from 'framer-motion'
import { Folder, Image as ImageIcon } from 'lucide-react'

// Shimmer animation style
const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
}

// Add shimmer keyframe animation
if (typeof document !== 'undefined' && !document.getElementById('header-shimmer-style')) {
  const style = document.createElement('style')
  style.id = 'header-shimmer-style'
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
  document.head.appendChild(style)
}

// Category Item Skeleton
export const CategorySkeleton = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 bg-white"
  >
    {/* Image skeleton */}
    <div 
      className="w-10 h-10 rounded-lg flex-shrink-0 relative overflow-hidden"
      style={shimmerStyle}
    />
    
    {/* Text skeleton */}
    <div className="flex-1 min-w-0 space-y-2">
      <div 
        className="h-4 rounded"
        style={{ ...shimmerStyle, width: '70%' }}
      />
      <div 
        className="h-3 rounded"
        style={{ ...shimmerStyle, width: '40%' }}
      />
    </div>
  </motion.div>
)

// Category List Skeleton
export const CategoryListSkeleton = ({ count = 8 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <CategorySkeleton key={index} index={index} />
    ))}
  </div>
)

// Product Card Skeleton for Mega Menu
export const MegaMenuProductSkeleton = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
  >
    {/* Image skeleton */}
    <div 
      className="w-full h-40 rounded-lg mb-3 relative overflow-hidden"
      style={shimmerStyle}
    />
    
    {/* Title skeleton */}
    <div 
      className="h-4 rounded mb-2"
      style={{ ...shimmerStyle, width: '85%' }}
    />
    
    {/* Price skeleton */}
    <div 
      className="h-5 rounded mt-3"
      style={{ ...shimmerStyle, width: '40%' }}
    />
  </motion.div>
)

// Products Grid Skeleton for Mega Menu
export const MegaMenuProductsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <MegaMenuProductSkeleton key={index} index={index} />
    ))}
  </div>
)

// Mega Menu Full Skeleton
export const MegaMenuSkeleton = () => (
  <div className="flex h-[450px] gap-6">
    {/* Left Side - Categories List Skeleton */}
    <div className="w-1/4 border-r border-gray-200 bg-gray-50 rounded-lg overflow-y-auto">
      <div className="p-5">
        {/* Header skeleton */}
        <div className="mb-5">
          <div 
            className="h-5 rounded mb-2"
            style={{ ...shimmerStyle, width: '60%' }}
          />
        </div>
        
        {/* Categories skeleton */}
        <CategoryListSkeleton count={10} />
      </div>
    </div>

    {/* Right Side - Products Skeleton */}
    <div className="flex-1 bg-white rounded-lg overflow-y-auto">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
          <div className="space-y-2">
            <div 
              className="h-8 rounded"
              style={{ ...shimmerStyle, width: '50%' }}
            />
            <div 
              className="h-4 rounded"
              style={{ ...shimmerStyle, width: '30%' }}
            />
          </div>
          <div 
            className="h-10 rounded-lg"
            style={{ ...shimmerStyle, width: '120px' }}
          />
        </div>

        {/* Products grid skeleton */}
        <MegaMenuProductsSkeleton count={4} />
      </div>
    </div>
  </div>
)

// Navigation Tab Button Skeleton
export const NavigationTabSkeleton = () => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
    <div 
      className="w-4 h-4 rounded"
      style={shimmerStyle}
    />
    <div 
      className="h-4 rounded"
      style={{ ...shimmerStyle, width: '100px' }}
    />
  </div>
)

// User Avatar Skeleton
export const UserAvatarSkeleton = () => (
  <div className="flex items-center gap-3">
    <div 
      className="w-10 h-10 rounded-full"
      style={shimmerStyle}
    />
    <div className="space-y-2 hidden sm:block">
      <div 
        className="h-4 rounded"
        style={{ ...shimmerStyle, width: '80px' }}
      />
      <div 
        className="h-3 rounded"
        style={{ ...shimmerStyle, width: '120px' }}
      />
    </div>
  </div>
)

export default {
  CategorySkeleton,
  CategoryListSkeleton,
  MegaMenuProductSkeleton,
  MegaMenuProductsSkeleton,
  MegaMenuSkeleton,
  NavigationTabSkeleton,
  UserAvatarSkeleton,
}

