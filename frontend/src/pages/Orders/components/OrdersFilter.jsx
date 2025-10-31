import React from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

const OrdersFilter = () => {
  const [selectedStatus, setSelectedStatus] = React.useState('all')

  const statuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Orders</h3>
        
        <div className="space-y-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedStatus === status.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button variant="outline" className="w-full" size="sm">
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default OrdersFilter
