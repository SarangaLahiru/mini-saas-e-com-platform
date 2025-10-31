import React from 'react'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { formatPrice, formatDate } from '../../../../utils/format'

const RecentOrders = () => {
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD20241201001',
      customer: 'John Doe',
      date: '2024-01-15',
      status: 'delivered',
      total: 1299.99,
    },
    {
      id: 2,
      orderNumber: 'ORD20241201002',
      customer: 'Jane Smith',
      date: '2024-01-14',
      status: 'shipped',
      total: 599.99,
    },
    {
      id: 3,
      orderNumber: 'ORD20241201003',
      customer: 'Bob Johnson',
      date: '2024-01-13',
      status: 'pending',
      total: 299.99,
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
            <div className="flex-1">
              <p className="font-medium text-gray-900">#{order.orderNumber}</p>
              <p className="text-sm text-gray-500">{order.customer}</p>
              <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentOrders
