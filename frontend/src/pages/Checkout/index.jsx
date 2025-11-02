import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import CheckoutForm from './components/CheckoutForm'
import OrderSummary from './components/OrderSummary'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const Checkout = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>
          <p className="text-gray-600">Complete your order securely</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - 2 columns */}
          <div className="lg:col-span-2">
            <React.Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <LoadingSpinner />
              </div>
            }>
              <CheckoutForm />
            </React.Suspense>
          </div>
          
          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <React.Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <LoadingSpinner />
              </div>
            }>
              <OrderSummary />
            </React.Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
