import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useCart } from '../../../contexts/CartContext'
import { useWishlist } from '../../../contexts/WishlistContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatPrice } from '../../../utils/format'
import CartItemSkeleton from '../../../components/cart/CartItemSkeleton'

const CartItems = () => {
  const { items, removeFromCart, updateQuantity, isLoading } = useCart()
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()
  const [removingItems, setRemovingItems] = React.useState(new Set())
  const [wishlistLoading, setWishlistLoading] = React.useState({})

  const handleRemoveItem = async (itemId) => {
    setRemovingItems(prev => new Set(prev).add(itemId))
    
    try {
      await removeFromCart(itemId)
    } finally {
      setTimeout(() => {
        setRemovingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 300)
    }
  }

  const handleWishlistToggle = async (productId) => {
    console.log('🔍 handleWishlistToggle called with productId:', productId)
    console.log('📋 wishlistItems:', wishlistItems)
    console.log('❤️ isInWishlist:', isInWishlist(productId))
    
    setWishlistLoading(prev => ({ ...prev, [productId]: true }))
    try {
      const alreadyInWishlist = wishlistItems.some(item => item.product_id === productId)
      console.log('🔄 Already in wishlist:', alreadyInWishlist)
      
      if (alreadyInWishlist) {
        console.log('🗑️ Removing from wishlist...')
        await removeFromWishlist(productId)
      } else {
        console.log('➕ Adding to wishlist...')
        await addToWishlist(productId)
      }
      console.log('✅ Wishlist operation completed')
    } catch (error) {
      console.error('❌ Wishlist operation failed:', error)
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  const isInWishlist = (productId) => wishlistItems.some(item => item.product_id === productId)

  if (isLoading) {
    return (
      <Card className="p-6">
        <CartItemSkeleton count={3} />
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <ShoppingBagIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link to="/">
            <Button size="lg" className="px-8">
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Cart Items ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h2>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: removingItems.has(item.id) ? 0 : 1,
                y: removingItems.has(item.id) ? -20 : 0,
                height: removingItems.has(item.id) ? 0 : 'auto'
              }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-6">
                {/* Product Image */}
                <Link 
                  to={`/products/${item.product?.resource_id || item.product_id}`}
                  className="flex-shrink-0 group"
                >
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                    <img
                      src={item.product?.image || item.image || 'https://via.placeholder.com/150'}
                      alt={item.product?.name || item.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                      }}
                    />
                  </div>
                </Link>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link 
                        to={`/products/${item.product?.resource_id || item.product_id}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                          {item.product?.name || item.name || 'Product'}
                        </h3>
                      </Link>
                      
                      {item.variant && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Variant:</span> {item.variant.name}
                        </p>
                      )}
                      
                      <div className="flex items-baseline gap-3 mb-3">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(item.price)}
                        </p>
                        {item.product?.compare_price && item.product.compare_price > item.price && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(item.product.compare_price)}
                          </p>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {/* Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleWishlistToggle(item.product_id || item.product?.id)}
                        disabled={wishlistLoading[item.product_id || item.product?.id]}
                        className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isInWishlist(item.product_id || item.product?.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        {isInWishlist(item.product_id || item.product?.id) ? (
                          <HeartIconSolid className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
                        )}
                      </motion.button>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Remove from cart"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity and Subtotal */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Decrease quantity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center text-base font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Increase quantity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

export default CartItems
