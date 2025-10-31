import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const WishlistDrawer = ({ isOpen, onClose }) => {
  const { items, removeFromWishlist, isLoading } = useWishlist()
  const { addToCart } = useCart()

  const handleMoveToCart = async (item) => {
    try {
      // Assuming item has product structure similar to cart
      const product = item.product || item
      await addToCart(product, 1, null)
      await removeFromWishlist(product.id || product.product_id)
    } catch (e) {
      // Toasts handled in contexts
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
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
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HeartSolid className="h-5 w-5 text-pink-600" />
                Wishlist
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                      <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                  <Button onClick={onClose}>Continue Shopping</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id || item.product_id} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                      <Link to={`/products/${item.product?.resource_id || item.product?.id || item.product_id}`} onClick={onClose}>
                        <img
                          src={item.product?.image || item.image || 'https://via.placeholder.com/64'}
                          alt={item.product?.name || 'Product'}
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product?.resource_id || item.product?.id || item.product_id}`} onClick={onClose} className="block">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Product'}</h3>
                        </Link>
                        {item.product?.price && (
                          <p className="text-sm text-gray-600">${item.product.price}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <ShoppingCartIcon className="h-4 w-4" />
                          Add
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product?.id || item.product_id)}
                          className="text-sm text-gray-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <Link to="/wishlist" onClick={onClose}>
                  <Button variant="outline" className="w-full">View Wishlist</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WishlistDrawer
