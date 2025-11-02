import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Truck, Receipt } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatPrice } from '../../../utils/format'

const CartSummary = () => {
  const { total, itemsCount } = useCart()

  const subtotal = total
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.08
  const totalAmount = subtotal + shipping + tax

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
          
          {/* Summary Details */}
          <div className="space-y-3">
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
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Link to="/checkout">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 font-medium transition-all">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default CartSummary
