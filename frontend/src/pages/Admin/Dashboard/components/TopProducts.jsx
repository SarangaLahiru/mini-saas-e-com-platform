import React from 'react'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { formatPrice } from '../../../../utils/format'

const TopProducts = () => {
  const products = [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      sales: 45,
      revenue: 58499.55,
      image: '/placeholder-product-1.jpg',
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      sales: 32,
      revenue: 19196.68,
      image: '/placeholder-product-2.jpg',
    },
    {
      id: 3,
      name: 'Samsung Galaxy S24',
      sales: 28,
      revenue: 16799.72,
      image: '/placeholder-product-3.jpg',
    },
    {
      id: 4,
      name: 'Dell XPS 13',
      sales: 22,
      revenue: 21999.78,
      image: '/placeholder-product-4.jpg',
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-sm text-gray-500">{product.sales} sales</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatPrice(product.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TopProducts
