import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { adminAPI } from '../../../services/adminApi'
import { formatPrice } from '../../../utils/format'
import SalesChart from './components/SalesChart'

const AdminAnalysis = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [viewType, setViewType] = useState('daily')

  // Determine grouping based on time range and view type
  const getGroupBy = () => {
    if (viewType === 'yearly' || parseInt(timeRange) >= 365) {
      return 'yearly'
    } else if (viewType === 'monthly' || parseInt(timeRange) >= 90) {
      return 'monthly'
    } else if (viewType === 'weekly' || parseInt(timeRange) >= 30) {
      return 'weekly'
    }
    return 'daily'
  }

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['admin-sales-data', timeRange, viewType],
    queryFn: () => adminAPI.analytics.getSalesData({ 
      days: timeRange,
      group: getGroupBy()
    }),
    staleTime: 60000, // Cache for 1 minute
  })

  const { data: topProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-top-products', timeRange],
    queryFn: () => adminAPI.analytics.getTopProducts({ limit: 10, days: timeRange }),
    staleTime: 60000,
  })

  const topProducts = topProductsData?.products || topProductsData || []

  if (salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const salesByDay = salesData?.sales_by_day || []
  const totalSales = salesData?.total_sales || salesData?.TotalSales || 0
  const avgOrderValue = salesData?.average_order_value || salesData?.AverageOrderValue || 0
  const totalOrders = salesData?.total_orders || salesData?.TotalOrders || 0

  const viewOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section - Simple */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Detailed insights into your business performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards - Match Dashboard Stats Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 truncate">Total Sales</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">{formatPrice(totalSales)}</p>
              <div className="flex items-center space-x-1.5">
                <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-green-600 truncate">Revenue</p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-xl flex items-center justify-center shadow-md transition-all">
                <div className="text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 truncate">Average Order Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">{formatPrice(avgOrderValue)}</p>
              <div className="flex items-center space-x-1.5">
                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate">Per Order</p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-xl flex items-center justify-center shadow-md transition-all">
                <div className="text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 truncate">Total Orders</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">{totalOrders.toLocaleString()}</p>
              <div className="flex items-center space-x-1.5">
                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate">Transactions</p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-xl flex items-center justify-center shadow-md transition-all">
                <div className="text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sales Trend</h3>
            <p className="text-sm text-gray-500 mt-1">Sales performance over time</p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setViewType(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewType === option.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
          <SalesChart salesData={salesByDay} viewType={viewType} />
        </div>
      </Card>

      {/* Top Products */}
      <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Top Selling Products</h3>
            <p className="text-sm text-gray-500 mt-1">Best performing products by revenue</p>
          </div>
        </div>
        
        {topProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No product sales data</p>
            <p className="text-sm text-gray-400 mt-1">Product sales will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => {
                  const quantitySold = product.quantity_sold || 0
                  const revenue = product.revenue || 0
                  const orderCount = product.order_count || 0
                  const productImage = product.image || ''
                  
                  return (
                    <tr key={product.resource_id || product.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 mr-3"></div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.sku && (
                              <div className="text-sm text-gray-500">{product.sku}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quantitySold.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {orderCount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminAnalysis
