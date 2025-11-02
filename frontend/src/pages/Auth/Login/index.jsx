import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import LoginHeader from './components/LoginHeader'
import LoginForm from './components/LoginForm'
import ProcessingLoader from '../../../components/ui/ProcessingLoader'
import toast from '../../../utils/toast'

const Login = () => {
  const { login, googleAuth, user, isAuthenticated, isLoading: authIsLoading } = useAuth()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const hasNavigated = useRef(false)

  const handleLoginSuccess = async (userData) => {
    // Show success animation
    setShowSuccess(true)
    setIsProcessing(false)
    
    // Small delay for success animation, then navigate
    setTimeout(() => {
      const path = userData?.isAdmin || userData?.is_admin ? '/admin' : '/'
      navigate(path, { replace: true })
      hasNavigated.current = true
    }, 800)
  }

  // Note: handleGoogleAuth is not needed here since Google redirects to /auth/google/callback
  // The GoogleCallback component handles the auth flow
  
  // If already logged in, redirect based on role (only on initial mount, not during login process)
  // But don't redirect if user is on Google callback page
  useEffect(() => {
    if (isAuthenticated && !hasNavigated.current && !isProcessing && !showSuccess && window.location.pathname !== '/auth/google/callback') {
      const path = user?.isAdmin || user?.is_admin ? '/admin' : '/'
      navigate(path, { replace: true })
      hasNavigated.current = true
    }
  }, [isAuthenticated, user, navigate, isProcessing, showSuccess])

  // Show success state with smooth transition
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <ProcessingLoader
              message="Login successful!"
              subMessage="Redirecting you now..."
              variant="success"
              size="md"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  // Only show loading skeleton on initial auth check, not during login
  if (authIsLoading && !isAuthenticated && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <ProcessingLoader
              message="Checking authentication..."
              variant="default"
              size="md"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto mb-8"
          >
            <LoginHeader />
            <LoginForm 
              onSuccess={handleLoginSuccess}
              isLoading={isProcessing}
            />
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default Login