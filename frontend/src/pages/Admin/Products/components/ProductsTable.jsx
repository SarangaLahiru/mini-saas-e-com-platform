import React from 'react'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Pagination from '../../../../components/ui/Pagination'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import { formatPrice } from '../../../../utils/format'
import { getPrimaryImageUrl } from '../../../../utils/imageUrl'

const ProductsTable = ({ products, loading, onEdit, onDelete, onViewDetails, currentPage = 1, totalPages = 1, onPageChange }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success-100 text-success-700'
      case 'inactive':
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-error-600 font-semibold'
    if (stock < 10) return 'text-warning-600 font-medium'
    return 'text-success-600'
  }

  const getStatus = (product) => {
    if (product.is_active === false) return 'inactive'
    if (product.status) return product.status
    return 'active'
  }

  if (loading && products.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((product) => {
                const status = getStatus(product)
                const primaryImage = getPrimaryImageUrl(product) || product.image
                
                return (
                  <tr key={product.resource_id || product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0 ${primaryImage ? 'hidden' : 'flex'}`}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.category?.name || (typeof product.category === 'string' ? product.category : 'Uncategorized')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(product.price || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getStockColor(product.stock || product.stock_quantity || 0)}>
                        {product.stock || product.stock_quantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewDetails(product)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(product.resource_id || product.id)}
                          className="text-error-600 hover:text-error-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  )
}

export default ProductsTable
