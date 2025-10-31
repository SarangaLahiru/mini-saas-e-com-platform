import React, { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Lazy load components
const ProductInfo = React.lazy(() => import('./components/ProductInfo'))
const ProductImages = React.lazy(() => import('./components/ProductImages'))
const ProductReviews = React.lazy(() => import('./components/ProductReviews'))
const RelatedProducts = React.lazy(() => import('./components/RelatedProducts'))

const ProductDetail = () => {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProductImages productId={id} />
            <ProductInfo productId={id} />
          </div>
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
