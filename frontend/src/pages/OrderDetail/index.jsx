import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Phone,
  CreditCard,
  ArrowLeft,
  Download,
  Printer
} from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { formatPrice, formatDate } from '../../utils/format'
import { getImageUrl } from '../../utils/imageUrl'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from '../../utils/toast'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => ordersAPI.getOrder(id),
    retry: 1,
    enabled: !!id,
  })

  const statusConfigs = {
    pending: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: 'Pending' },
    processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package, label: 'Processing' },
    shipped: { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck, label: 'Shipped' },
    delivered: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle, label: 'Cancelled' },
    refunded: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: AlertCircle, label: 'Refunded' },
  }

  const paymentStatusConfigs = {
    pending: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Pending' },
    processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Processing' },
    paid: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Paid' },
    failed: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Failed' },
    refunded: { color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Refunded' },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error?.response?.data?.message || 'The order you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/orders')} variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const statusConfig = statusConfigs[order?.status?.toLowerCase()] || statusConfigs.pending
  const StatusIcon = statusConfig.icon
  const paymentStatusConfig = paymentStatusConfigs[order?.payment_status?.toLowerCase()] || paymentStatusConfigs.pending

  const handlePrintInvoice = () => {
    window.print()
  }

  const handleDownloadInvoice = () => {
    toast.info('Invoice download feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate('/orders')}
            variant="secondary"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.order_number || order.resource_id || `ORD-${order.id}`}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.created_at || order.createdAt || order.date)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${statusConfig.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
                {order.payment_status && (
                  <span className={`px-3 py-2 rounded-full text-xs font-medium border ${paymentStatusConfig.color}`}>
                    Payment: {paymentStatusConfig.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrintInvoice}
              variant="outline"
              size="sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
              </div>

              {order?.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <motion.div
                      key={item.resource_id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      {item.product?.image ? (
                        <img
                          src={getImageUrl(item.product.image)}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.product?.name || item.name || 'Product'}
                        </h3>
                        {item.product?.sku && (
                          <p className="text-xs text-gray-500 mb-2">SKU: {item.product.sku}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Quantity: <strong>{item.quantity}</strong></span>
                          {item.variant && (
                            <span>Variant: <strong>{item.variant.name}</strong></span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          {formatPrice(item.price || item.product?.price || 0)}
                        </p>
                        <p className="text-sm text-gray-500">each</p>
                        {item.total && (
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            Total: {formatPrice(item.total)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No items found</p>
                </div>
              )}
            </Card>

            {/* Shipping & Billing Address */}
            {(order?.shipping_address || order?.billing_address) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                {order.shipping_address && (
                  <Card className="p-6 bg-blue-50/50 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-medium text-base">
                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                      </p>
                      <p>{order.shipping_address.address_line_1}</p>
                      {order.shipping_address.address_line_2 && (
                        <p>{order.shipping_address.address_line_2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state}{' '}
                        {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                      {order.shipping_address.phone && (
                        <p className="flex items-center gap-1 mt-3 pt-3 border-t border-blue-200">
                          <Phone className="w-4 h-4" />
                          {order.shipping_address.phone}
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Billing Address */}
                {order.billing_address && (
                  <Card className="p-6 bg-indigo-50/50 border-indigo-200">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">Billing Address</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-medium text-base">
                        {order.billing_address.first_name} {order.billing_address.last_name}
                      </p>
                      <p>{order.billing_address.address_line_1}</p>
                      {order.billing_address.address_line_2 && (
                        <p>{order.billing_address.address_line_2}</p>
                      )}
                      <p>
                        {order.billing_address.city}, {order.billing_address.state}{' '}
                        {order.billing_address.postal_code}
                      </p>
                      <p>{order.billing_address.country}</p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Payment Information */}
            {order?.payments && order.payments.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
                </div>
                <div className="space-y-4">
                  {order.payments.map((payment, index) => (
                    <div
                      key={payment.resource_id || index}
                      className="p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {payment.method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Payment'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Transaction ID: {payment.transaction_id || 'N/A'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          payment.status === 'completed' 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200">
                        <span className="text-sm text-gray-600">Amount Paid</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatPrice(payment.amount || 0)} {payment.currency || 'USD'}
                        </span>
                      </div>
                      {payment.processed_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Processed on {formatDate(payment.processed_at)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Order Notes */}
            {order.notes && (
              <Card className="p-6 bg-amber-50/50 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900">Order Notes</h3>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.subtotal || 0)}
                  </span>
                </div>
                {(order.shipping_cost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(order.shipping_cost)}
                    </span>
                  </div>
                )}
                {(order.tax_amount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(order.tax_amount)}
                    </span>
                  </div>
                )}
                {(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-bold text-xl text-blue-600">
                      {formatPrice(order.total || order.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              {(order.shipped_at || order.delivered_at) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.created_at || order.createdAt)}
                        </p>
                      </div>
                    </div>
                    {order.shipped_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Shipped</p>
                          <p className="text-xs text-gray-500">{formatDate(order.shipped_at)}</p>
                        </div>
                      </div>
                    )}
                    {order.delivered_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delivered</p>
                          <p className="text-xs text-gray-500">{formatDate(order.delivered_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail

