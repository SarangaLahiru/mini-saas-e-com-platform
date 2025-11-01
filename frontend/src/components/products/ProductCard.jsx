import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, PhotoIcon } from '@heroicons/react/24/solid'
import { formatPrice } from '../../utils/format'
import { getPrimaryImageUrl } from '../../utils/imageUrl'
import Button from '../ui/Button'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ProductCard = ({ product, className = '' }) => {
  const { addToCart } = useCart()
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()
  const { user } = useAuth()
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = React.useState(false)

  const imageUrl = getPrimaryImageUrl(product) || ''
  
  // Get the numeric product ID (backend uses numeric ID, not resource_id)
  const productId = product.id || product.product_id
  
  // Debug: Log product structure if ID is missing
  React.useEffect(() => {
    if (!productId) {
      console.warn('⚠️ Product missing ID:', {
        product,
        hasId: !!product.id,
        hasProductId: !!product.product_id,
        hasResourceId: !!product.resource_id
      })
    }
  }, [product, productId])
  
  // Check if product is in wishlist
  const isInWishlist = React.useMemo(() => 
    wishlistItems.some(item => item.product_id === productId),
    [wishlistItems, productId]
  )

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }
    try {
      setIsAddingToCart(true)
      await addToCart(product, 1, null)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Please login to add to wishlist')
      return
    }
    
    // Validate product ID exists
    if (!productId) {
      console.error('Product ID is missing:', product)
      toast.error('Unable to add to wishlist: Product ID missing')
      return
    }
    
    setIsWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <motion.div
      className={`rounded-xl border border-gray-100 bg-white shadow-md hover:shadow-xl transition-all duration-200 w-full ${className}`}
      whileHover={{ y: -8 }}
      tabIndex={0}
    >
      <Link to={`/products/${product.resource_id}`} className="block group focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl h-full flex flex-col">
        {/* Image Wrapper - responsive height for uniform cards */}
        <div className="relative isolate w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-xl bg-gray-100 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.images?.[0]?.alt || product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PhotoIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
          {/* Gradient overlay on hover for modern polish */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/25 via-black/10 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.is_featured && (
              <span className="bg-blue-600 text-white px-2 sm:px-2.5 py-1 text-xs sm:text-[11px] rounded font-bold shadow-sm whitespace-nowrap">Featured</span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white px-2 sm:px-2.5 py-1 text-xs sm:text-[11px] rounded font-semibold shadow-sm whitespace-nowrap">-{discountPercentage}%</span>
            )}
            {product.stock < 1 && (
              <span className="bg-gray-600 text-white px-2 sm:px-2.5 py-1 text-xs sm:text-[11px] rounded font-bold shadow-sm whitespace-nowrap">Out of Stock</span>
            )}
          </div>

          {/* Wishlist button */}
          <motion.button
            tabIndex={-1}
            onClick={handleWishlist}
            disabled={isWishlistLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 p-2 sm:p-2.5 bg-white/95 hover:bg-white rounded-full shadow-md group-hover:opacity-100 opacity-100 sm:opacity-0 focus:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="h-5 w-5 sm:h-5 sm:w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 sm:h-5 sm:w-5 text-gray-700" />
            )}
          </motion.button>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 p-3 sm:p-4 transition-transform duration-300 group-hover:-translate-y-0.5">
          {/* Category */}
          {product.category?.name && (
            <div className="text-xs sm:text-xs text-blue-600 font-semibold mb-1 truncate">
              {product.category.name}
            </div>
          )}
          {/* Name */}
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1.5 min-h-[2.5rem] sm:min-h-[2.5rem] line-clamp-2 group-hover:text-blue-700 transition-colors">
            {product.name}
          </h3>
          {/* Description */}
          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 flex-shrink-0">
            {product.description}
          </div>

          <div className="flex items-end justify-between mt-auto gap-2 sm:gap-0">
            {/* Price */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-base sm:text-lg font-bold text-blue-700 truncate">{formatPrice(product.price)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-xs sm:text-sm text-gray-400 line-through truncate">{formatPrice(product.compare_price)}</span>
              )}
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              loading={isAddingToCart}
              disabled={product.stock < 1}
              size="sm"
              className="rounded-lg min-w-[44px] sm:min-w-[auto] flex-shrink-0 ml-1 whitespace-nowrap shadow focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation text-xs sm:text-sm px-2 sm:px-3"
            >
              <ShoppingCartIcon className="w-4 h-4 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard
