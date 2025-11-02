import React from 'react'
import { motion } from 'framer-motion'

// Shimmer animation class
const shimmerClass = 'bg-gray-200 animate-pulse'

// Search Bar Skeleton
export const SearchBarSkeleton = ({ scrolled = false }) => (
  <motion.div
    className="relative w-full"
    animate={{
      scale: scrolled ? 1.05 : 1,
    }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <div className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg ${shimmerClass}`}>
      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded ${shimmerClass}`} />
    </div>
  </motion.div>
)

// Icon Button Skeleton
export const IconButtonSkeleton = ({ scrolled = false }) => (
  <motion.div
    className="relative p-2 rounded-lg"
    animate={{
      scale: scrolled ? 0.9 : 1,
    }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <div className={`w-6 h-6 rounded ${shimmerClass}`} />
  </motion.div>
)

// User Avatar Skeleton
export const UserAvatarSkeleton = ({ scrolled = false }) => (
  <motion.div
    className="flex items-center rounded-lg overflow-hidden"
    animate={{
      padding: scrolled ? '0.25rem' : '0.5rem',
      gap: scrolled ? '0' : '0.75rem',
    }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <motion.div 
      className="relative flex-shrink-0"
      animate={{
        width: scrolled ? 36 : 40,
        height: scrolled ? 36 : 40,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className={`w-full h-full rounded-full ${shimmerClass}`} />
    </motion.div>
    <motion.div 
      className="hidden sm:block text-left flex-1 min-w-0 overflow-hidden space-y-1"
      animate={{
        opacity: scrolled ? 0 : 1,
        width: scrolled ? 0 : 'auto',
        marginLeft: scrolled ? 0 : '0.75rem',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className={`h-4 rounded ${shimmerClass}`} style={{ width: '80px' }} />
      <div className={`h-3 rounded ${shimmerClass}`} style={{ width: '120px' }} />
    </motion.div>
    <motion.div
      animate={{
        opacity: scrolled ? 0 : 1,
        width: scrolled ? 0 : 'auto',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className={`w-4 h-4 rounded ${shimmerClass}`} />
    </motion.div>
  </motion.div>
)

// Navigation Tab Skeleton
export const NavigationTabSkeleton = () => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
    <div className={`w-4 h-4 rounded ${shimmerClass}`} />
    <div className={`h-4 rounded ${shimmerClass}`} style={{ width: '100px' }} />
  </div>
)

// Full Header Skeleton
export const HeaderSkeleton = ({ scrolled = false }) => (
  <motion.header
    className={`sticky top-0 z-[100] border-b border-gray-200 ${scrolled ? 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60' : 'bg-white'}`}
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        className="flex items-center justify-between"
        animate={{ height: scrolled ? 56 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo Skeleton */}
        <motion.div
          className="flex-shrink-0 z-10"
          animate={{
            scale: scrolled ? 0.9 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="flex items-center">
            <div className={`rounded-lg flex items-center justify-center mr-3 ${shimmerClass}`} style={{ width: 32, height: 32 }} />
            <div className={`h-5 rounded ${shimmerClass}`} style={{ width: '100px' }} />
          </div>
        </motion.div>

        {/* Search Bar Skeleton - Desktop */}
        <motion.div 
          className="hidden md:flex flex-1 min-w-0"
          animate={{
            maxWidth: scrolled ? '32rem' : '28rem',
            marginLeft: scrolled ? '0.75rem' : '2rem',
            marginRight: scrolled ? '0.75rem' : '2rem',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <SearchBarSkeleton scrolled={scrolled} />
        </motion.div>

        {/* Right Side Actions Skeleton */}
        <motion.div
          className="flex items-center"
          animate={{
            gap: scrolled ? '0.5rem' : '1rem',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Mobile Search Skeleton */}
          <div className="md:hidden">
            <IconButtonSkeleton scrolled={scrolled} />
          </div>

          {/* Icons Skeleton */}
          <div className="hidden sm:inline-flex">
            <IconButtonSkeleton scrolled={scrolled} />
          </div>
          <div className="hidden sm:inline-flex">
            <IconButtonSkeleton scrolled={scrolled} />
          </div>
          <IconButtonSkeleton scrolled={scrolled} />

          {/* User Avatar Skeleton */}
          <UserAvatarSkeleton scrolled={scrolled} />
        </motion.div>

        {/* Mobile Menu Button Skeleton */}
        <div className="md:hidden">
          <IconButtonSkeleton scrolled={scrolled} />
        </div>
      </motion.div>
    </div>

    {/* Navigation Tabs Skeleton */}
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5">
          <NavigationTabSkeleton />
          <NavigationTabSkeleton />
          <NavigationTabSkeleton />
        </div>
      </div>
    </div>
  </motion.header>
)

export default HeaderSkeleton

