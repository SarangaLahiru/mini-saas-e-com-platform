import React from 'react'
import { Link } from 'react-router-dom'
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
    <Card className="p-6 sticky top-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({itemsCount} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link to="/checkout">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {shipping > 0 && (
          <p className="text-sm text-gray-500 text-center">
            Add {formatPrice(100 - subtotal)} more for free shipping
          </p>
        )}
      </div>
    </Card>
  )
}

export default CartSummary
