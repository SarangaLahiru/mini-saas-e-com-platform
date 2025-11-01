import React, { useEffect, useState } from 'react'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import { productsAPI } from '../../../../services/api'

const ProductsFilter = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories()
      setCategories(response.categories || response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value === 'All' || value === '' ? '' : value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      category: '',
      page: 1,
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.resource_id || category.id} value={category.id || category.resource_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
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

export default ProductsFilter
