import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { productsAPI } from '../../../services/api'
import ProductCard from '../../../components/products/ProductCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Pagination from '../../../components/ui/Pagination'

const CategoryProducts = ({ categorySlug }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const brand = searchParams.get('brand') || ''
  const max_price = searchParams.get('max_price') || ''
  const search = searchParams.get('search') || ''
  const in_stock = searchParams.get('in_stock') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { categorySlug, page, limit, brand, max_price, search, in_stock }],
    queryFn: () => productsAPI.getProducts({
      page,
      limit,
      category_slug: categorySlug,
      brand: brand || undefined,
      max_price: max_price || undefined,
      search: search || undefined,
      in_stock: in_stock || undefined,
    }),
    keepPreviousData: true,
  })

  const products = data?.products || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load products. Please try again.</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found in this category.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(next) => {
              const nextParams = new URLSearchParams(searchParams)
              nextParams.set('page', String(next))
              setSearchParams(nextParams)
            }}
          />
        </div>
      )}
    </>
  )
}

export default CategoryProducts
