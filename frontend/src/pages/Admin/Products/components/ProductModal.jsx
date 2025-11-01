import React, { useEffect, useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import { adminAPI } from '../../../../services/adminApi'
import { productsAPI } from '../../../../services/api'
import toast from 'react-hot-toast'

const ProductModal = ({ product, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    compare_price: '',
    cost_price: '',
    stock_quantity: '',
    low_stock_threshold: 5,
    category_id: '',
    brand: '',
    is_active: true,
    is_featured: false,
    is_digital: false,
    weight: '',
    length: '',
    width: '',
    height: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          short_description: product.short_description || '',
          sku: product.sku || '',
          price: product.price || '',
          compare_price: product.compare_price || '',
          cost_price: product.cost || product.cost_price || '',
          stock_quantity: product.stock || product.stock_quantity || '',
          low_stock_threshold: product.min_stock || product.low_stock_threshold || 5,
          category_id: product.category_id || product.category?.id || '',
          brand: product.brand || '',
          is_active: product.is_active !== false,
          is_featured: product.is_featured || false,
          is_digital: product.is_digital || false,
          weight: product.weight || '',
          length: product.dimensions?.split('x')[0]?.trim() || '',
          width: product.dimensions?.split('x')[1]?.trim() || '',
          height: product.dimensions?.split('x')[2]?.trim() || '',
        })
      } else {
        resetForm()
      }
    }
  }, [isOpen, product])

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories()
      setCategories(response.categories || response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      sku: '',
      price: '',
      compare_price: '',
      cost_price: '',
      stock_quantity: '',
      low_stock_threshold: 5,
      category_id: '',
      brand: '',
      is_active: true,
      is_featured: false,
      is_digital: false,
      weight: '',
      length: '',
      width: '',
      height: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : 0,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        category_id: parseInt(formData.category_id) || null,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        dimensions: formData.length && formData.width && formData.height
          ? `${formData.length}x${formData.width}x${formData.height}`
          : '',
      }

      if (product) {
        await adminAPI.products.updateProduct(product.resource_id || product.id, submitData)
        toast.success('Product updated successfully')
      } else {
        await adminAPI.products.createProduct(submitData)
        toast.success('Product created successfully')
      }

      onSave()
    } catch (error) {
      console.error('Failed to save product:', error)
      toast.error(`Failed to ${product ? 'update' : 'create'} product`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <Input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.resource_id || cat.id} value={cat.id || cat.resource_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
            <Input
              type="number"
              step="0.01"
              value={formData.compare_price}
              onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
            <Input
              type="number"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <Input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <Input
              type="number"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <Input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="4"
          />
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Featured</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_digital}
              onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Digital Product</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductModal

