import React from 'react'
import { motion } from 'framer-motion'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'

const ProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMax = parseInt(searchParams.get('max_price') || '0') || 10000
  const [maxPrice, setMaxPrice] = React.useState(initialMax)
  const brandParam = searchParams.get('brand') || ''
  const selectedBrands = React.useMemo(() => (brandParam ? brandParam.split(',') : []), [brandParam])
  const inStock = searchParams.get('in_stock') === '1'

  const categories = [
    'Laptops', 'Smartphones', 'Tablets', 'Accessories', 'Gaming'
  ]

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: productsAPI.getBrands,
    staleTime: 1000 * 60 * 10,
  })
  const brands = brandsData || []

  const applyParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value === undefined || value === '' || value === null) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    // reset to page 1 on filter change
    next.set('page', '1')
    setSearchParams(next)
  }

  const clearFilters = () => {
    const keep = new URLSearchParams()
    // keep limit if present
    if (searchParams.get('limit')) keep.set('limit', searchParams.get('limit'))
    setSearchParams(keep)
    setMaxPrice(10000)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            Clear All
          </Button>
        </div>

        {/* Search */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Search</h4>
          <input
            type="text"
            defaultValue={searchParams.get('search') || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyParam('search', e.currentTarget.value)
            }}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              onMouseUp={() => applyParam('max_price', maxPrice)}
              onTouchEnd={() => applyParam('max_price', maxPrice)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>$0</span>
              <span>${maxPrice}</span>
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Brand</h4>
          <div className="space-y-2">
            {brands.map((b) => (
              <label key={b.slug} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b.slug)}
                  onChange={(e) => {
                    const set = new Set(selectedBrands)
                    if (e.target.checked) set.add(b.slug); else set.delete(b.slug)
                    const value = Array.from(set).join(',')
                    applyParam('brand', value)
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{b.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stock Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => applyParam('in_stock', e.target.checked ? 1 : undefined)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">In Stock only</span>
          </label>
        </div>
      </div>
    </Card>
  )
}

export default ProductFilters
