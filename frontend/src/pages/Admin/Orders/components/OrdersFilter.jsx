import React from 'react'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'

const OrdersFilter = () => {
  const [filters, setFilters] = React.useState({
    status: '',
    paymentStatus: '',
    dateRange: '',
  })

  const statuses = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled']
  const paymentStatuses = ['All', 'Pending', 'Paid', 'Failed']
  const dateRanges = ['All', 'Today', 'This Week', 'This Month', 'This Year']

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      dateRange: '',
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {dateRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button variant="outline" className="w-full" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default OrdersFilter
