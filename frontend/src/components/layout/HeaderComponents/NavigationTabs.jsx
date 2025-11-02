import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FolderTree, ChevronDown, TrendingUp, Tag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import MegaMenu from './MegaMenu'
import { MegaMenuSkeleton } from './HeaderSkeletons'

const NavigationTabs = ({ showNavigationTabs, scrolled }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const megaMenuRef = useRef(null)
  const closeTimeoutRef = useRef(null)
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [megaMenuPosition, setMegaMenuPosition] = useState({ top: 0, left: 0 })

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', 'header'],
    queryFn: () => productsAPI.getCategories({ limit: 20 }),
  })

  const categories = categoriesData?.categories || []

  useEffect(() => {
    if (showNavigationTabs && categories.length > 0 && !hoveredCategory) {
      setHoveredCategory(categories[0])
    }
  }, [showNavigationTabs, categories])

  const { data: categoryProductsData, isLoading: isLoadingCategoryProducts } = useQuery({
    queryKey: ['category-products', hoveredCategory?.slug],
    queryFn: () => hoveredCategory
      ? productsAPI.getProducts({ category_slug: hoveredCategory.slug, limit: 4 })
      : null,
    enabled: !!hoveredCategory && !!hoveredCategory.slug,
    staleTime: 30000,
  })

  const categoryProducts = categoryProductsData?.products || []

  const handleCategoryHover = (category) => {
    setHoveredCategory(category)
  }

  const handleCategoryClick = (category) => {
    navigate(`/categories/${category.slug}`)
    setShowCategoriesDropdown(false)
    setHoveredCategory(null)
  }

  const handleMegaMenuClose = () => {
    setShowCategoriesDropdown(false)
    setHoveredCategory(null)
  }

  return (
    <AnimatePresence>
      {showNavigationTabs && (
        <motion.div
          initial={{ height: 'auto', opacity: 1 }}
          animate={{ 
            height: showNavigationTabs ? 'auto' : 0, 
            opacity: showNavigationTabs ? 1 : 0,
          }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`border-t border-gray-200 relative overflow-hidden ${scrolled ? 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60' : 'bg-white'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5">
              {/* All Categories - Mega Menu */}
              <div 
                ref={megaMenuRef}
                data-category-trigger
                className="relative"
                style={{ position: 'relative', zIndex: 10000 }}
                onMouseEnter={(e) => {
                  // Clear any pending close timeout
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current)
                    closeTimeoutRef.current = null
                  }
                  
                  const rect = e.currentTarget.getBoundingClientRect()
                  setMegaMenuPosition({
                    top: rect.bottom + window.scrollY - 2,
                    left: rect.left + window.scrollX
                  })
                  setShowCategoriesDropdown(true)
                  if (categories.length > 0 && !hoveredCategory) {
                    setHoveredCategory(categories[0])
                  }
                }}
                onMouseLeave={(e) => {
                  // Clear any existing timeout
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current)
                  }
                  
                  // Only close if not moving to mega menu
                  const relatedTarget = e.relatedTarget
                  closeTimeoutRef.current = setTimeout(() => {
                    if (!showCategoriesDropdown) return
                    // Check if mouse is over mega menu
                    const megaMenu = document.querySelector('[data-mega-menu]')
                    const isOverMenu = megaMenu && megaMenu.matches(':hover')
                    if (!isOverMenu) {
                      setShowCategoriesDropdown(false)
                      setHoveredCategory(null)
                    }
                    closeTimeoutRef.current = null
                  }, 150)
                  
                  // Clear timeout if mouse re-enters trigger
                  if (relatedTarget && relatedTarget.closest('[data-category-trigger]')) {
                    clearTimeout(closeTimeoutRef.current)
                    closeTimeoutRef.current = null
                  }
                }}
              >
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    location.pathname.startsWith('/category') || location.pathname.startsWith('/categories')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <FolderTree className="w-4 h-4" />
                  <span>All Categories</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showCategoriesDropdown && isLoadingCategories ? (
                typeof window !== 'undefined' && createPortal(
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bg-white border-t border-gray-200 shadow-2xl overflow-hidden z-[99999]"
                    style={{ 
                      position: 'fixed',
                      top: `${megaMenuPosition.top}px`,
                      left: 0,
                      right: 0,
                      width: '100%',
                      maxWidth: '100vw'
                    }}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                      <MegaMenuSkeleton />
                    </div>
                  </motion.div>,
                  document.body
                )
              ) : (
                <MegaMenu
                  isOpen={showCategoriesDropdown && categories.length > 0}
                  categories={categories}
                  hoveredCategory={hoveredCategory}
                  onCategoryHover={handleCategoryHover}
                  onCategoryClick={handleCategoryClick}
                  onClose={handleMegaMenuClose}
                  position={megaMenuPosition}
                  categoryProducts={categoryProducts}
                  isLoadingCategoryProducts={isLoadingCategoryProducts}
                  categoryProductsTotal={categoryProductsData?.total || 0}
                />
              )}

              <Link
                to="/products?is_featured=true"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  location.search.includes('is_featured=true')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Top Sales</span>
              </Link>
              <Link
                to="/products"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  location.search.includes('offer')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Offers</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NavigationTabs

