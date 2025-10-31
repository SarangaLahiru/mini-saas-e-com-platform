import React, { Suspense } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

// Lazy load components
const OrdersTable = React.lazy(() => import('./components/OrdersTable'))
const OrdersFilter = React.lazy(() => import('./components/OrdersFilter'))

const AdminOrders = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <OrdersFilter />
            </Suspense>
          </div>
          
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <OrdersTable />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
