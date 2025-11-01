import React from 'react'
import { motion } from 'framer-motion'
import { formatPrice } from '../../../../utils/format'

const SalesChart = ({ salesData = [] }) => {
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

  // Calculate max value for scaling
  const maxSales = Math.max(...salesData.map(d => d.sales || 0), 1)
  const chartHeight = 200
  const chartWidth = 100
  const padding = { top: 20, right: 10, bottom: 30, left: 40 }

  // Format dates
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Calculate points for line
  const points = salesData.map((item, index) => {
    const x = ((index / (salesData.length - 1 || 1)) * chartWidth) + padding.left
    const y = chartHeight + padding.top - ((item.sales || 0) / maxSales * chartHeight)
    return { x, y, ...item }
  })

  // Create path for line
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  // Create area path (line + bottom closure)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight + padding.top} L ${points[0].x} ${chartHeight + padding.top} Z`

  return (
    <div className="relative w-full">
      <svg 
        viewBox={`0 0 ${100 + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight + padding.top - (ratio * chartHeight)
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={100 + padding.left}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 5}
                y={y + 2}
                fontSize="8"
                fill="#6b7280"
                textAnchor="end"
              >
                {formatPrice(maxSales * ratio)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#salesGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Data points and tooltips */}
        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring" }}
            />
            {/* Date labels */}
            <text
              x={point.x}
              y={chartHeight + padding.top + 15}
              fontSize="7"
              fill="#6b7280"
              textAnchor="middle"
              transform={`rotate(-45 ${point.x} ${chartHeight + padding.top + 15})`}
            >
              {formatDate(point.date)}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-600">Daily Sales</span>
        </div>
      </div>
    </div>
  )
}

export default SalesChart

