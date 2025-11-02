import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, X, Calendar } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

const OrdersFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || '',
    payment_status: filters.payment_status || '',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
  })

  const statuses = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const paymentStatuses = [
    { value: '', label: 'All Payment Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ]

  const handleStatusChange = (value) => {
    const newFilters = { ...localFilters, status: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePaymentStatusChange = (value) => {
    const newFilters = { ...localFilters, payment_status: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClear = () => {
    const cleared = {
      status: '',
      payment_status: '',
      date_from: '',
      date_to: '',
    }
    setLocalFilters(cleared)
    onClearFilters()
  }

  const hasActiveFilters = localFilters.status || localFilters.payment_status || localFilters.date_from || localFilters.date_to

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear all filters"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Order Status
            </label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    localFilters.status === status.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Payment Status
            </label>
            <select
              value={localFilters.payment_status}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {paymentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={localFilters.date_from}
                  onChange={(e) => handleDateChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={localFilters.date_to}
                  onChange={(e) => handleDateChange('date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={handleClear}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default OrdersFilter
