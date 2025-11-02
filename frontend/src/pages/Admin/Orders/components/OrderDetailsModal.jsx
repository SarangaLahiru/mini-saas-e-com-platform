import React, { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Input from '../../../../components/ui/Input'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import { adminAPI } from '../../../../services/adminApi'
import { formatPrice, formatDate } from '../../../../utils/format'
import { getImageUrl } from '../../../../utils/imageUrl'
import toast from '../../../../utils/toast'

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order?.status || '')
  const [statusNotes, setStatusNotes] = useState('')

  // Update selected status when order changes
  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status)
    }
  }, [order?.status])

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  
  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    }
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status) => {
    const paymentColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800', // alias for completed
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    }
    return paymentColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) {
      toast.error('Please select a different status')
      return
    }

    setUpdating(true)
    try {
      await adminAPI.orders.updateStatus(order.resource_id, selectedStatus, statusNotes)
      toast.success('Order status updated successfully')
      onStatusUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const customerName = order?.customer 
    ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || order.customer.email || 'Guest'
    : 'Guest'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order?.order_number}`}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(order?.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="text-sm font-medium text-gray-900">{customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            <Badge className={getStatusColor(order?.status)}>
              {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Unknown'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <Badge className={getPaymentStatusColor(order?.payment_status || 'pending')}>
              {order?.payment_status ? 
                order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 
                'Pending'}
            </Badge>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order?.items?.map((item, index) => {
              const imageUrl = item.product?.image ? getImageUrl(item.product.image) : null
              
              return (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.product?.name || 'Product'}
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.quantity} × {formatPrice(item.price, order?.currency || 'USD')} = {formatPrice(item.total, order?.currency || 'USD')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order?.subtotal || 0, order?.currency || 'USD')}</span>
            </div>
            {order?.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatPrice(order?.tax_amount || 0, order?.currency || 'USD')}</span>
              </div>
            )}
            {order?.shipping_cost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{formatPrice(order?.shipping_cost || 0, order?.currency || 'USD')}</span>
              </div>
            )}
            {order?.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-gray-900">-{formatPrice(order?.discount_amount || 0, order?.currency || 'USD')}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(order?.total || 0, order?.currency || 'USD')}</span>
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Add notes about this status change..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={updating}
              >
                Close
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order?.status}
              >
                {updating ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {order?.payments && order.payments.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div className="space-y-3">
              {order.payments.map((payment, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {payment.method?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(payment.amount || 0, payment.currency || order?.currency || 'USD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={getPaymentStatusColor(payment.status || 'pending')}>
                        {payment.status ? 
                          payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 
                          'Pending'}
                      </Badge>
                    </div>
                    {payment.transaction_id && (
                      <div>
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="text-sm font-mono text-gray-900">{payment.transaction_id}</p>
                      </div>
                    )}
                    {payment.processed_at && (
                      <div>
                        <p className="text-sm text-gray-500">Processed At</p>
                        <p className="text-sm text-gray-900">{formatDate(payment.processed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {order?.notes && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-1">Order Notes</p>
            <p className="text-sm text-gray-900">{order.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default OrderDetailsModal

