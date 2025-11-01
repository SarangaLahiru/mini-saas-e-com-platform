import React from 'react'
import Card from '../../../../components/ui/Card'
import { formatPrice } from '../../../../utils/format'

const DashboardStats = ({ stats: statsData }) => {
  const defaultStats = [
    {
      title: 'Total Revenue',
      value: '$0',
      change: '0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      title: 'Total Orders',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: 'Total Products',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Total Customers',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
  ]

  const stats = statsData
    ? [
        {
          ...defaultStats[0],
          value: formatPrice(statsData.total_revenue || statsData.TotalRevenue || 0),
          change: statsData.revenue_change || statsData.RevenueChange ? `${statsData.revenue_change > 0 || statsData.RevenueChange > 0 ? '+' : ''}${(statsData.revenue_change || statsData.RevenueChange || 0).toFixed(1)}%` : '0%',
          changeType: (statsData.revenue_change || statsData.RevenueChange || 0) > 0 ? 'positive' : (statsData.revenue_change || statsData.RevenueChange || 0) < 0 ? 'negative' : 'neutral',
        },
        {
          ...defaultStats[1],
          value: (statsData.total_orders || statsData.TotalOrders || 0).toLocaleString(),
          change: statsData.orders_change || statsData.OrdersChange ? `${statsData.orders_change > 0 || statsData.OrdersChange > 0 ? '+' : ''}${(statsData.orders_change || statsData.OrdersChange || 0).toFixed(1)}%` : '0%',
          changeType: (statsData.orders_change || statsData.OrdersChange || 0) > 0 ? 'positive' : (statsData.orders_change || statsData.OrdersChange || 0) < 0 ? 'negative' : 'neutral',
        },
        {
          ...defaultStats[2],
          value: (statsData.total_products || statsData.TotalProducts || 0).toLocaleString(),
          change: statsData.products_change || statsData.ProductsChange ? `${statsData.products_change > 0 || statsData.ProductsChange > 0 ? '+' : ''}${(statsData.products_change || statsData.ProductsChange || 0).toFixed(1)}%` : '0%',
          changeType: (statsData.products_change || statsData.ProductsChange || 0) > 0 ? 'positive' : (statsData.products_change || statsData.ProductsChange || 0) < 0 ? 'negative' : 'neutral',
        },
        {
          ...defaultStats[3],
          value: (statsData.total_customers || statsData.TotalCustomers || 0).toLocaleString(),
          change: statsData.customers_change || statsData.CustomersChange ? `${statsData.customers_change > 0 || statsData.CustomersChange > 0 ? '+' : ''}${(statsData.customers_change || statsData.CustomersChange || 0).toFixed(1)}%` : '0%',
          changeType: (statsData.customers_change || statsData.CustomersChange || 0) > 0 ? 'positive' : (statsData.customers_change || statsData.CustomersChange || 0) < 0 ? 'negative' : 'neutral',
        },
      ]
    : defaultStats

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="p-5 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 truncate">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">{stat.value}</p>
              <div className="flex items-center space-x-1.5">
                {stat.changeType === 'positive' && (
                  <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )}
                {stat.changeType === 'negative' && (
                  <svg className="h-4 w-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
                {stat.changeType === 'neutral' && (
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                  </svg>
                )}
                <p className={`text-xs sm:text-sm font-semibold truncate ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : stat.changeType === 'negative' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-xl flex items-center justify-center shadow-md transition-all">
                <div className="text-blue-600">
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStats
