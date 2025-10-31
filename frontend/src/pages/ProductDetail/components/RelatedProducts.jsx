import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import ProductCard from '../../../components/products/ProductCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

const RelatedProducts = ({ productId }) => {
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['related-products', productId],
    queryFn: () => productsAPI.getRelatedProducts(productId),
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!relatedProducts?.products?.length) {
    return null
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Related Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
