import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Truck, CheckCircle2, Clock, AlertCircle, MapPin, Phone } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { formatPrice, formatDate } from '../../utils/format'
import { getImageUrl } from '../../utils/imageUrl'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from '../../utils/toast'

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  const [orderDetails, setOrderDetails] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Fetch full order details when modal opens
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!order?.resource_id && !order?.id) return
      
      setIsLoadingDetails(true)
      try {
        const resourceId = order.resource_id || order.id
        const details = await ordersAPI.getOrder(resourceId)
        setOrderDetails(details)
      } catch (error) {
        console.error('Failed to fetch order details:', error)
        toast.error('Failed to load order details')
      } finally {
        setIsLoadingDetails(false)
      }
    }

    fetchOrderDetails()
  }, [order?.resource_id, order?.id])

  const statusConfigs = {
    pending: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: 'Pending' },
    processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package, label: 'Processing' },
    shipped: { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck, label: 'Shipped' },
    delivered: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle, label: 'Cancelled' },
  }
  
  // Use fetched details if available, otherwise use initial order data
  const displayOrder = orderDetails || order
  const statusConfig = statusConfigs[displayOrder?.status?.toLowerCase()] || statusConfigs.pending
  const StatusIcon = statusConfig.icon

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-16 md:pt-20"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Order #{displayOrder.order_number || displayOrder.resource_id || `ORD-${displayOrder.id}`}
                </h2>
                <p className="text-blue-100 text-sm">
                  Placed on {formatDate(displayOrder.created_at || displayOrder.createdAt || displayOrder.date)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border border-white/30 bg-white/20 backdrop-blur-sm flex items-center gap-2`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Order Items
                  </h3>
                  {displayOrder?.order_items && displayOrder.order_items.length > 0 ? (
                    <div className="space-y-3">
                      {displayOrder.order_items.map((item, index) => (
                        <div key={item.resource_id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          {item.product?.image ? (
                            <img
                              src={getImageUrl(item.product.image)}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.product?.name || item.name || 'Product'}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            {item.product?.sku && (
                              <p className="text-xs text-gray-400">SKU: {item.product.sku}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatPrice(item.price || item.product?.price || 0)}</p>
                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                            {item.total && (
                              <p className="text-xs text-gray-600 mt-1">Total: {formatPrice(item.total)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No items found</p>
                    </div>
                  )}
                </div>

                {/* Shipping & Billing Address */}
                {!isLoadingDetails && (displayOrder?.shipping_address || displayOrder?.billing_address) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    {displayOrder.shipping_address && (
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-600" />
                          Shipping Address
                        </h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-medium">
                            {displayOrder.shipping_address.first_name} {displayOrder.shipping_address.last_name}
                          </p>
                          <p>{displayOrder.shipping_address.address_line_1}</p>
                          {displayOrder.shipping_address.address_line_2 && <p>{displayOrder.shipping_address.address_line_2}</p>}
                          <p>
                            {displayOrder.shipping_address.city}, {displayOrder.shipping_address.state} {displayOrder.shipping_address.postal_code}
                          </p>
                          <p>{displayOrder.shipping_address.country}</p>
                          {displayOrder.shipping_address.phone && (
                            <p className="flex items-center gap-1 mt-2">
                              <Phone className="w-4 h-4" />
                              {displayOrder.shipping_address.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Billing Address */}
                    {displayOrder.billing_address && (
                      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                          Billing Address
                        </h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-medium">
                            {displayOrder.billing_address.first_name} {displayOrder.billing_address.last_name}
                          </p>
                          <p>{displayOrder.billing_address.address_line_1}</p>
                          {displayOrder.billing_address.address_line_2 && <p>{displayOrder.billing_address.address_line_2}</p>}
                          <p>
                            {displayOrder.billing_address.city}, {displayOrder.billing_address.state} {displayOrder.billing_address.postal_code}
                          </p>
                          <p>{displayOrder.billing_address.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                {!isLoadingDetails && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatPrice(displayOrder.subtotal || (displayOrder.total - (displayOrder.shipping_cost || 0) - (displayOrder.tax_amount || 0) + (displayOrder.discount_amount || 0)))}</span>
                      </div>
                      {(displayOrder.shipping_cost || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">{formatPrice(displayOrder.shipping_cost)}</span>
                        </div>
                      )}
                      {(displayOrder.tax_amount || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">{formatPrice(displayOrder.tax_amount)}</span>
                        </div>
                      )}
                      {(displayOrder.discount_amount || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">-{formatPrice(displayOrder.discount_amount)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-lg text-gray-900">{formatPrice(displayOrder.total || displayOrder.total_amount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                {!isLoadingDetails && displayOrder.notes && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Order Notes
                    </h4>
                    <p className="text-sm text-gray-700">{displayOrder.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default OrderDetailsModal

