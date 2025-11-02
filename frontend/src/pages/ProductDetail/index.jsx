import React, { Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Card from '../../components/ui/Card'

// Lazy load components
const ProductInfo = React.lazy(() => import('./components/ProductInfo'))
const ProductImages = React.lazy(() => import('./components/ProductImages'))
const ProductReviews = React.lazy(() => import('./components/ProductReviews'))
const RelatedProducts = React.lazy(() => import('./components/RelatedProducts'))

const ProductDetail = () => {
  const { id } = useParams()

  // Scroll to top when product ID changes or page loads
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          {/* Unified Product Card */}
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
              {/* Images Section */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 lg:p-8 lg:sticky lg:top-24 lg:h-fit">
                <ProductImages productId={id} />
              </div>
              
              {/* Product Info Section */}
              <div className="p-4 lg:p-8 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
                <ProductInfo productId={id} />
              </div>
            </div>
          </Card>
        </Suspense>

        <div className="mt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductReviews productId={id} />
          </Suspense>
        </div>

        <div className="mt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <RelatedProducts productId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
