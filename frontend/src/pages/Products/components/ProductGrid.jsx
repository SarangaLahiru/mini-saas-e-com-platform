import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import ProductCard from '../../../components/products/ProductCard'
import Skeleton from '../../../components/ui/Skeleton'
import Pagination from '../../../components/ui/Pagination'
import { useSearchParams } from 'react-router-dom'

const ProductGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const search = searchParams.get('search') || ''
  const brand = searchParams.get('brand') || '' // comma-separated
  const min_price = parseFloat(searchParams.get('min_price') || '0')
  const max_price = parseFloat(searchParams.get('max_price') || '0')
  const in_stock = searchParams.get('in_stock') === '1'
  const sort_by = searchParams.get('sort_by') || 'created_at'
  const sort_order = searchParams.get('sort_order') || 'desc'

  const params = {
    page,
    limit,
    search: search || undefined,
    brand: brand || undefined,
    min_price: min_price > 0 ? min_price : undefined,
    max_price: max_price > 0 ? max_price : undefined,
    in_stock: in_stock ? 1 : undefined,
    sort_by,
    sort_order,
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsAPI.getProducts(params),
    keepPreviousData: true,
  })

  const products = data?.products || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton.Product key={index} />
        ))}
      </div>
    )
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
        <p className="text-gray-500">No products found.</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => {
              const next = new URLSearchParams(searchParams)
              next.set('page', String(page))
              setSearchParams(next)
            }}
          />
        </div>
      )}
    </>
  )
}

export default ProductGrid
