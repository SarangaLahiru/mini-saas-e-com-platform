import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatPrice } from '../../../../utils/format'
import { format, parseISO } from 'date-fns'

const SalesChart = ({ salesData = [], viewType = 'daily' }) => {
  if (!salesData || salesData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No sales data available</p>
        </div>
      </div>
    )
  }

  // Process data for chart
  const chartData = useMemo(() => {
    return salesData.map(item => {
      const date = item.date || item.Date || ''
      const sales = item.sales || item.Sales || 0
      const orders = item.orders || item.Orders || 0
      
      // Format date based on view type
      let formattedDate = date
      try {
        const parsedDate = parseISO(date)
        if (!isNaN(parsedDate.getTime())) {
          switch (viewType) {
            case 'daily':
              formattedDate = format(parsedDate, 'MMM dd')
              break
            case 'weekly':
              formattedDate = format(parsedDate, 'MMM dd, yyyy')
              break
            case 'monthly':
              formattedDate = format(parsedDate, 'MMM yyyy')
              break
            case 'yearly':
              formattedDate = format(parsedDate, 'yyyy')
              break
            default:
              formattedDate = format(parsedDate, 'MMM dd')
          }
        }
      } catch (e) {
        // Keep original date if parsing fails
      }

      return {
        date: formattedDate,
        fullDate: date,
        sales: Number(sales.toFixed(2)),
        orders: Number(orders),
        salesFormatted: formatPrice(sales)
      }
    })
  }, [salesData, viewType])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-sm font-semibold mb-1">{data.fullDate}</p>
          <p className="text-sm text-blue-300">
            <span className="font-medium">Sales:</span> {data.salesFormatted}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium">Orders:</span> {data.orders}
          </p>
        </div>
      )
    }
    return null
  }

  // Format Y-axis values
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSales)"
            name="Sales"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart
