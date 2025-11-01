import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import Skeleton from '../../../components/ui/Skeleton'
import ProductCard from '../../../components/products/ProductCard'

const FeaturedProducts = () => {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeaturedProducts(),
  })

  const featured = featuredData?.products || []

  const { data: fallbackData, isLoading: loadingFallback } = useQuery({
    queryKey: ['recent-products'],
    queryFn: () => productsAPI.getProducts({ limit: 8, sort_by: 'created_at', sort_order: 'desc' }),
    enabled: !loadingFeatured && featured.length === 0,
  })

  const products = featured.length > 0 ? featured : (fallbackData?.products || [])
  const isLoading = loadingFeatured || (featured.length === 0 && loadingFallback)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton.Product key={index} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center bg-white rounded-xl border border-gray-200 p-10">
        <div className="text-2xl font-semibold text-gray-800 mb-2">No products yet</div>
        <p className="text-gray-600 mb-6">We’re getting things ready. Please check back soon.</p>
        <Link to="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.resource_id || product.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.4 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default FeaturedProducts
