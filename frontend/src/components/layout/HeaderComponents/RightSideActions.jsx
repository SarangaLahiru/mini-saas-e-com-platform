import React from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useWishlist } from '../../../contexts/WishlistContext'

const RightSideActions = ({ 
  scrolled, 
  onMobileSearchOpen, 
  onCartOpen, 
  onWishlistOpen 
}) => {
  const { items } = useCart()
  const { itemsCount: wishlistCount } = useWishlist()
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="flex items-center gap-0">
      <motion.button
        onClick={onMobileSearchOpen}
        className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        animate={{
          scale: scrolled ? 0.9 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Search className="w-6 h-6" />
      </motion.button>

      <motion.button
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-flex"
        animate={{
          opacity: scrolled ? 1 : 1,
          width: 'auto',
          scale: scrolled ? 0.9 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'visible' }}
      >
        <Bell className="w-6 h-6" />
        <motion.span 
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-10 border-2 border-white"
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </motion.button>

      <motion.button
        onClick={onWishlistOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-flex"
        title="Wishlist"
        animate={{
          opacity: 1,
          width: 'auto',
          scale: scrolled ? 0.9 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'visible' }}
      >
        <Heart className="w-6 h-6" />
        {wishlistCount > 0 && (
          <motion.span 
            className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center font-medium z-10 border-2 border-white"
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {wishlistCount}
          </motion.span>
        )}
      </motion.button>

      <motion.button
        onClick={onCartOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        animate={{
          opacity: 1,
          width: 'auto',
          scale: scrolled ? 0.9 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'visible' }}
      >
        <ShoppingCart className="w-6 h-6" />
        {cartItemsCount > 0 && (
          <motion.span 
            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium z-10 border-2 border-white"
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {cartItemsCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}

export default RightSideActions

