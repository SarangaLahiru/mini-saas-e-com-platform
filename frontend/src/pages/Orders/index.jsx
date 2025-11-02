import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import OrdersList from './components/OrdersList'
import OrdersFilter from './components/OrdersFilter'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const Orders = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 10,
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-orders', filters],
    queryFn: () => ordersAPI.getOrders(filters),
    retry: 1,
    enabled: !!user,
  })

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      payment_status: '',
      date_from: '',
      date_to: '',
      page: 1,
      limit: 10,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600">View and manage all your orders</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <OrdersFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Orders List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 text-center">
                <p className="text-red-600">Failed to load orders. Please try again.</p>
              </div>
            ) : (
              <OrdersList
                orders={data?.orders || []}
                total={data?.total || 0}
                page={filters.page}
                limit={filters.limit}
                onPageChange={handlePageChange}
                onOrderClick={(order) => {
                  // Navigate to order details or open modal
                  window.location.href = `/orders/${order.resource_id}`
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
