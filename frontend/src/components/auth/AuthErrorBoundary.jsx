import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AuthErrorBoundary = ({ children }) => {
  const { error, clearError, refreshAuthState } = useAuth()
  const navigate = useNavigate()

  const handleRetry = async () => {
    try {
      await refreshAuthState()
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  const handleLogin = () => {
    clearError()
    navigate('/auth/login')
  }

  if (error && error.includes('Session expired')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Session Expired
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your session has expired. Please login again to continue.
          </p>
          
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login Again
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return children
}

export default AuthErrorBoundary
