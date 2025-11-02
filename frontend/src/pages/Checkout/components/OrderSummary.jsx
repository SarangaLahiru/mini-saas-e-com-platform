import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Receipt, Truck, ShoppingBag } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import Card from '../../../components/ui/Card'
import { formatPrice } from '../../../utils/format'
import { getImageUrl } from '../../../utils/imageUrl'

const OrderSummary = () => {
  const { items, total, itemsCount } = useCart()

  const subtotal = total
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.08
  const totalAmount = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 sticky top-8 bg-white shadow-lg border border-gray-200">
          <div className="text-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link to="/products">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 sticky top-8 bg-white shadow-lg border border-gray-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Receipt className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
          </div>
          
          {/* Order Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const imageUrl = getImageUrl(item.image || item.product?.images?.[0]?.url || item.product?.image)
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name || item.product?.name}
                        className="h-full w-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg'
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name || item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Summary Details */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Shipping
              </span>
              <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
            </div>
            
            {/* Free Shipping Progress */}
            {shipping > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 mb-2">
                  Add {formatPrice(100 - subtotal)} more for <span className="font-bold">FREE shipping</span>
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Secure checkout • Your payment information is safe</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default OrderSummary
