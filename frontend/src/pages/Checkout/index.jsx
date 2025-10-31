import React, { Suspense } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Lazy load components
const CheckoutForm = React.lazy(() => import('./components/CheckoutForm'))
const OrderSummary = React.lazy(() => import('./components/OrderSummary'))

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <CheckoutForm />
            </Suspense>
          </div>
          
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <OrderSummary />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
