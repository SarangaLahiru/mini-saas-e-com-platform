import React, { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Rating from '../../../../components/ui/Rating'
import { formatPrice } from '../../../../utils/format'

const ProductDetailsModal = ({ product, isOpen, onClose, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details')

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

  if (!product) return null

  const status = product.is_active === false ? 'inactive' : product.status || 'active'
  const stock = product.stock || product.stock_quantity || 0
  const reviews = product.reviews || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="2xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Product Images */}
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Images</h3>
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <img
                      key={image.resource_id || index}
                      src={image.url}
                      alt={image.alt || product.name}
                      className="rounded-lg object-cover h-24 w-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">SKU</label>
                <p className="text-sm text-gray-900 mt-1">{product.sku || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-sm text-gray-900 mt-1">
                  {product.category?.name || 'Uncategorized'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatPrice(product.price || 0)}
                </p>
                {product.compare_price && (
                  <p className="text-sm text-gray-500 line-through mt-1">
                    {formatPrice(product.compare_price)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Stock</label>
                <p className={`text-sm font-medium mt-1 ${getStockColor(stock)}`}>
                  {stock} units
                </p>
                {stock < 10 && stock > 0 && (
                  <p className="text-xs text-warning-600 mt-1">Low stock warning</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Brand</label>
                <p className="text-sm text-gray-900 mt-1">{product.brand || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-500">Featured</label>
                <p className="text-sm text-gray-900 mt-1">
                  {product.is_featured ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Digital Product</label>
                <p className="text-sm text-gray-900 mt-1">
                  {product.is_digital ? 'Yes' : 'No'}
                </p>
              </div>
              {product.weight && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Weight</label>
                  <p className="text-sm text-gray-900 mt-1">{product.weight} kg</p>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dimensions</label>
                  <p className="text-sm text-gray-900 mt-1">{product.dimensions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.resource_id || review.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {review.user?.first_name || review.user?.username || 'Anonymous'}
                        </p>
                        {review.is_verified_purchase && (
                          <Badge className="bg-success-100 text-success-700 text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <Rating rating={review.rating} interactive={false} className="mt-1" />
                    </div>
                    <p className="text-sm text-gray-500">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  {review.title && (
                    <p className="font-medium text-gray-900 mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                  {review.is_approved === false && (
                    <Badge className="bg-warning-100 text-warning-700 text-xs mt-2">
                      Pending Approval
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product?')) {
                onDelete(product.resource_id || product.id)
                onClose()
              }
            }}
          >
            Delete
          </Button>
          <Button onClick={() => {
            onClose()
            onEdit(product)
          }}>
            Edit Product
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ProductDetailsModal

