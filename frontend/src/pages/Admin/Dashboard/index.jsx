import React, { Suspense, useEffect, useState } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Card from '../../../components/ui/Card'
import { adminAPI } from '../../../services/adminApi'
import toast from '../../../utils/toast'

// Lazy load components
const DashboardStats = React.lazy(() => import('./components/DashboardStats'))
const RecentOrders = React.lazy(() => import('./components/RecentOrders'))
const TopProducts = React.lazy(() => import('./components/TopProducts'))

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await adminAPI.analytics.getDashboard()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-blue-100 text-base sm:text-lg">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button className="px-4 sm:px-5 py-2.5 text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Report</span>
            </button>
            <button className="px-4 sm:px-5 py-2.5 text-sm font-semibold bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Quick Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats stats={stats} />
      </Suspense>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Suspense fallback={
          <Card className="p-6">
            <div className="flex items-center justify-center min-h-[300px]">
              <LoadingSpinner />
            </div>
          </Card>
        }>
          <RecentOrders />
        </Suspense>
        
        <Suspense fallback={
          <Card className="p-6">
            <div className="flex items-center justify-center min-h-[300px]">
              <LoadingSpinner />
            </div>
          </Card>
        }>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  )
}

export default AdminDashboard
