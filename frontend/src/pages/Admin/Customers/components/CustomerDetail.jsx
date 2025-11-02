import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Card from '../../../../components/ui/Card'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import { adminAPI } from '../../../../services/adminApi'
import { formatPrice, formatDate } from '../../../../utils/format'
import toast from '../../../../utils/toast'

const CustomerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: customerData, isLoading, error } = useQuery({
    queryKey: ['admin-customer-detail', id],
    queryFn: () => adminAPI.users.getUser(id),
    enabled: !!id,
  })

  const customer = customerData?.user || customerData || null
  const orders = customerData?.orders || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500 mb-4">Customer not found</p>
        <button
          onClick={() => navigate('/admin/customers')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Customers
        </button>
      </div>
    )
  }

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

  const getPaymentStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || ''
    switch (statusLower) {
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'processing':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'failed':
        return 'text-red-700 bg-red-100 border-red-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">View customer information and order history</p>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar
            src={customer.avatar}
            name={customer.first_name || customer.username || 'Customer'}
            size="lg"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {customer.first_name && customer.last_name
                  ? `${customer.first_name} ${customer.last_name}`
                  : customer.username || 'Customer'}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge className={customer.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {customer.is_verified && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Verified</Badge>
                )}
                {customer.is_admin && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">Admin</Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{customer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-sm font-medium text-gray-900">@{customer.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(customer.created_at || customer.createdAt)}
                </p>
              </div>
              {customer.last_login_at && (
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(customer.last_login_at || customer.lastLoginAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{customer.orders_count || orders.length || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(customer.total_spent || 0)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Section */}
      <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Order History</h3>
            <p className="text-sm text-gray-500 mt-1">
              {orders.length > 0 ? `${orders.length} orders found` : 'No orders yet'}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">This customer hasn't placed any orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.resource_id || order.id}
                className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">
                        {order.order_number || `#${order.resource_id || order.id}`}
                      </h4>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                      </Badge>
                      <Badge className={`${getPaymentStatusColor(order.payment_status)} border`}>
                        {order.payment_status || 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.created_at || order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(order.total || order.total_amount || 0)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h5>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={item.resource_id || idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product?.name || item.product_name || 'Product'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {item.product?.sku && (
                                <span className="text-xs text-gray-500">SKU: {item.product.sku}</span>
                              )}
                              <span className="text-xs text-gray-500">Qty: {item.quantity || 0}</span>
                              <span className="text-xs text-gray-500">
                                @ {formatPrice(item.price || 0)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.total || (item.price || 0) * (item.quantity || 0))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(order.subtotal || order.Subtotal || 0)}
                    </p>
                  </div>
                  {order.tax_amount > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tax</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(order.tax_amount || order.TaxAmount || 0)}
                      </p>
                    </div>
                  )}
                  {order.shipping_cost > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Shipping</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(order.shipping_cost || order.ShippingCost || 0)}
                      </p>
                    </div>
                  )}
                  {order.discount_amount > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Discount</p>
                      <p className="text-sm font-medium text-green-600">
                        -{formatPrice(order.discount_amount || order.DiscountAmount || 0)}
                      </p>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default CustomerDetail

