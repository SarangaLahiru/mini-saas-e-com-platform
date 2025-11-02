import React, { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FolderTree, Folder, Image as ImageIcon, Package, TrendingUp } from 'lucide-react'
import { getImageUrl } from '../../../utils/imageUrl'
import { CategoryListSkeleton, MegaMenuProductsSkeleton } from './HeaderSkeletons'

const MegaMenu = ({ 
  isOpen, 
  categories, 
  hoveredCategory, 
  onCategoryHover, 
  onCategoryClick, 
  onClose,
  position,
  categoryProducts,
  isLoadingCategoryProducts,
  categoryProductsTotal
}) => {
  const closeTimeoutRef = useRef(null)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])
  
  if (!isOpen || !categories || categories.length === 0) return null

  return typeof window !== 'undefined' && createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-mega-menu
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bg-white border-t border-gray-200 shadow-2xl overflow-hidden"
          style={{ 
            position: 'fixed',
            zIndex: 99999,
            top: `${position.top}px`,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100vw'
          }}
          onMouseEnter={() => {
            // Clear any pending close timeout
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current)
              closeTimeoutRef.current = null
            }
          }}
          onMouseLeave={(e) => {
            // Clear any existing timeout
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current)
            }
            
            // Close when mouse leaves the mega menu (unless moving to trigger)
            const relatedTarget = e.relatedTarget
            closeTimeoutRef.current = setTimeout(() => {
              if (!relatedTarget || !relatedTarget.closest('[data-category-trigger]')) {
                onClose()
              }
              closeTimeoutRef.current = null
            }, 100)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex h-[450px] gap-6">
              {/* Left Side - Categories List */}
              <div className="w-1/4 border-r border-gray-200 bg-gray-50 rounded-lg overflow-y-auto">
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-5 uppercase tracking-wide flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-blue-600" />
                    All Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <CategoryListSkeleton count={8} />
                    ) : (
                      categories.map((category) => (
                      <button
                        key={category.id || category.slug}
                        onMouseEnter={() => onCategoryHover(category)}
                        onClick={() => onCategoryClick(category)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                          hoveredCategory?.slug === category.slug
                            ? 'bg-white shadow-md border-2 border-blue-500'
                            : 'hover:bg-white hover:shadow-sm border border-transparent'
                        }`}
                      >
                        {category.image ? (
                          <img
                            src={getImageUrl(category.image)}
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <Folder className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            hoveredCategory?.slug === category.slug
                              ? 'text-blue-600'
                              : 'text-gray-900'
                          }`}>
                            {category.name}
                          </p>
                          {category.products_count !== undefined && (
                            <p className="text-xs text-gray-500">
                              {category.products_count} products
                            </p>
                          )}
                        </div>
                      </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Products from Selected Category */}
              <div className="flex-1 bg-white rounded-lg overflow-y-auto">
                {hoveredCategory ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {hoveredCategory.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {categoryProductsTotal || 0} products available
                        </p>
                      </div>
                      <Link
                        to={`/categories/${hoveredCategory.slug}`}
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <span>View All</span>
                        <TrendingUp className="w-4 h-4" />
                      </Link>
                    </div>

                    {isLoadingCategoryProducts ? (
                      <MegaMenuProductsSkeleton count={8} />
                    ) : categoryProducts && categoryProducts.length > 0 ? (
                      <div className="grid grid-cols-4 gap-4">
                        {categoryProducts.map((product) => {
                          const productImage = product.images?.[0]?.url || product.image || ''
                          return (
                            <Link
                              key={product.id || product.resource_id}
                              to={`/products/${product.resource_id || product.slug}`}
                              onClick={onClose}
                              className="group"
                            >
                              <div className="bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-100">
                                {productImage ? (
                                  <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-200 mb-3">
                                    <img
                                      src={getImageUrl(productImage)}
                                      alt={product.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-40 rounded-lg bg-gray-200 mb-3 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                                <p className="text-sm font-semibold text-gray-900 truncate mb-2 group-hover:text-blue-600 transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-base font-bold text-blue-600">
                                  ${product.price?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium">No products found in this category</p>
                          <p className="text-xs text-gray-400 mt-1">Try another category</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center max-w-md">
                      <FolderTree className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-600 mb-2">Browse Categories</p>
                      <p className="text-sm text-gray-500">Hover over a category to view its products</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default MegaMenu

