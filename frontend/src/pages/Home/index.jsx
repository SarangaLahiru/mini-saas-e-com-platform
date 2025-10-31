import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import SkeletonList from '../../components/ui/SkeletonList'
import SkeletonCard from '../../components/ui/SkeletonCard'

// Lazy load components
const HeroSection = React.lazy(() => import('./components/HeroSection'))
const CategoryCarousel = React.lazy(() => import('./components/CategoryCarousel'))
const FeaturedProducts = React.lazy(() => import('./components/FeaturedProducts'))
const WhyChooseUs = React.lazy(() => import('./components/WhyChooseUs'))
const Newsletter = React.lazy(() => import('./components/Newsletter'))

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={
        <div className="h-96 bg-gradient-to-r from-blue-50 to-indigo-100 animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="w-1/2">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      }>
        <HeroSection />
      </Suspense>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Shop by Category
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Discover our wide range of electronics and tech products
            </motion.p>
          </div>
          
          <Suspense fallback={<SkeletonList count={6} variant="category" gridCols="grid-cols-3 md:grid-cols-6" />}>
            <CategoryCarousel limit={20} />
          </Suspense>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Featured Products
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Handpicked products that our customers love
            </motion.p>
          </div>
          
          <Suspense fallback={<SkeletonList count={6} variant="product" />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <Suspense fallback={
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }>
        <WhyChooseUs />
      </Suspense>

      {/* Newsletter Section */}
      <Suspense fallback={
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-8 bg-blue-500 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-blue-500 rounded w-1/2 mx-auto mb-8"></div>
            <div className="max-w-md mx-auto">
              <div className="h-10 bg-blue-500 rounded w-full mb-4"></div>
              <div className="h-10 bg-blue-500 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </section>
      }>
        <Newsletter />
      </Suspense>
    </div>
  )
}

export default Home
