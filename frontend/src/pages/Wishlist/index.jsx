import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatPrice } from '../../utils/format'
import { getImageUrl } from '../../utils/imageUrl'
import toast from '../../utils/toast'

const Wishlist = () => {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [removingItems, setRemovingItems] = useState(new Set())
  const [cartLoading, setCartLoading] = useState({})

  const handleMoveToCart = async (item) => {
    const productId = item.product?.id || item.product_id
    setCartLoading(prev => ({ ...prev, [productId]: true }))
    
    try {
      const product = item.product || item
      await addToCart(product, 1, null)
      await removeFromWishlist(productId)
      toast.success('Item moved to cart!')
    } catch (error) {
      console.error('Failed to move item to cart:', error)
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handleRemove = async (item) => {
    const productId = item.product?.id || item.product_id
    setRemovingItems(prev => new Set(prev).add(productId))
    
    try {
      await removeFromWishlist(productId)
      toast.success('Item removed from wishlist')
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setTimeout(() => {
        setRemovingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      }, 300)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <p className="text-gray-600">Your favorite products saved for later</p>
        </motion.div>

        {items.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-lg border border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 mb-6">
                <Heart className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Start adding products you love to your wishlist!
              </p>
              <Link to="/products">
                <Button size="lg" className="px-8 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                  Browse Products
                </Button>
              </Link>
            </motion.div>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
                    </span>
                  </div>
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  const productId = item.product?.id || item.product_id
                  const isRemoving = removingItems.has(productId)
                  const isCartLoading = cartLoading[productId]

                  return (
                    <motion.div
                      key={item.id || productId}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{
                        opacity: isRemoving ? 0 : 1,
                        scale: isRemoving ? 0.9 : 1,
                        y: isRemoving ? -20 : 0,
                      }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="h-full"
                    >
                      <Card className="overflow-hidden bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow h-full flex flex-col">
                        {/* Product Image */}
                        <Link
                          to={`/products/${item.product?.resource_id || item.product?.id || productId}`}
                          className="relative group block"
                        >
                          <div className="relative h-56 bg-gray-100 overflow-hidden">
                            <img
                              src={getImageUrl(item.product?.image || item.image)}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300?text=No+Image'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* Wishlist Badge */}
                            <div className="absolute top-3 left-3">
                              <div className="bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Heart className="w-3 h-3 fill-white" />
                                Saved
                              </div>
                            </div>
                            {/* Quick Actions Overlay */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleRemove(item)
                                }}
                                className="p-2 bg-white/90 hover:bg-red-500 text-gray-700 hover:text-white rounded-lg shadow-lg transition-colors"
                                title="Remove from wishlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="p-5 flex-1 flex flex-col">
                          <Link
                            to={`/products/${item.product?.resource_id || item.product?.id || productId}`}
                            className="block mb-3 flex-1"
                          >
                            <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                              {item.product?.name || 'Product'}
                            </h3>
                            {item.product?.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {item.product.description}
                              </p>
                            )}
                          </Link>

                          {/* Price */}
                          <div className="mb-4">
                            {item.product?.price ? (
                              <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatPrice(item.product.price)}
                                </p>
                                {item.product?.compare_price && item.product.compare_price > item.product.price && (
                                  <p className="text-sm text-gray-400 line-through">
                                    {formatPrice(item.product.compare_price)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-lg font-semibold text-gray-400">Price not available</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="space-y-2 mt-auto">
                            <Button
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                              onClick={() => handleMoveToCart(item)}
                              disabled={isCartLoading}
                              isLoading={isCartLoading}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {isCartLoading ? 'Adding...' : 'Add to Cart'}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium"
                              onClick={() => handleRemove(item)}
                              disabled={isRemoving}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist
