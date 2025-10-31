import React from 'react'
import ProductFilters from '../../Products/components/ProductFilters'

// Thin wrapper to reuse the main ProductFilters in category context
const CategoryFilters = () => {
  return <ProductFilters />
}

export default CategoryFilters
