import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from '../../utils/toast'
import { extractErrorMessage } from '../../utils/errorUtils'

const OTPVerification = ({ 
  email, 
  onVerify, 
  onResend, 
  onBack, 
  type = 'email_verification',
  isLoading = false 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const firstInputRef = useRef(null)

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // Auto-focus next input
  const handleInputChange = (index, value) => {
    if (value.length > 1) return
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setOtp(newOtp)
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5)
    const lastInput = document.getElementById(`otp-${lastFilledIndex}`)
    lastInput?.focus()
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code')
      firstInputRef.current?.focus()
      return
    }

    setIsVerifying(true)
    setError('') // Clear previous errors
    try {
      await onVerify(otpCode)
      // Success is handled by parent - will redirect
    } catch (err) {
      setIsVerifying(false)
      
      // Extract error message from backend
      const errorMessage = extractErrorMessage(err, {
        defaultMessage: 'Invalid OTP code. Please check and try again.'
      })
      
      setError(errorMessage)
      
      // Clear OTP inputs and focus first input
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)
      
      // Don't show toast - error is shown in form
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResend()
      setTimeLeft(300) // Reset timer
      setOtp(['', '', '', '', '', ''])
      // Toast is already handled by parent component (Register/index.jsx)
    } catch (error) {
      // Error toast is already handled by parent component
      console.error('Failed to resend OTP:', error)
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isOtpComplete = otp.every(digit => digit !== '')
  const isExpired = timeLeft === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-8 h-8 text-blue-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit code to
            </p>
            <p className="text-blue-600 font-semibold">
              {email}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2"
            >
              <div className="flex-shrink-0 mt-0.5">
                <XCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={index === 0 ? firstInputRef : null}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`
                    w-12 h-12 text-center text-xl font-bold border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${error ? 'border-red-300 bg-red-50' : digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${isExpired ? 'border-red-300 bg-red-50' : ''}
                  `}
                  disabled={isVerifying || isLoading}
                  whileFocus={{ scale: 1.05 }}
                  whileHover={{ scale: 1.02 }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            {timeLeft > 0 ? (
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Code expires in {formatTime(timeLeft)}
              </div>
            ) : (
              <div className="flex items-center justify-center text-sm text-red-600">
                <XCircle className="w-4 h-4 mr-2" />
                Code expired
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isOtpComplete || isVerifying || isLoading || isExpired}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center
              ${isOtpComplete && !isExpired && !isVerifying
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isVerifying ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center">
                Verify Email
                <CheckCircle className="w-5 h-5 ml-2" />
              </div>
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={isResending || timeLeft > 0}
              className={`
                text-sm font-medium transition-colors duration-200
                ${timeLeft > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700'
                }
              `}
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-6">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 mx-auto transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to registration
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default OTPVerification