import React, { useEffect, useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import { adminAPI } from '../../../../services/adminApi'
import { productsAPI } from '../../../../services/api'
import { getImageUrl } from '../../../../utils/imageUrl'
import toast from 'react-hot-toast'

const MAX_IMAGES = 5

const ProductModal = ({ product, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [images, setImages] = useState([]) // Array of { file, preview, url, isPrimary, sortOrder, id }
  
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    sku: '',
    price: '',
    compare_price: '',
    cost_price: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    category_id: '',
    brand_id: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    is_active: true,
    is_featured: false,
    is_digital: false,
    requires_shipping: true,
    taxable: true,
    track_quantity: true,
    allow_backorder: false,
    meta_title: '',
    meta_description: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      fetchBrands()
      if (product) {
        loadProductData()
      } else {
        resetForm()
      }
    }
  }, [isOpen, product])

  const loadProductData = () => {
    setFormData({
      name: product.name || '',
      short_description: product.short_description || '',
      description: product.description || '',
      sku: product.sku || '',
      price: product.price || '',
      compare_price: product.compare_price || '',
      cost_price: product.cost || product.cost_price || '',
      stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : (product.stock !== undefined ? product.stock : 0),
      low_stock_threshold: product.min_stock || product.low_stock_threshold || 5,
      category_id: product.category_id || product.category?.id || '',
      brand_id: product.brand_id || '',
      weight: product.weight || '',
      length: product.length || '',
      width: product.width || '',
      height: product.height || '',
      is_active: product.is_active !== false,
      is_featured: product.is_featured || false,
      is_digital: product.is_digital || false,
      requires_shipping: product.requires_shipping !== false,
      taxable: product.taxable !== false,
      track_quantity: product.track_quantity !== false,
      allow_backorder: product.allow_backorder || false,
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
    })

    // Load existing images
    if (product.images && product.images.length > 0) {
      const loadedImages = product.images
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img, index) => {
          const fullUrl = getImageUrl(img.url)
          return {
            id: img.resource_id,
            url: fullUrl || img.url,
            alt: img.alt || '',
            isPrimary: img.is_primary || false,
            sortOrder: img.sort_order || index,
            preview: fullUrl || img.url, // Use full URL for preview
          }
        })
      setImages(loadedImages)
    } else {
      setImages([])
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      short_description: '',
      description: '',
      sku: '',
      price: '',
      compare_price: '',
      cost_price: '',
      stock_quantity: 0,
      low_stock_threshold: 5,
      category_id: '',
      brand_id: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      is_active: true,
      is_featured: false,
      is_digital: false,
      requires_shipping: true,
      taxable: true,
      track_quantity: true,
      allow_backorder: false,
      meta_title: '',
      meta_description: '',
    })
    setImages([])
  }

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories()
      setCategories(response.categories || response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await productsAPI.getBrands()
      setBrands(response.brands || response || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const handleImageUpload = async (files) => {
    const newFiles = Array.from(files).slice(0, MAX_IMAGES - images.length)
    
    if (images.length + newFiles.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    setUploading(true)
    const newImages = []

    for (const file of newFiles) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        // Upload image
        const uploadResponse = await adminAPI.upload.uploadImage(file, 'product')
        
        // Get full URL for the uploaded image
        const imageUrl = getImageUrl(uploadResponse.url || uploadResponse.path || uploadResponse.image?.url)
        
        newImages.push({
          file: null,
          preview: URL.createObjectURL(file), // Use file blob for preview
          url: imageUrl || uploadResponse.url, // Store full URL
          isPrimary: images.length === 0 && newImages.length === 0, // First image is primary
          sortOrder: images.length + newImages.length,
          id: uploadResponse.resource_id || uploadResponse.id,
          alt: '',
        })
      } catch (error) {
        console.error('Failed to upload image:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setImages([...images, ...newImages])
    setUploading(false)

    if (newImages.length > 0) {
      toast.success(`${newImages.length} image(s) uploaded successfully`)
    }
  }

  const handleImageDelete = (index) => {
    const updatedImages = images.filter((_, i) => i !== index)
    // If deleted image was primary, make first image primary
    if (images[index].isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }
    setImages(updatedImages)
    toast.success('Image removed')
  }

  const handleSetPrimary = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    setImages(updatedImages)
    toast.success('Primary image updated')
  }

  const handleImageReorder = (fromIndex, toIndex) => {
    const updatedImages = [...images]
    const [moved] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, moved)
    // Update sort orders
    updatedImages.forEach((img, index) => {
      img.sortOrder = index
    })
    setImages(updatedImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        name: formData.name,
        short_description: formData.short_description,
        description: formData.description,
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : 0,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        stock_quantity: formData.stock_quantity !== '' && formData.stock_quantity !== null && formData.stock_quantity !== undefined 
          ? parseInt(formData.stock_quantity, 10) 
          : 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        category_id: parseInt(formData.category_id) || null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        length: formData.length ? parseFloat(formData.length) : 0,
        width: formData.width ? parseFloat(formData.width) : 0,
        height: formData.height ? parseFloat(formData.height) : 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_digital: formData.is_digital,
        requires_shipping: formData.requires_shipping,
        taxable: formData.taxable,
        track_quantity: formData.track_quantity,
        allow_backorder: formData.allow_backorder,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        images: images.map((img, index) => ({
          url: img.url,
          alt: img.alt || img.url.split('/').pop(),
          sort_order: index,
          is_primary: img.isPrimary,
        })),
      }

      let productResponse
      if (product) {
        productResponse = await adminAPI.products.updateProduct(product.resource_id || product.id, submitData)
        toast.success('Product updated successfully')
      } else {
        productResponse = await adminAPI.products.createProduct(submitData)
        toast.success('Product created successfully')
      }

      // If product was created and we have images, update images separately
      if (images.length > 0 && productResponse?.resource_id) {
        // Images are handled in the submitData, but we might need to save them separately
        // This depends on backend implementation
      }

      onSave()
    } catch (error) {
      console.error('Failed to save product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save product'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={product ? 'Edit Product' : 'Add New Product'} 
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <Input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                placeholder="e.g., PROD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.resource_id || cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images (Max {MAX_IMAGES})</h3>
          <div className="space-y-4">
            {/* Image Upload Area */}
            {images.length < MAX_IMAGES && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading || images.length >= MAX_IMAGES}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : `Click to upload images (${images.length}/${MAX_IMAGES})`}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                </label>
              </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 relative">
                      <img
                        src={image.preview || image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleImageDelete(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(index)}
                            className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all"
                            title="Set as Primary"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleImageReorder(index, index - 1)}
                        className={`text-xs ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                        title="Move Left"
                      >
                        ←
                      </button>
                      <span className="mx-2 text-xs text-gray-500">{index + 1}</span>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleImageReorder(index, index + 1)}
                        className={`text-xs ${index === images.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                        title="Move Right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.compare_price}
                onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <Input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <Input
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Physical Attributes */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Descriptions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="Brief product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <Input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="SEO meta title"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="SEO meta description"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_digital}
                onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Digital Product</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requires_shipping}
                onChange={(e) => setFormData({ ...formData, requires_shipping: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Requires Shipping</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.taxable}
                onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Taxable</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.track_quantity}
                onChange={(e) => setFormData({ ...formData, track_quantity: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Track Quantity</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_backorder}
                onChange={(e) => setFormData({ ...formData, allow_backorder: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Allow Backorder</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? 'Saving...' : uploading ? 'Uploading...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductModal
