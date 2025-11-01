import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import EnhancedHeader from './components/layout/EnhancedHeader'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'
import AdminLayout from './components/layout/AdminLayout'
import PageSkeleton from './components/ui/PageSkeleton'
import SkeletonHeader from './components/ui/SkeletonHeader'
import SkeletonList from './components/ui/SkeletonList'
import AuthSkeleton from './components/auth/AuthSkeleton'
import ProcessingLoader from './components/ui/ProcessingLoader'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/Home'))
const Products = React.lazy(() => import('./pages/Products'))
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'))
const Category = React.lazy(() => import('./pages/Category'))
const Cart = React.lazy(() => import('./pages/Cart'))
const Checkout = React.lazy(() => import('./pages/Checkout'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Orders = React.lazy(() => import('./pages/Orders'))
const Login = React.lazy(() => import('./pages/Auth/Login'))
const Register = React.lazy(() => import('./pages/Auth/Register'))
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'))
const AdminProducts = React.lazy(() => import('./pages/Admin/Products'))
const AdminOrders = React.lazy(() => import('./pages/Admin/Orders'))
const AdminUsers = React.lazy(() => import('./pages/Admin/Users'))
const AdminAnalysis = React.lazy(() => import('./pages/Admin/Analysis'))
const AdminCustomers = React.lazy(() => import('./pages/Admin/Customers'))
const AdminCustomerDetail = React.lazy(() => import('./pages/Admin/Customers/components/CustomerDetail'))
const AdminCategories = React.lazy(() => import('./pages/Admin/Categories'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
const GoogleCallback = React.lazy(() => import('./pages/Auth/GoogleCallback'))

// Hooks
import { useAuth } from './contexts/AuthContext'
import { useCart } from './contexts/CartContext'
import { useApp } from './contexts/AppContext'

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { sidebarOpen, setSidebar } = useApp()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthRoute = location.pathname.startsWith('/auth')

  // Check if we're coming from Google auth callback to show consistent loading
  const isFromGoogleAuth = sessionStorage.getItem('google_auth_redirecting') === 'true'
  
  // If coming from Google auth, show ProcessingLoader overlay until page loads
  // This ensures smooth transition without skeleton flash
  // IMPORTANT: All hooks must be called before any early returns
  useEffect(() => {
    if (isFromGoogleAuth && isLoading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFromGoogleAuth, isLoading])
  
  // Clear the flag once loading completes
  useEffect(() => {
    if (isFromGoogleAuth && !isLoading) {
      sessionStorage.removeItem('google_auth_redirecting')
    }
  }, [isFromGoogleAuth, isLoading])
  
  // Only show skeleton on initial app load, not during auth operations
  // Skip skeleton on auth routes (they handle their own loading states)
  // Also skip if coming from Google auth (show ProcessingLoader overlay instead)
  if (isLoading && !isAuthRoute && !isFromGoogleAuth) {
    return <PageSkeleton.FullPage showHeader={!isAdminRoute} showFooter={!isAdminRoute} />
  }
  
  if (isFromGoogleAuth && isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <ProcessingLoader
              message="Loading your dashboard..."
              subMessage="Please wait while we set everything up"
              variant="success"
              size="md"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && <EnhancedHeader />}
      
      <main className="min-h-screen">
        <AnimatePresence mode="wait" key={location.pathname}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-50">
                    <SkeletonHeader />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <SkeletonList count={6} variant="product" />
                    </div>
                  </div>
                }>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Home />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/products" 
              element={
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-50">
                    <SkeletonHeader />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <SkeletonList count={8} variant="product" />
                    </div>
                  </div>
                }>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Products />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/products/:id" 
              element={
                <Suspense fallback={<PageSkeleton.ProductDetail />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <ProductDetail />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/category/:slug" 
              element={
                <Suspense fallback={<PageSkeleton.ProductsList />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Category />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <Suspense fallback={<PageSkeleton.Cart />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Cart />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/auth/login" 
              element={
                <Suspense fallback={<AuthSkeleton type="login" />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Login />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/auth/register" 
              element={
                <Suspense fallback={<AuthSkeleton type="register" />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Register />
                  </motion.div>
                </Suspense>
              } 
            />
            <Route 
              path="/auth/forgot-password" 
              element={<ForgotPassword />} 
            />
            <Route 
              path="/auth/reset-password" 
              element={<ResetPassword />} 
            />
            <Route 
              path="/auth/google/callback" 
              element={
                <Suspense fallback={<AuthSkeleton type="login" />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <GoogleCallback />
                  </motion.div>
                </Suspense>
              } 
            />
            {/* Legacy routes for backward compatibility */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            
            {/* Protected Routes */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Suspense fallback={<PageSkeleton.Checkout />}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Checkout />
                    </motion.div>
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Suspense fallback={<PageSkeleton.Profile />}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Profile />
                    </motion.div>
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Suspense fallback={<PageSkeleton.Profile />}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Orders />
                    </motion.div>
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              } 
            >
                    <Route
                      index
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminDashboard />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route
                      path="analysis"
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminAnalysis />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route
                      path="customers"
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminCustomers />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route
                      path="customers/:id"
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminCustomerDetail />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route
                      path="products"
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminProducts />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route
                      path="categories"
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminCategories />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminOrders />
                          </motion.div>
                        </Suspense>
                      }
                    />
                    <Route 
                      path="users" 
                      element={
                        <Suspense fallback={<PageSkeleton.Admin />}>
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <AdminUsers />
                          </motion.div>
                        </Suspense>
                      } 
                    />
            </Route>
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <Suspense fallback={<PageSkeleton.FullPage />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <NotFound />
                  </motion.div>
                </Suspense>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
      
      {!isAdminRoute && (
        <>
          <Footer />
          <Sidebar />
        </>
      )}
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App