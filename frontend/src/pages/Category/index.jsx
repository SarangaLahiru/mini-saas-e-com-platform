import React, { Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { productsAPI } from '../../services/api'
import { getImageUrl } from '../../utils/imageUrl'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Card from '../../components/ui/Card'
import { ArrowLeft, Package } from 'lucide-react'

// Lazy load components
const CategoryProducts = React.lazy(() => import('./components/CategoryProducts'))
const CategoryFilters = React.lazy(() => import('./components/CategoryFilters'))
const ProductSearch = React.lazy(() => import('../Products/components/ProductSearch'))

const Category = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  // Fetch category data
  const { data: categoryData, isLoading: isLoadingCategory, error: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => productsAPI.getCategory(slug),
    enabled: !!slug,
  })

  const category = categoryData?.category

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [slug])

  if (isLoadingCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
              <p className="text-gray-600 mb-6">
                The category you're looking for doesn't exist or may have been removed.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Home
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const categoryName = category.name || slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Category'
  const categoryImage = category.image ? getImageUrl(category.image) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center text-sm text-gray-500 mb-4"
        >
          <button onClick={() => navigate('/')} className="hover:text-gray-700 transition-colors">
            Home
          </button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/products')} className="hover:text-gray-700 transition-colors">
            Products
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </motion.div>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 lg:p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Category Image */}
              {categoryImage && (
                <div className="flex-shrink-0 w-24 h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  <img 
                    src={categoryImage} 
                    alt={categoryName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Category Info */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {categoryName}
                </h1>
                {category.description && (
                  <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                    {category.description}
                  </p>
                )}
                {!category.description && (
                  <p className="text-lg text-gray-600">
                    Browse our collection of {categoryName.toLowerCase()} products
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Products Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryFilters />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductSearch />
            </Suspense>
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
