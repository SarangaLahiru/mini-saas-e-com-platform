import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { authAPI } from '../../../services/api'
import tokenManager from '../../../utils/tokenManager'
import RegisterHeader from './components/RegisterHeader'
import RegisterForm from './components/RegisterForm'
import OTPVerification from '../../../components/auth/OTPVerification'
import AuthSkeleton from '../../../components/auth/AuthSkeleton'
import toast from 'react-hot-toast'

const Register = () => {
  const { googleAuth, needsVerification, user, isAuthenticated, refreshAuthState } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Check if user needs verification after registration
  useEffect(() => {
    if (needsVerification && user) {
      setEmail(user.email)
      setStep(2) // Go to OTP verification
    } else if (isAuthenticated && user) {
      // User is already verified, redirect to home
      navigate('/')
    }
  }, [needsVerification, user, isAuthenticated, navigate])

  const handleRegistrationSuccess = (userEmail) => {
    setEmail(userEmail)
    setStep(2) // Go to OTP verification
  }

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    try {
      await googleAuth()
      toast.success('Registration successful! Welcome to our platform!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Google registration failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleOTPVerify = async (otpCode) => {
    try {
      const response = await authAPI.verifyOTP(email, otpCode, 'email_verification')
      
      // Update user verification status
      if (response.user) {
        // Store tokens using token manager (modern standard)
        tokenManager.setTokens(response.access_token, response.refresh_token)
        
        // Show success message first
        toast.success('Email verified successfully! Welcome to our platform!')
        
        // Refresh auth state to update user data
        await refreshAuthState()
        
        // Small delay to show the success message, then redirect
        setTimeout(() => {
          // Use navigate instead of window.location.href for better state management
          navigate('/')
        }, 1000)
      } else {
        toast.error('Verification failed - no user data received')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'OTP verification failed')
      throw error
    }
  }

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email, 'email_verification')
      toast.success('OTP sent successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to resend OTP')
      throw error
    }
  }

  const handleBackToForm = () => {
    setStep(1)
  }

  // Show OTP verification step
  if (step === 2) {
    if (isLoading) {
      return <AuthSkeleton type="otp" />
    }
    
    return (
      <OTPVerification
        email={email}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        onBack={handleBackToForm}
        type="email_verification"
        isLoading={isLoading}
      />
    )
  }

  // Show loading state
  if (isLoading) {
    return <AuthSkeleton type="register" />
  }

  // Show registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <RegisterHeader />
        <RegisterForm 
          onSuccess={handleRegistrationSuccess}
          onGoogleAuth={handleGoogleAuth}
          isLoading={isLoading}
          isGoogleLoading={isGoogleLoading}
        />
      </motion.div>
    </div>
  )
}

export default Register