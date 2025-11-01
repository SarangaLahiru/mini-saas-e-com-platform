import React from 'react'
import { motion } from 'framer-motion'
import ModernSkeleton from './ModernSkeleton'

/**
 * Page-specific skeleton loaders
 * Provides skeleton layouts for different page types
 */
const PageSkeleton = () => {
  return <FullPage />
}

// Full page skeleton with header
const FullPage = ({ showHeader = true, showFooter = false }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="min-h-screen bg-gray-50 w-full"
    style={{ 
      width: '100%',
      minHeight: '100vh',
      overflow: 'hidden'
    }}
  >
    {showHeader && (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <ModernSkeleton width="w-32" height="h-8" className="rounded-md" />
            <div className="flex items-center space-x-4">
              <ModernSkeleton width="w-10" height="h-10" className="rounded-full" />
              <ModernSkeleton width="w-24" height="h-10" className="rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ModernSkeleton width="w-64" height="h-10" className="mb-8 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ModernSkeleton.Card key={i}>
            <ModernSkeleton width="w-full" height="h-48" className="mb-4 rounded-lg" />
            <ModernSkeleton width="w-3/4" height="h-5" className="mb-2 rounded" />
            <ModernSkeleton width="w-1/2" height="h-4" className="mb-4 rounded" />
            <div className="flex items-center justify-between mt-4">
              <ModernSkeleton width="w-20" height="h-6" className="rounded" />
              <ModernSkeleton width="w-24" height="h-10" className="rounded-md" />
            </div>
          </ModernSkeleton.Card>
        ))}
      </div>
    </div>
    {showFooter && (
      <div className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <ModernSkeleton width="w-24" height="h-5" className="mb-3 rounded" />
                <ModernSkeleton width="w-full" height="h-4" lines={3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </motion.div>
)

// Product detail page skeleton
const ProductDetail = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <ModernSkeleton width="w-full" height="h-96" className="mb-4 rounded-xl" />
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <ModernSkeleton key={i} width="w-20" height="h-20" className="rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div>
          <ModernSkeleton width="w-3/4" height="h-8" className="mb-4" />
          <ModernSkeleton width="w-1/2" height="h-6" className="mb-6" />
          <ModernSkeleton width="w-full" height="h-4" lines={4} className="mb-6" />
          <ModernSkeleton.Button width="w-full" height="h-12" className="mb-4" />
          <div className="flex space-x-4">
            <ModernSkeleton.Button width="w-32" height="h-10" />
            <ModernSkeleton.Button width="w-32" height="h-10" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Products listing page skeleton
const ProductsList = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="min-h-screen bg-gray-50"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <ModernSkeleton width="w-64" height="h-10" className="mb-4 rounded-lg" />
        <ModernSkeleton width="w-96" height="h-5" className="rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <ModernSkeleton.Product />
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
)

// Profile page skeleton
const Profile = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ModernSkeleton width="w-48" height="h-10" className="mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ModernSkeleton.Card>
            <div className="space-y-4">
              <ModernSkeleton.Avatar size="lg" className="mx-auto" />
              <ModernSkeleton width="w-full" height="h-5" className="mx-auto" />
              <ModernSkeleton.Form fields={4} />
            </div>
          </ModernSkeleton.Card>
        </div>
        <div className="lg:col-span-2">
          <ModernSkeleton.Card>
            <ModernSkeleton width="w-32" height="h-6" className="mb-4" />
            <ModernSkeleton.Table rows={5} columns={4} />
          </ModernSkeleton.Card>
        </div>
      </div>
    </div>
  </div>
)

// Checkout page skeleton
const Checkout = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ModernSkeleton width="w-48" height="h-10" className="mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ModernSkeleton.Card className="mb-6">
            <ModernSkeleton width="w-40" height="h-6" className="mb-4" />
            <ModernSkeleton.Form fields={6} />
          </ModernSkeleton.Card>
          <ModernSkeleton.Card>
            <ModernSkeleton width="w-40" height="h-6" className="mb-4" />
            <ModernSkeleton.Form fields={4} />
          </ModernSkeleton.Card>
        </div>
        <div className="lg:col-span-1">
          <ModernSkeleton.Card>
            <ModernSkeleton width="w-32" height="h-6" className="mb-4" />
            <div className="space-y-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <ModernSkeleton width="w-24" height="h-4" />
                  <ModernSkeleton width="w-16" height="h-4" />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-4">
                <ModernSkeleton width="w-20" height="h-6" />
                <ModernSkeleton width="w-24" height="h-6" />
              </div>
              <ModernSkeleton.Button width="w-full" height="h-12" />
            </div>
          </ModernSkeleton.Card>
        </div>
      </div>
    </div>
  </div>
)

// Admin page skeleton
const Admin = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="p-6">
      <div className="mb-6">
        <ModernSkeleton width="w-64" height="h-10" className="mb-2" />
        <ModernSkeleton width="w-96" height="h-5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <ModernSkeleton.Card key={i} />
        ))}
      </div>
      <ModernSkeleton.Card>
        <ModernSkeleton width="w-48" height="h-6" className="mb-4" />
        <ModernSkeleton.Table rows={8} columns={5} />
      </ModernSkeleton.Card>
    </div>
  </div>
)

// Cart page skeleton
const Cart = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ModernSkeleton width="w-32" height="h-10" className="mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ModernSkeleton.Card>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-4 pb-4 border-b border-gray-200 last:border-0">
                  <ModernSkeleton width="w-24" height="h-24" className="rounded-lg" />
                  <div className="flex-1">
                    <ModernSkeleton width="w-3/4" height="h-5" className="mb-2" />
                    <ModernSkeleton width="w-1/2" height="h-4" className="mb-4" />
                    <div className="flex items-center space-x-4">
                      <ModernSkeleton width="w-20" height="h-8" />
                      <ModernSkeleton width="w-24" height="h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernSkeleton.Card>
        </div>
        <div className="lg:col-span-1">
          <ModernSkeleton.Card>
            <ModernSkeleton width="w-32" height="h-6" className="mb-4" />
            <div className="space-y-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <ModernSkeleton width="w-24" height="h-4" />
                  <ModernSkeleton width="w-16" height="h-4" />
                </div>
              ))}
            </div>
            <ModernSkeleton.Button width="w-full" height="h-12" />
          </ModernSkeleton.Card>
        </div>
      </div>
    </div>
  </div>
)

// Attach variants to main component
PageSkeleton.FullPage = FullPage
PageSkeleton.ProductDetail = ProductDetail
PageSkeleton.ProductsList = ProductsList
PageSkeleton.Profile = Profile
PageSkeleton.Checkout = Checkout
PageSkeleton.Admin = Admin
PageSkeleton.Cart = Cart

export default PageSkeleton

