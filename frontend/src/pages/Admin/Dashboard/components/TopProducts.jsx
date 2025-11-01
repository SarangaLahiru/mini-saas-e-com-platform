import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { formatPrice } from '../../../../utils/format'
import { adminAPI } from '../../../../services/adminApi'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'

const TopProducts = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.analytics.getDashboard(),
    staleTime: 30000, // Cache for 30 seconds
  })

  const products = dashboardData?.top_products || []

  const getRankColor = (index) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg'
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md'
    if (index === 2) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md'
    return 'bg-gray-100 text-gray-600 border border-gray-200'
  }

  if (isLoading) {
    return (
      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
          <p className="text-sm text-gray-500 mt-1">
            {products.length > 0 ? `${products.length} best performing products` : 'No product data'}
          </p>
        </div>
        <Link to="/admin/products">
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
          >
            View All
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No product data</p>
          <p className="text-sm text-gray-400 mt-1">Product sales data will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const productImage = product.image || product.product_image
            const quantitySold = product.quantity_sold || product.sales || 0
            const revenue = product.revenue || 0
            const orderCount = product.order_count || 0
            
            return (
              <Link
                key={product.id || product.resource_id}
                to="/admin/products"
                state={{ productId: product.resource_id || product.id }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-white border border-gray-100 hover:border-blue-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex-shrink-0 relative">
                  {productImage ? (
                    <>
                      <img 
                        src={productImage} 
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200 group-hover:border-blue-300 transition-colors"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${getRankColor(index)}`}>
                        #{index + 1}
                      </div>
                    </>
                  ) : (
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold shadow-md ${getRankColor(index)}`}>
                      <span className="text-lg">#{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <p className="text-xs text-gray-600 font-medium">
                        {quantitySold.toLocaleString()} sold
                      </p>
                    </div>
                    {orderCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-xs text-gray-500">{orderCount} orders</p>
                      </div>
                    )}
                  </div>
                  {product.sku && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">SKU: {product.sku}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-lg text-gray-900 mb-1">{formatPrice(revenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default TopProducts
