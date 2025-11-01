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
import { extractErrorMessage } from '../../../utils/errorUtils'

const Register = () => {
  const { googleAuth, needsVerification, user, isAuthenticated, refreshAuthState } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Check if user needs verification after registration
  // Only move to OTP step when needed - don't auto-redirect during OTP verification
  useEffect(() => {
    if (needsVerification && user && step === 1) {
      setEmail(user.email)
      setStep(2) // Go to OTP verification
    }
    // Note: Redirect after successful OTP verification is handled in handleOTPVerify
    // We don't auto-redirect here to avoid redirecting on errors
  }, [needsVerification, user, step])

  const handleRegistrationSuccess = (userEmail) => {
    setEmail(userEmail)
    setStep(2) // Go to OTP verification
  }

  // Note: handleGoogleAuth is not needed here since Google redirects to /auth/google/callback
  // The GoogleCallback component handles the auth flow and redirect

  const handleOTPVerify = async (otpCode) => {
    try {
      const response = await authAPI.verifyOTP(email, otpCode, 'email_verification')
      
      // Update user verification status
      if (response.user) {
        // Store tokens using token manager (modern standard)
        tokenManager.setTokens(response.access_token, response.refresh_token)
        
        // Refresh auth state to update user data
        await refreshAuthState()
        
        // Show success toast
        toast.success('Email verified successfully!')
        
        // Small delay for smooth transition, then redirect
        setTimeout(() => {
          navigate('/')
        }, 800)
      } else {
        const errorMessage = 'Verification failed - no user data received'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      // Extract error message from backend
      const errorMessage = extractErrorMessage(error, {
        defaultMessage: 'OTP verification failed. Please try again.'
      })
      
      // Don't show toast - error is shown in OTPVerification component
      // Re-throw error so OTPVerification can handle it
      throw error
    }
  }

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email, 'email_verification')
      toast.success('New OTP code sent to your email')
    } catch (error) {
      const errorMessage = extractErrorMessage(error, {
        defaultMessage: 'Failed to resend OTP. Please try again.'
      })
      toast.error(errorMessage)
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
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  )
}

export default Register