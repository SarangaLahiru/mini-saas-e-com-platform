import React from 'react'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'

const OrdersFilter = ({ filters, onFilterChange }) => {
  const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  const paymentStatuses = ['', 'pending', 'paid', 'failed', 'refunded']

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page on filter change
    })
  }

  const clearFilters = () => {
    onFilterChange({
      status: '',
      paymentStatus: '',
      search: '',
      page: 1,
      limit: 20,
    })
  }

  const hasActiveFilters = filters.status || filters.paymentStatus || filters.search

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear
            </button>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Order #</label>
          <Input
            type="text"
            placeholder="Search by order number..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Statuses'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Payments'}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )
}

export default OrdersFilter
