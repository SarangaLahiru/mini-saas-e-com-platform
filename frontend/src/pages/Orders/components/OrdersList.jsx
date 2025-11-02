import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Package, Truck, CheckCircle2, Clock, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { ordersAPI } from '../../../services/api'
import { formatPrice, formatDate } from '../../../utils/format'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import OrderDetailsModal from '../../../components/orders/OrderDetailsModal'

const OrdersList = ({ orders, total, page, limit, onPageChange, onOrderClick }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: Clock,
        label: 'Pending',
      },
      processing: {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: Package,
        label: 'Processing',
      },
      shipped: {
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        icon: Truck,
        label: 'Shipped',
      },
      delivered: {
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle2,
        label: 'Delivered',
      },
      cancelled: {
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertCircle,
        label: 'Cancelled',
      },
    }
    return configs[status?.toLowerCase()] || configs.pending
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const totalPages = Math.ceil(total / limit)

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center bg-white shadow-lg border border-gray-200">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700 mb-2">No orders found</p>
        <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order, index) => {
          const statusConfig = getStatusConfig(order.status)
          const StatusIcon = statusConfig.icon

          return (
            <motion.div
              key={order.resource_id || order.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
                <Card className="p-6 bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="space-y-4">
                    {/* Order Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            #{order.order_number || order.resource_id || `ORD-${order.id}`}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          {order.payment_status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.payment_status === 'paid' 
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : order.payment_status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Placed on {formatDate(order.created_at || order.createdAt || order.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 mb-1">
                          {formatPrice(order.total || order.total_amount || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.item_count || 0} item{(order.item_count || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                        <p className="text-sm font-medium text-gray-700">{formatPrice(order.subtotal || 0)}</p>
                      </div>
                      {order.shipping_cost > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Shipping</p>
                          <p className="text-sm font-medium text-gray-700">{formatPrice(order.shipping_cost || 0)}</p>
                        </div>
                      )}
                      {order.tax_amount > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tax</p>
                          <p className="text-sm font-medium text-gray-700">{formatPrice(order.tax_amount || 0)}</p>
                        </div>
                      )}
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{order.item_count || 0} item{(order.item_count || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-lg transition-colors ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className={`p-2 rounded-lg transition-colors ${
                page >= totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </>
  )
}

export default OrdersList
