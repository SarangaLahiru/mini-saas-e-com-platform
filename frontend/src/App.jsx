import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import EnhancedHeader from './components/layout/EnhancedHeader'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'
import LoadingSpinner from './components/ui/LoadingSpinner'
import SkeletonHeader from './components/ui/SkeletonHeader'
import SkeletonList from './components/ui/SkeletonList'
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

function App() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { sidebarOpen, setSidebar } = useApp()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
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
                <Suspense fallback={<LoadingSpinner />}>
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
                <Suspense fallback={<LoadingSpinner />}>
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
                <Suspense fallback={<LoadingSpinner />}>
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
                <Suspense fallback={<LoadingSpinner />}>
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
                <Suspense fallback={<LoadingSpinner />}>
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
                <Suspense fallback={<LoadingSpinner />}>
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
                  <Suspense fallback={<LoadingSpinner />}>
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
                  <Suspense fallback={<LoadingSpinner />}>
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
                  <Suspense fallback={<LoadingSpinner />}>
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
              path="/admin" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <Suspense fallback={<LoadingSpinner />}>
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
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <Suspense fallback={<LoadingSpinner />}>
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
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <Suspense fallback={<LoadingSpinner />}>
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
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <Suspense fallback={<LoadingSpinner />}>
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
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
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
      
      <Footer />
      <Sidebar />
    </div>
  )
}

export default App