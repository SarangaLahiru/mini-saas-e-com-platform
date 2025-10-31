import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Lazy load components
const ProductGrid = React.lazy(() => import('./components/ProductGrid'))
const ProductFilters = React.lazy(() => import('./components/ProductFilters'))
const ProductSearch = React.lazy(() => import('./components/ProductSearch'))

const Products = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <p className="text-lg text-gray-600">
            Discover our complete range of electronics and tech products
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductFilters />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductSearch />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
