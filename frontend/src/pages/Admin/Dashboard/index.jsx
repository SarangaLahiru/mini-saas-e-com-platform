import React, { Suspense } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

// Lazy load components
const DashboardStats = React.lazy(() => import('./components/DashboardStats'))
const RecentOrders = React.lazy(() => import('./components/RecentOrders'))
const TopProducts = React.lazy(() => import('./components/TopProducts'))

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardStats />
          </Suspense>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<LoadingSpinner />}>
              <RecentOrders />
            </Suspense>
            
            <Suspense fallback={<LoadingSpinner />}>
              <TopProducts />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
