import React, { Suspense } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

// Lazy load components
const ProductsTable = React.lazy(() => import('./components/ProductsTable'))
const ProductsFilter = React.lazy(() => import('./components/ProductsFilter'))

const AdminProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Add Product
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductsFilter />
            </Suspense>
          </div>
          
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductsTable />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProducts
