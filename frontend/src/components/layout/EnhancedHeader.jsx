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
  Settings,
  LogOut,
  Package,
  CreditCard,
  MapPin,
  HelpCircle,
  Sparkles,
  Mail
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { productsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { getUserDisplayName } from '../../utils/userUtils'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const userMenuItems = [
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
    },
    {
      icon: Heart,
      label: 'Wishlist',
      href: '/wishlist',
      description: 'Your saved items'
    },
    {
      icon: MapPin,
      label: 'Addresses',
      href: '/addresses',
      description: 'Manage addresses'
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      href: '/payment-methods',
      description: 'Manage payment info'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      description: 'Account settings'
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
                onClick={() => navigate('/products')}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>

              {/* Notifications (hide on xs) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-flex"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>

              {/* Wishlist (hide on xs) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-flex"
                title="Wishlist"
              >
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Cart (always visible) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar 
                      user={user} 
                      size="sm" 
                      showOnlineStatus={true}
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <Avatar 
                              user={user} 
                              size="lg" 
                              showOnlineStatus={true}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {getUserDisplayName(user)}
                                </p>
                                {/* Verification Status */}
                                {user?.is_verified || user?.isVerified ? (
                                  <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Verified</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>Unverified</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                              {/* Account Type */}
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <User className="w-3 h-3" />
                                  <span>
                                    {user?.is_admin || user?.isAdmin ? 'Admin Account' : 'Standard Account'}
                                  </span>
                                </div>
                                {user?.google_id || user?.googleId ? (
                                  <div className="flex items-center space-x-1 text-xs text-blue-600">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span>Google</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Mail className="w-3 h-3" />
                                    <span>Email</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {userMenuItems.map((item, index) => (
                            <Link
                              key={index}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              handleLogout()
                            }}
                            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            <div>
                              <p className="font-medium">Sign Out</p>
                              <p className="text-sm text-red-500">Log out of your account</p>
                            </div>
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
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)
  const controllerRef = useRef(null)

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    // debounce 200ms
    const t = setTimeout(async () => {
      try {
        controllerRef.current?.abort?.()
        controllerRef.current = new AbortController()
        setLoading(true)
        const data = await productsAPI.suggest(q, 8)
        setResults(data)
        setOpen(true)
        setHighlight(-1)
      } catch (e) { /* ignore */ }
      finally { setLoading(false) }
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onDoc = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && results[highlight]) {
        window.location.href = `/products/${results[highlight].slug}`
      } else if (q.trim()) {
        onSubmit?.(q.trim())
      }
      setOpen(false)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative w-full" ref={boxRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
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
              <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center">
                Searching...
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <>
                <ul className="divide-y divide-gray-100 max-h-96 overflow-auto">
                  {results.map((item, idx) => (
                    <li key={item.id}>
                      <Link
                        to={`/products/${item.slug}`}
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 ${highlight===idx?'bg-gray-50':''}`}
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => setOpen(false)}
                      >
                        <img src={item.image || 'https://via.placeholder.com/64'} alt={item.name} className="w-12 h-12 rounded object-cover bg-gray-100" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 truncate">{item.brand || '—'} • ${item.price?.toFixed(2)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* View all results */}
                <button
                  className="w-full text-left px-3 py-2 bg-gray-50 text-sm text-blue-600 hover:bg-gray-100 border-t border-gray-200"
                  onClick={() => { onSubmit?.(q.trim()); setOpen(false) }}
                >
                  View all results for “{q}”
                </button>
              </>
            )}

            {/* Empty state */}
            {!loading && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No products found</p>
                <p className="text-xs text-gray-500 mt-1">Try different keywords or check your spelling.</p>
                <button
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                  onClick={() => { onSubmit?.(q.trim()); setOpen(false) }}
                >
                  Search for “{q}”
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
