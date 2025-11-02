import React, { useEffect, useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Badge from '../../../components/ui/Badge'
import { adminAPI } from '../../../services/adminApi'
import { getImageUrl } from '../../../utils/imageUrl'
import toast from 'react-hot-toast'

const AdminCategories = () => {
  const [activeTab, setActiveTab] = useState('categories') // 'categories' or 'brands'
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    is_active: true,
    sort_order: 0,
  })

  const [brandFormData, setBrandFormData] = useState({
    name: '',
    slug: '',
    is_active: true,
  })

  // Fetch initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        // Fetch both in parallel for initial load
        await Promise.all([fetchCategoriesSilent(), fetchBrandsSilent()])
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Refetch when tab changes (if data not loaded)
  useEffect(() => {
    if (activeTab === 'categories' && categories.length === 0) {
      fetchCategories()
    } else if (activeTab === 'brands' && brands.length === 0) {
      fetchBrands()
    }
  }, [activeTab])

  // Silent fetch functions for initial load (don't manage loading state)
  const fetchCategoriesSilent = async () => {
    try {
      const response = await adminAPI.categories.getCategories()
      setCategories(response.categories || response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrandsSilent = async () => {
    try {
      const response = await adminAPI.brands.getBrands()
      setBrands(response.brands || response || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      // Only show loading if categories haven't been loaded yet
      if (categories.length === 0) {
        setLoading(true)
      }
      const response = await adminAPI.categories.getCategories()
      setCategories(response.categories || response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      // Only show loading if brands haven't been loaded yet
      if (brands.length === 0) {
        setLoading(true)
      }
      const response = await adminAPI.brands.getBrands()
      setBrands(response.brands || response || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const uploadResponse = await adminAPI.upload.uploadImage(file, 'category')
      const imageUrl = getImageUrl(uploadResponse.url || uploadResponse.path)
      setCategoryFormData({ ...categoryFormData, image: imageUrl })
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await adminAPI.categories.updateCategory(editingCategory.id || editingCategory.resource_id, categoryFormData)
        toast.success('Category updated successfully')
      } else {
        await adminAPI.categories.createCategory(categoryFormData)
        toast.success('Category created successfully')
      }
      setShowCategoryModal(false)
      resetCategoryForm()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`)
    }
  }

  const handleBrandSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBrand) {
        await adminAPI.brands.updateBrand(editingBrand.id, brandFormData)
        toast.success('Brand updated successfully')
      } else {
        await adminAPI.brands.createBrand(brandFormData)
        toast.success('Brand created successfully')
      }
      setShowBrandModal(false)
      resetBrandForm()
      fetchBrands()
    } catch (error) {
      console.error('Failed to save brand:', error)
      toast.error(`Failed to ${editingBrand ? 'update' : 'create'} brand`)
    }
  }

  const handleCategoryDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    try {
      await adminAPI.categories.deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleBrandDelete = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return

    try {
      await adminAPI.brands.deleteBrand(brandId)
      toast.success('Brand deleted successfully')
      fetchBrands()
    } catch (error) {
      console.error('Failed to delete brand:', error)
      toast.error('Failed to delete brand')
    }
  }

  const handleCategoryEdit = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      is_active: category.is_active !== false,
      sort_order: category.sort_order || 0,
    })
    setShowCategoryModal(true)
  }

  const handleBrandEdit = (brand) => {
    setEditingBrand(brand)
    setBrandFormData({
      name: brand.name || '',
      slug: brand.slug || '',
      is_active: brand.is_active !== false,
    })
    setShowBrandModal(true)
  }

  const resetCategoryForm = () => {
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      is_active: true,
      sort_order: 0,
    })
  }

  const resetBrandForm = () => {
    setEditingBrand(null)
    setBrandFormData({
      name: '',
      slug: '',
      is_active: true,
    })
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories & Brands</h1>
          <p className="text-gray-600 mt-1">Manage product categories and brands</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'brands'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Brands ({brands.length})
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetCategoryForm()
                setShowCategoryModal(true)
              }}
            >
              + Add Category
            </Button>
          </div>

          <Card className="p-6">
            {categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.resource_id || category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{category.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                            {category.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{category.sort_order}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={category.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleCategoryEdit(category)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(category.id || category.resource_id)}
                            className="text-error-600 hover:text-error-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No categories found.</p>
                <p className="text-sm mt-2">Create your first category to get started!</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetBrandForm()
                setShowBrandModal(true)
              }}
            >
              + Add Brand
            </Button>
          </div>

          <Card className="p-6">
            {brands.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{brand.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={brand.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}>
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleBrandEdit(brand)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleBrandDelete(brand.id)}
                            className="text-error-600 hover:text-error-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No brands found.</p>
                <p className="text-sm mt-2">Create your first brand to get started!</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false)
          resetCategoryForm()
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="lg"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              type="text"
              value={categoryFormData.name}
              onChange={(e) => {
                setCategoryFormData({
                  ...categoryFormData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                })
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <Input
              type="text"
              value={categoryFormData.slug}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleCategoryImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="category-image-upload"
              />
              <label
                htmlFor="category-image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </label>
              {categoryFormData.image && (
                <div className="mt-2">
                  <img
                    src={categoryFormData.image}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-300"
                  />
                </div>
              )}
              <Input
                type="url"
                value={categoryFormData.image}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                placeholder="Or enter image URL"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="category_is_active"
                checked={categoryFormData.is_active}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="category_is_active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <Input
                type="number"
                value={categoryFormData.sort_order}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, sort_order: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-24"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCategoryModal(false)
                resetCategoryForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploadingImage}>
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Brand Modal */}
      <Modal
        isOpen={showBrandModal}
        onClose={() => {
          setShowBrandModal(false)
          resetBrandForm()
        }}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
      >
        <form onSubmit={handleBrandSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              type="text"
              value={brandFormData.name}
              onChange={(e) => {
                setBrandFormData({
                  ...brandFormData,
                  name: e.target.value,
                  slug: brandFormData.slug || generateSlug(e.target.value),
                })
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <Input
              type="text"
              value={brandFormData.slug}
              onChange={(e) => setBrandFormData({ ...brandFormData, slug: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="brand_is_active"
              checked={brandFormData.is_active}
              onChange={(e) => setBrandFormData({ ...brandFormData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="brand_is_active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBrandModal(false)
                resetBrandForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBrand ? 'Update' : 'Create'} Brand
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCategories
