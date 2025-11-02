import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart,
  Bell,
  LogOut,
  Package,
  HelpCircle,
  Sparkles,
  Mail,
  LayoutDashboard,
  Shield,
  ChevronDown,
  Folder,
  Tag,
  Image as ImageIcon,
  Grid3x3,
  TrendingUp,
  FolderTree
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { getUserDisplayName } from '../../utils/userUtils'
import { getImageUrl } from '../../utils/imageUrl'
import CartDrawer from '../cart/CartDrawer'
import WishlistDrawer from '../wishlist/WishlistDrawer'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'
import { useWishlist } from '../../contexts/WishlistContext'
// Removed currency/country selector per request

const EnhancedHeader = () => {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { itemsCount: wishlistCount } = useWishlist()
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'header'],
    queryFn: () => productsAPI.getCategories({ limit: 20 }),
  })

  const categories = categoriesData?.categories || []

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      // Error toast is already handled in AuthContext logout function
      console.error('Logout failed:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const isAdmin = user?.is_admin || user?.isAdmin
  
  const userMenuItems = [
    // Admin Dashboard - only for admins, placed at top
    ...(isAdmin ? [{
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
      href: '/admin',
      description: 'Manage your store',
      adminOnly: true
    }] : []),
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      description: 'View and edit your profile'
    },
    {
      icon: Package,
      label: 'Orders',
      href: '/orders',
      description: 'Track your orders'
    }
  ]

  // Scroll effect for header styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 border-b border-gray-200 ${scrolled ? 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60' : 'bg-white'}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-between h-16"
            animate={{ height: scrolled ? 60 : 64 }}
            transition={{ duration: 0.2 }}
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Electronics</span>
              </Link>
            </motion.div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchAutocomplete onSubmit={(q) => navigate(`/products?search=${encodeURIComponent(q)}`)} />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Removed Country/Currency selector */}

              {/* Search - Mobile */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>

              {/* Notifications (hide on xs) */}
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-flex"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Wishlist (hide on xs) */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-flex"
                title="Wishlist"
              >
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart (always visible) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative">
                      <Avatar 
                        user={user} 
                        size="sm" 
                        showOnlineStatus={true}
                      />
                      {/* Admin Badge Indicator on Avatar */}
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border-2 border-white shadow-sm">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
                        isUserMenuOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <Avatar 
                              user={user} 
                              size="lg" 
                              showOnlineStatus={true}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-semibold text-gray-900 truncate">
                                  {getUserDisplayName(user)}
                                </p>
                                {/* Verification Badge */}
                                {user?.is_verified || user?.isVerified ? (
                                  <div className="flex items-center gap-1 shrink-0" title="Verified Account">
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-600 truncate flex-1">{user.email}</p>
                                {/* Verification Status Text */}
                                {user?.is_verified || user?.isVerified ? (
                                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 shrink-0">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                                    Unverified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Admin Dashboard Section - Separate section for admins */}
                        {isAdmin && (
                          <div className="px-2 pt-3 pb-2">
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors group"
                            >
                              <LayoutDashboard className="w-5 h-5 mr-3" />
                              <span className="text-sm font-medium">Admin Dashboard</span>
                              <Shield className="w-4 h-4 ml-auto" />
                            </Link>
                          </div>
                        )}

                        {/* Menu Items */}
                        <div className="py-1">
                          {userMenuItems.filter(item => !item.adminOnly).map((item, index) => (
                            <Link
                              key={index}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              handleLogout()
                            }}
                            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="text-sm font-medium">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    to="/auth/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              </div>
            </motion.div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 py-4"
              >
                {/* Mobile Search */}
                <div className="px-4 pb-3">
                  <SearchAutocomplete onSubmit={(q) => { setIsMenuOpen(false); navigate(`/products?search=${encodeURIComponent(q)}`) }} />
                </div>

                <div className="space-y-2">
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    to="/categories"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>

                {/* Mobile Account Section (collapsible) */}
                <div className="mt-2">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-800 font-medium hover:bg-gray-100"
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                  >
                    <span>Account</span>
                    <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isAccountOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-2 space-y-2"
                      >
                        {!user ? (
                          <>
                            <Link
                              to="/auth/login"
                              onClick={() => { setIsMenuOpen(false); setIsAccountOpen(false) }}
                              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/auth/register"
                              onClick={() => { setIsMenuOpen(false); setIsAccountOpen(false) }}
                              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                              Sign Up
                            </Link>
                          </>
                        ) : (
                          <>
                            {/* Admin Dashboard Link for Mobile */}
                            {isAdmin && (
                              <Link
                                to="/admin"
                                onClick={() => { setIsMenuOpen(false); setIsAccountOpen(false) }}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md mb-2"
                              >
                                <LayoutDashboard className="w-5 h-5" />
                                Admin Dashboard
                              </Link>
                            )}
                            <Link
                              to="/profile"
                              onClick={() => { setIsMenuOpen(false); setIsAccountOpen(false) }}
                              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
                            >
                              Profile
                            </Link>
                            <button
                              onClick={() => { setIsMenuOpen(false); setIsAccountOpen(false); handleLogout() }}
                              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                            >
                              Sign Out
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Search Bar - Expandable */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <SearchAutocomplete 
                      onSubmit={(q) => {
                        navigate(`/products?search=${encodeURIComponent(q)}`)
                        setIsMobileSearchOpen(false)
                      }} 
                    />
                  </div>
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs Section */}
        <div className={`border-t border-gray-200 ${scrolled ? 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5">
              <Link
                to="/products"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  location.pathname === '/products' && !location.search.includes('is_featured')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span>All Products</span>
              </Link>
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
              
              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    location.pathname.startsWith('/category') || location.pathname.startsWith('/categories')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Categories Dropdown Menu */}
                {showCategoriesDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category.id || category.slug}
                            to={`/categories/${category.slug}`}
                            onClick={() => setShowCategoriesDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            {category.image && (
                              <img
                                src={getImageUrl(category.image)}
                                alt={category.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                                {category.name}
                              </p>
                              {category.products_count !== undefined && (
                                <p className="text-xs text-gray-500">{category.products_count} products</p>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No categories available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showCategoriesDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCategoriesDropdown(false)}
          />
        )}
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

// Autocomplete Component
const SearchAutocomplete = ({ onSubmit }) => {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState({ type: null, index: -1 })
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)
  const controllerRef = useRef(null)

  // Calculate total items for keyboard navigation
  const getTotalItems = () => {
    if (!results?.results) return 0
    return (results.results.products?.length || 0) + 
           (results.results.categories?.length || 0) + 
           (results.results.brands?.length || 0)
  }

  // Get item at global index
  const getItemAtGlobalIndex = (globalIdx) => {
    if (!results?.results) return null
    const products = results.results.products || []
    const categories = results.results.categories || []
    const brands = results.results.brands || []
    
    if (globalIdx < products.length) {
      return { type: 'product', item: products[globalIdx], index: globalIdx }
    }
    globalIdx -= products.length
    if (globalIdx < categories.length) {
      return { type: 'category', item: categories[globalIdx], index: globalIdx }
    }
    globalIdx -= categories.length
    if (globalIdx < brands.length) {
      return { type: 'brand', item: brands[globalIdx], index: globalIdx }
    }
    return null
  }

  useEffect(() => {
    if (q.trim().length < 2) { setResults(null); setOpen(false); return }
    // debounce 300ms
    const t = setTimeout(async () => {
      try {
        controllerRef.current?.abort?.()
        controllerRef.current = new AbortController()
        setLoading(true)
        const data = await productsAPI.search(q, 5)
        setResults(data)
        setOpen(true)
        setHighlight({ type: null, index: -1 })
      } catch (e) { /* ignore */ }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onDoc = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const handleKeyDown = (e) => {
    if (!open || !results?.results) return
    const totalItems = getTotalItems()
    
    if (e.key === 'ArrowDown') { 
      e.preventDefault()
      let currentGlobalIdx = -1
      if (highlight.index >= 0) {
        const productsCount = results.results.products?.length || 0
        const categoriesCount = results.results.categories?.length || 0
        if (highlight.type === 'product') {
          currentGlobalIdx = highlight.index
        } else if (highlight.type === 'category') {
          currentGlobalIdx = productsCount + highlight.index
        } else if (highlight.type === 'brand') {
          currentGlobalIdx = productsCount + categoriesCount + highlight.index
        }
      }
      const nextIdx = Math.min(currentGlobalIdx + 1, totalItems - 1)
      const item = getItemAtGlobalIndex(nextIdx)
      if (item) {
        setHighlight({ type: item.type, index: item.index })
      }
    }
    if (e.key === 'ArrowUp') { 
      e.preventDefault()
      let currentGlobalIdx = totalItems
      if (highlight.index >= 0) {
        const productsCount = results.results.products?.length || 0
        const categoriesCount = results.results.categories?.length || 0
        if (highlight.type === 'product') {
          currentGlobalIdx = highlight.index
        } else if (highlight.type === 'category') {
          currentGlobalIdx = productsCount + highlight.index
        } else if (highlight.type === 'brand') {
          currentGlobalIdx = productsCount + categoriesCount + highlight.index
        }
      }
      const prevIdx = Math.max(currentGlobalIdx - 1, 0)
      const item = getItemAtGlobalIndex(prevIdx)
      if (item) {
        setHighlight({ type: item.type, index: item.index })
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight.index >= 0 && highlight.type) {
        let item = null
        if (highlight.type === 'product' && results.results.products) {
          item = results.results.products[highlight.index]
          if (item) navigate(`/products/${item.resource_id || item.slug}`)
        } else if (highlight.type === 'category' && results.results.categories) {
          item = results.results.categories[highlight.index]
          if (item) navigate(`/categories/${item.slug}`)
        } else if (highlight.type === 'brand' && results.results.brands) {
          item = results.results.brands[highlight.index]
          if (item) navigate(`/products?brand=${item.slug}`)
        }
        setOpen(false)
      } else if (q.trim()) {
        onSubmit?.(q.trim())
        setOpen(false)
      }
    }
    if (e.key === 'Escape') setOpen(false)
  }

  const handleItemClick = (type, item) => {
    if (type === 'product') {
      navigate(`/products/${item.resource_id || item.slug}`)
    } else if (type === 'category') {
      navigate(`/categories/${item.slug}`)
    } else if (type === 'brand') {
      navigate(`/products?brand=${item.slug}`)
    }
    setOpen(false)
  }

  return (
    <div className="relative w-full" ref={boxRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { if (results?.results) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder="Search products, categories, brands..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Loading state */}
            {loading && (
              <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            )}

            {/* Results */}
            {!loading && results?.results && (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {/* Products Section */}
                  {results.results.products && results.results.products.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Products {results.totals?.products > 0 && `(${results.totals.products})`}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {results.results.products.map((item, idx) => (
                          <li key={item.resource_id || idx}>
                            <button
                              onClick={() => handleItemClick('product', item)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                highlight.type === 'product' && highlight.index === idx ? 'bg-blue-50' : ''
                              }`}
                              onMouseEnter={() => setHighlight({ type: 'product', index: idx })}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                {item.image ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.brand && `${item.brand} • `}${item.price ? `$${item.price.toFixed(2)}` : ''}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Categories Section */}
                  {results.results.categories && results.results.categories.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Categories {results.totals?.categories > 0 && `(${results.totals.categories})`}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {results.results.categories.map((item, idx) => (
                          <li key={item.resource_id || item.slug || idx}>
                            <button
                              onClick={() => handleItemClick('category', item)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                highlight.type === 'category' && highlight.index === idx ? 'bg-blue-50' : ''
                              }`}
                              onMouseEnter={() => setHighlight({ type: 'category', index: idx })}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                {item.image ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Folder className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Category</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Brands Section */}
                  {results.results.brands && results.results.brands.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Brands {results.totals?.brands > 0 && `(${results.totals.brands})`}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {results.results.brands.map((item, idx) => (
                          <li key={item.resource_id || item.slug || idx}>
                            <button
                              onClick={() => handleItemClick('brand', item)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                highlight.type === 'brand' && highlight.index === idx ? 'bg-blue-50' : ''
                              }`}
                              onMouseEnter={() => setHighlight({ type: 'brand', index: idx })}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Brand</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* View all results */}
                {(results.totals?.products > 0 || results.totals?.categories > 0 || results.totals?.brands > 0) && (
                  <button
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-medium text-blue-600 hover:from-blue-100 hover:to-indigo-100 border-t border-gray-200 transition-colors"
                    onClick={() => { onSubmit?.(q.trim()); setOpen(false) }}
                  >
                    View all results for “{q}”
                  </button>
                )}
              </>
            )}

            {/* Empty state */}
            {!loading && results?.results && 
             (!results.results.products || results.results.products.length === 0) &&
             (!results.results.categories || results.results.categories.length === 0) &&
             (!results.results.brands || results.results.brands.length === 0) && (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
                <p className="text-xs text-gray-500 mb-4">Try different keywords or check your spelling.</p>
                <button
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => { onSubmit?.(q.trim()); setOpen(false) }}
                >
                  Search for “{q}” anyway
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
