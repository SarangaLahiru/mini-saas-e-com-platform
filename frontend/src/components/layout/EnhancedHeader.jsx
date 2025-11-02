import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CartDrawer from '../cart/CartDrawer'
import WishlistDrawer from '../wishlist/WishlistDrawer'
import SearchAutocomplete from './HeaderComponents/SearchAutocomplete'
import UserMenuDropdown from './HeaderComponents/UserMenuDropdown'
import RightSideActions from './HeaderComponents/RightSideActions'
import MobileMenu from './HeaderComponents/MobileMenu'
import MobileSearchBar from './HeaderComponents/MobileSearchBar'
import NavigationTabs from './HeaderComponents/NavigationTabs'
import { useAuth } from '../../contexts/AuthContext'
import HeaderSkeleton from './HeaderComponents/HeaderSkeleton'

const EnhancedHeader = () => {
  const { user, logout, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [showNavigationTabs, setShowNavigationTabs] = useState(true)

  // Show skeleton during initial authentication load
  const shouldShowSkeleton = authLoading

  // Scroll effect for header styling and navigation tabs
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      setScrolled(scrollTop > 8)
      
      if (scrollTop > 100) {
        setShowNavigationTabs(false)
      } else {
        setShowNavigationTabs(true)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Show skeleton during initial load
  if (shouldShowSkeleton) {
    return <HeaderSkeleton scrolled={scrolled} />
  }

  return (
    <>
      <motion.header
        className={`sticky top-0 z-[100] border-b border-gray-200 ${scrolled ? 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60' : 'bg-white'}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-between"
            animate={{ height: scrolled ? 56 : 64 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 z-10"
              animate={{
                scale: scrolled ? 0.9 : 1,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Link to="/" className="flex items-center">
                <motion.div 
                  className="bg-blue-600 rounded-lg flex items-center justify-center mr-3"
                  animate={{
                    width: scrolled ? 32 : 32,
                    height: scrolled ? 32 : 32,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <span className="text-white font-bold" style={{ fontSize: scrolled ? '16px' : '18px' }}>E</span>
                </motion.div>
                <motion.span 
                  className="font-bold text-gray-900"
                  animate={{
                    fontSize: scrolled ? '18px' : '20px',
                    opacity: scrolled ? 0.9 : 1,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  Electronics
                </motion.span>
              </Link>
            </motion.div>

            {/* Search Bar - Desktop */}
            <motion.div 
              className="hidden md:flex flex-1 min-w-0"
              animate={{
                maxWidth: scrolled ? '32rem' : '28rem',
                marginLeft: scrolled ? '0.75rem' : '2rem',
                marginRight: scrolled ? '0.75rem' : '2rem',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.div
                className="w-full"
                animate={{
                  scale: scrolled ? 1.05 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <SearchAutocomplete onSubmit={(q) => navigate(`/products?search=${encodeURIComponent(q)}`)} />
              </motion.div>
            </motion.div>

            {/* Right Side Actions and User Menu - Grouped with consistent spacing */}
            <motion.div
              className="flex items-center"
              animate={{
                gap: scrolled ? '0.5rem' : '1rem',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <RightSideActions
                scrolled={scrolled}
                onMobileSearchOpen={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                onCartOpen={() => setIsCartOpen(true)}
                onWishlistOpen={() => setIsWishlistOpen(true)}
              />

              {/* User Menu */}
              <UserMenuDropdown
                scrolled={scrolled}
                isOpen={isUserMenuOpen}
                onClose={setIsUserMenuOpen}
              />
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Mobile Search Bar - Expandable */}
        <MobileSearchBar
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
        />

        {/* Navigation Tabs Section */}
        <NavigationTabs
          showNavigationTabs={showNavigationTabs}
          scrolled={scrolled}
        />
      </motion.header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  )
}

export default EnhancedHeader
