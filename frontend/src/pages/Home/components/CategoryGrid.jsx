import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'

const CategoryGrid = () => {
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', 20],
    queryFn: () => productsAPI.getCategories({ limit: 20 }),
  })

  const categories = categoriesData?.categories || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="card" className="h-32" />
        ))}
      </div>
    )
  }

  const scrollerRef = useRef(null)

  const scrollBy = (delta) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollBy(-300)}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 hover:bg-gray-50"
      >
        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
      </button>

      <motion.div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={itemVariants} className="snap-start shrink-0 w-40">
            <Link to={`/category/${category.slug}`}>
              <Card hover className="h-36 flex flex-col items-center justify-center text-center group overflow-hidden relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-transparent to-primary-50" />
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 ring-1 ring-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded-lg" loading="lazy" />
                  ) : (
                    <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{category.products_count || 0} products</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollBy(300)}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 hover:bg-gray-50"
      >
        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
      </button>
    </div>
  )
}

export default CategoryGrid
