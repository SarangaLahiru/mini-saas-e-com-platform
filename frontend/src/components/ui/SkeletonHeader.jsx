import React from 'react'
import { motion } from 'framer-motion'

const SkeletonHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Skeleton */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mr-2" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Search Bar Skeleton - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Right Side Actions Skeleton */}
          <div className="flex items-center space-x-4">
            {/* Search - Mobile */}
            <div className="md:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />

            {/* Notifications */}
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />

            {/* Cart */}
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />

            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default SkeletonHeader
