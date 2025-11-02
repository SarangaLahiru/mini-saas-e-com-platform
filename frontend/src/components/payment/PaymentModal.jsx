import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useMutation } from '@tanstack/react-query'
import { 
  X, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Loader2,
  Shield,
  ArrowRight,
  Calendar,
  User
} from 'lucide-react'
import { paymentsAPI } from '../../services/api'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { formatPrice } from '../../utils/format'
import toast from '../../utils/toast'

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [step, setStep] = useState(1) // 1: Payment Form, 2: Processing, 3: Success
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [errors, setErrors] = useState({})

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setIsProcessing(false)
      setCardNumber('')
      setCardName('')
      setExpiryDate('')
      setCvv('')
      setErrors({})
    }
  }, [isOpen])

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    }
    return v
  }

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    
    if (!cardName || cardName.length < 3) {
      newErrors.cardName = 'Please enter the cardholder name'
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)'
    }
    
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (paymentData) => paymentsAPI.createPayment(paymentData),
    onSuccess: (data) => {
      setIsProcessing(false)
      setStep(3) // Show success step
      toast.success('Payment processed successfully and saved to database!')
      setTimeout(() => {
        onPaymentSuccess && onPaymentSuccess(data)
        onClose()
      }, 2000)
    },
    onError: (error) => {
      setIsProcessing(false)
      setStep(1)
      const message = error?.response?.data?.message || error?.message || 'Payment failed. Please try again.'
      toast.error(message)
      console.error('Payment creation error:', error)
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!orderData?.resource_id) {
      toast.error('Order information is missing. Please try again.')
      return
    }

    setIsProcessing(true)
    setStep(2) // Show processing step

    // Map payment method from frontend to backend
    const paymentMethodMap = {
      'card': 'credit_card',
      'paypal': 'paypal',
    }
    const backendMethod = paymentMethodMap[orderData.paymentMethod] || 'credit_card'

    // Generate transaction ID
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // Prepare payment data
    const paymentData = {
      order_resource_id: orderData.resource_id,
      method: backendMethod,
      amount: orderData.total,
      currency: orderData.currency || 'USD',
      transaction_id: transactionId,
      gateway_response: JSON.stringify({
        status: 'completed',
        card_last4: cardNumber.slice(-4).replace(/\s/g, ''),
        card_brand: 'visa', // Default for demo
      }),
    }

    // Create payment via API
    createPaymentMutation.mutate(paymentData)
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={step === 1 ? onClose : undefined}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Secure Payment</h2>
                <p className="text-sm text-blue-100">Your payment is encrypted and secure</p>
              </div>
            </div>
            {step === 1 && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Payment Form */}
            {step === 1 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Order Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(orderData?.total || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.cardName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.cardName && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardName}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.expiryDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  Pay {formatPrice(orderData?.total || 0)}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.form>
            )}

            {/* Processing Step */}
            {step === 2 && (isProcessing || createPaymentMutation.isPending) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-16 h-16 text-blue-600" />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-600 text-center">
                  Please wait while we securely process your payment...
                </p>
                <div className="mt-6 flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
            )}

            {/* Success Step */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="bg-green-100 rounded-full p-4 mb-6"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Your order has been placed successfully.
                </p>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(orderData?.total || 0)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Redirecting to order details...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default PaymentModal

