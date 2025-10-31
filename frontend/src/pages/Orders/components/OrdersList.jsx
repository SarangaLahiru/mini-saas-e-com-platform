import React from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatPrice, formatDate } from '../../../utils/format'

const OrdersList = () => {
  // Mock orders data
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD20241201001',
      date: '2024-01-15',
      status: 'delivered',
      paymentStatus: 'paid',
      total: 1299.99,
      items: [
        { name: 'MacBook Pro 16"', quantity: 1, price: 1299.99 },
        { name: 'Magic Mouse', quantity: 1, price: 79.99 },
      ],
    },
    {
      id: 2,
      orderNumber: 'ORD20241201002',
      date: '2024-01-10',
      status: 'shipped',
      paymentStatus: 'paid',
      total: 599.99,
      items: [
        { name: 'iPhone 15 Pro', quantity: 1, price: 599.99 },
      ],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-success-600 bg-success-100'
      case 'shipped':
        return 'text-primary-600 bg-primary-100'
      case 'pending':
        return 'text-warning-600 bg-warning-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="p-6">
          <div className="space-y-4">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(order.total)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg"></div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>

            {/* Order Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
              </div>
              {order.status === 'pending' && (
                <Button variant="outline" size="sm">
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default OrdersList
