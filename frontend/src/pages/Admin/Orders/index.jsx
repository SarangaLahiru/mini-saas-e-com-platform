import React, { Suspense, useState } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../../services/adminApi'

// Lazy load components
const OrdersTable = React.lazy(() => import('./components/OrdersTable'))
const OrdersFilter = React.lazy(() => import('./components/OrdersFilter'))
const OrderDetailsModal = React.lazy(() => import('./components/OrderDetailsModal'))

const AdminOrders = () => {
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: '',
    page: 1,
    limit: 20,
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.paymentStatus) params.payment_status = filters.paymentStatus
      if (filters.search) params.search = filters.search
      params.page = filters.page
      params.limit = filters.limit
      
      return await adminAPI.orders.getOrders(params)
    },
  })

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const handleStatusUpdate = () => {
    refetch()
    setShowDetailsModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSpinner />}>
            <OrdersFilter filters={filters} onFilterChange={setFilters} />
          </Suspense>
        </div>
        
        <div className="lg:col-span-3">
          <Suspense fallback={<LoadingSpinner />}>
            <OrdersTable
              orders={data?.orders || []}
              loading={isLoading}
              total={data?.total || 0}
              page={filters.page}
              limit={filters.limit}
              onPageChange={(page) => setFilters({ ...filters, page })}
              onViewOrder={handleViewOrder}
              onStatusUpdate={handleStatusUpdate}
            />
          </Suspense>
        </div>
      </div>

      {showDetailsModal && selectedOrder && (
        <Suspense fallback={<LoadingSpinner />}>
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedOrder(null)
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        </Suspense>
      )}
    </div>
  )
}

export default AdminOrders
