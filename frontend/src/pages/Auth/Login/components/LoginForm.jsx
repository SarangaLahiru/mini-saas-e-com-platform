import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  User
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import GoogleAuthButton from '../../../../components/auth/GoogleAuthButton'
import useGoogleAuth from '../../../../hooks/useGoogleAuth'
import { extractErrorMessage } from '../../../../utils/errorUtils'

const LoginForm = ({ onSuccess, onGoogleAuth, isLoading, isGoogleLoading }) => {
  // Note: onGoogleAuth is not used since Google redirects to /auth/google/callback
  const { login } = useAuth()
  const { 
    startGoogleRedirect, 
    isLoading: isGoogleAuthLoading
  } = useGoogleAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    
    // Focus on first field with error
    if (newErrors.email && emailRef.current) {
      emailRef.current.focus()
    } else if (newErrors.password && passwordRef.current) {
      passwordRef.current.focus()
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Only clear field-specific validation errors when user starts typing
    // Keep submit errors visible so user knows what went wrong
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Don't clear submit errors - let them persist until next submission attempt
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    // Clear previous submit errors before new validation
    setErrors(prev => ({ ...prev, submit: '' }))
    
    if (!validateForm()) {
      return false
    }

    setIsSubmitting(true)
    try {
      const resp = await login({ email: formData.email, password: formData.password })
      // Small delay to show processing, then success state
      await new Promise(resolve => setTimeout(resolve, 500))
      // Clear errors on success
      setErrors({})
      onSuccess(resp?.user) // Pass user up for role-based redirect
    } catch (error) {
      setIsSubmitting(false)
      
      // Extract error message from backend response using utility function
      const errorMessage = extractErrorMessage(error, {
        defaultMessage: 'Invalid email or password. Please try again.'
      })
      
      setErrors(prev => ({ ...prev, submit: errorMessage }))
      
      // Focus on email field if login fails
      if (emailRef.current) {
        setTimeout(() => {
          emailRef.current?.focus()
        }, 100)
      }
      
      // No toast notification - error is shown in the form
      return false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
    >
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6" 
        noValidate
        onKeyDown={(e) => {
          // Prevent form submission on Enter key if disabled
          if ((e.key === 'Enter' || e.keyCode === 13) && (isSubmitting || isLoading)) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {/* General Error Message */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2"
          >
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium flex-1">{errors.submit}</p>
            <button
              type="button"
              onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
              className="text-red-500 hover:text-red-700 transition-colors ml-2"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={emailRef}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Signing in...
            </div>
          ) : (
            <div className="flex items-center">
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Auth */}
        <GoogleAuthButton
          onClick={startGoogleRedirect}
          isLoading={isGoogleAuthLoading}
          disabled={isSubmitting || isLoading}
        />
      </form>


      {/* Links */}
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <Link
            to="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default LoginForm
