import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { formatPrice, formatDate } from '../../../../utils/format'
import { adminAPI } from '../../../../services/adminApi'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'

const RecentOrders = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.analytics.getDashboard(),
    staleTime: 30000, // Cache for 30 seconds
  })

  const orders = dashboardData?.recent_orders || []

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || ''
    switch (statusLower) {
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'shipped':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'processing':
        return 'text-purple-700 bg-purple-100 border-purple-200'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'refunded':
        return 'text-gray-700 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length > 0 ? `${orders.length} latest transactions` : 'No recent orders'}
          </p>
        </div>
        <Link to="/admin/orders">
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
          >
            View All
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No recent orders</p>
          <p className="text-sm text-gray-400 mt-1">Orders will appear here as they come in</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to="/admin/orders"
              state={{ orderId: order.id }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-white border border-gray-100 hover:border-blue-200 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all shadow-sm">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {order.order_number || `#${order.orderNumber || order.id}`}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {order.customer || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(order.created_at || order.date)}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg text-gray-900 mb-1">
                  {formatPrice(order.total || order.total_amount || 0)}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

export default RecentOrders
