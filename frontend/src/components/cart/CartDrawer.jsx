import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ShoppingCartIcon, TrashIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { formatPrice } from '../../utils/format'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'
import CartItemSkeleton from './CartItemSkeleton'

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, total, isLoading } = useCart()
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()
  const [removingItems, setRemovingItems] = React.useState(new Set())
  const [wishlistLoading, setWishlistLoading] = React.useState({})

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = async (itemId) => {
    // Add to removing set for animation
    setRemovingItems(prev => new Set(prev).add(itemId))
    
    try {
      await removeFromCart(itemId)
    } finally {
      // Remove from set after animation
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
    console.log('🔍 [CartDrawer] handleWishlistToggle called with productId:', productId)
    console.log('📋 wishlistItems:', wishlistItems)
    
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-[201]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <CartItemSkeleton count={3} />
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Button onClick={onClose}>Continue Shopping</Button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: removingItems.has(item.id) ? 0 : 1,
                        x: removingItems.has(item.id) ? 20 : 0,
                        height: removingItems.has(item.id) ? 0 : 'auto'
                      }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative group"
                    >
                      <div className="flex items-start space-x-3 py-4 border-b border-gray-200">
                        {/* Product Image */}
                        <Link 
                          to={`/products/${item.product?.resource_id || item.product_id}`} 
                          onClick={onClose}
                          className="flex-shrink-0"
                        >
                          <img
                            src={item.product?.image || item.image || 'https://via.placeholder.com/80'}
                            alt={item.product?.name || item.name || 'Product'}
                            className="h-20 w-20 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                            }}
                          />
                        </Link>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link 
                              to={`/products/${item.product?.resource_id || item.product_id}`}
                              onClick={onClose}
                              className="flex-1"
                            >
                              <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                {item.product?.name || item.name || 'Product'}
                              </h3>
                            </Link>
                            
                            {/* Action Buttons */}
                            <div className="flex-shrink-0 flex items-center gap-1">
                              {/* Wishlist Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleWishlistToggle(item.product_id || item.product?.id)}
                                disabled={wishlistLoading[item.product_id || item.product?.id]}
                                className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isInWishlist(item.product_id || item.product?.id) ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                {isInWishlist(item.product_id || item.product?.id) ? (
                                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                                ) : (
                                  <HeartIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                )}
                              </motion.button>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Remove item"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {item.variant && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variant.name}
                            </p>
                          )}
                          
                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-semibold text-blue-600">
                              {formatPrice(item.price)}
                            </p>
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={item.quantity <= 1}
                                title="Decrease quantity"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Increase quantity"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Subtotal for this item */}
                          <div className="mt-2 text-xs text-gray-500">
                            Subtotal: <span className="font-medium text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
                </div>
                
                <div className="space-y-4">
                  <Link to="/checkout" onClick={onClose}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link to="/cart" onClick={onClose}>
                    <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 font-medium transition-all" size="md">
                      View Full Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer