import React from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatPrice, formatDate } from '../../../utils/format'

const OrderHistory = () => {
  // Mock orders data
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD20241201001',
      date: '2024-01-15',
      status: 'delivered',
      total: 1299.99,
      items: 2,
    },
    {
      id: 2,
      orderNumber: 'ORD20241201002',
      date: '2024-01-10',
      status: 'shipped',
      total: 599.99,
      items: 1,
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
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order History</h3>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                <p className="text-sm text-gray-500">{order.items} item(s)</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default OrderHistory
