import React, { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Lazy load components
const CategoryProducts = React.lazy(() => import('./components/CategoryProducts'))
const CategoryFilters = React.lazy(() => import('./components/CategoryFilters'))

const Category = () => {
  const { slug } = useParams()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
          {slug?.replace('-', ' ')} Products
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryFilters />
            </Suspense>
          </div>
          
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryProducts categorySlug={slug} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Category
