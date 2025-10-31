import React, { Suspense } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Lazy load components
const ProfileInfo = React.lazy(() => import('./components/ProfileInfo'))
const OrderHistory = React.lazy(() => import('./components/OrderHistory'))

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <ProfileInfo />
            </Suspense>
          </div>
          
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <OrderHistory />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
