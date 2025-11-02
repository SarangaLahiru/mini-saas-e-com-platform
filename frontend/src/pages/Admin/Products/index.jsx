import React, { Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { adminAPI } from '../../../services/adminApi'
import { productsAPI, reviewsAPI } from '../../../services/api'
import toast from '../../../utils/toast'

// Lazy load components
const ProductsTable = React.lazy(() => import('./components/ProductsTable'))
const ProductsFilter = React.lazy(() => import('./components/ProductsFilter'))
const ProductModal = React.lazy(() => import('./components/ProductModal'))
const ProductDetailsModal = React.lazy(() => import('./components/ProductDetailsModal'))

const AdminProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    page: 1,
    limit: 20,
  })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category_id: filters.category }),
      }
      const response = await adminAPI.products.getProducts(params)
      setProducts(response.products || response || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      await adminAPI.products.deleteProduct(productId)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setShowAddModal(true)
  }

  const handleViewDetails = async (product) => {
    try {
      // Fetch full product details with reviews
      const productDetails = await productsAPI.getProduct(product.resource_id || product.id)
      const reviews = await reviewsAPI.getProductReviews(product.resource_id || product.id)
      setSelectedProduct({ ...productDetails, reviews: reviews.reviews || reviews || [] })
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Failed to fetch product details:', error)
      toast.error('Failed to load product details')
    }
  }

  const handleProductSaved = () => {
    setShowAddModal(false)
    setSelectedProduct(null)
    fetchProducts()
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => {
          setSelectedProduct(null)
          setShowAddModal(true)
        }}>
          + Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsFilter
              filters={filters}
              onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters, page: 1 })}
            />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsTable
              products={products}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              currentPage={filters.page}
              totalPages={Math.ceil(total / filters.limit)}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </Suspense>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <Suspense fallback={<LoadingSpinner />}>
          <ProductModal
            product={selectedProduct}
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false)
              setSelectedProduct(null)
            }}
            onSave={handleProductSaved}
          />
        </Suspense>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <Suspense fallback={<LoadingSpinner />}>
          <ProductDetailsModal
            product={selectedProduct}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedProduct(null)
            }}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </Suspense>
      )}
    </div>
  )
}

export default AdminProducts
