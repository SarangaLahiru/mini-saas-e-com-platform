import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../contexts/AuthContext'
import { authAPI } from '../../../services/api'
import { getImageUrl } from '../../../utils/imageUrl'
import { Edit2, Save, X, Camera, CheckCircle2, User, Mail, Phone, AtSign, MapPin, Plus, Trash2, Star } from 'lucide-react'
import toast from '../../../utils/toast'

const ProfileInfo = () => {
  const { user, updateProfile } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const fileInputRef = useRef(null)
  
  // Form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || user?.first_name || '',
    lastName: user?.lastName || user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  })

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: 'shipping',
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false,
  })

  // Update form data when user changes
  // Sync form data with user data only on initial load or when user object reference changes significantly
  // Use ref to track if we've initialized to prevent unnecessary updates
  const initializedRef = useRef(false)
  
  useEffect(() => {
    if (user && !initializedRef.current) {
      setFormData({
        username: user?.username || '',
        firstName: user?.firstName || user?.first_name || '',
        lastName: user?.lastName || user?.last_name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
      })
      if (user.addresses) {
        setAddresses(user.addresses)
      }
      initializedRef.current = true
    }
  }, [user?.username, user?.email]) // Only depend on critical fields that won't change during profile edits

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true)
        const addressesData = await authAPI.getAddresses()
        setAddresses(addressesData)
      } catch (error) {
        console.error('Failed to load addresses:', error)
        // Don't show error toast on initial load
        if (addresses.length === 0) {
          setAddresses([])
        }
      } finally {
        setLoadingAddresses(false)
      }
    }
    if (user) {
      loadAddresses()
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFieldEdit = (field) => {
    setEditingField(field === editingField ? null : field)
  }

  const validateField = (field, value) => {
    const trimmedValue = value?.trim() || ''

    switch (field) {
      case 'username':
        if (!trimmedValue) {
          return 'Username is required'
        }
        if (trimmedValue.length < 3) {
          return 'Username must be at least 3 characters long'
        }
        if (trimmedValue.length > 50) {
          return 'Username must be less than 50 characters'
        }
        // Username should contain only letters, numbers, and underscores
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedValue)) {
          return 'Username can only contain letters, numbers, and underscores'
        }
        return null

      case 'firstName':
        if (!trimmedValue) {
          return 'First name is required'
        }
        if (trimmedValue.length < 2) {
          return 'First name must be at least 2 characters long'
        }
        if (trimmedValue.length > 50) {
          return 'First name must be less than 50 characters'
        }
        // First name should contain only letters, spaces, and hyphens
        if (!/^[a-zA-Z\s-]+$/.test(trimmedValue)) {
          return 'First name can only contain letters, spaces, and hyphens'
        }
        return null

      case 'lastName':
        if (!trimmedValue) {
          return 'Last name is required'
        }
        if (trimmedValue.length < 2) {
          return 'Last name must be at least 2 characters long'
        }
        if (trimmedValue.length > 50) {
          return 'Last name must be less than 50 characters'
        }
        // Last name should contain only letters, spaces, and hyphens
        if (!/^[a-zA-Z\s-]+$/.test(trimmedValue)) {
          return 'Last name can only contain letters, spaces, and hyphens'
        }
        return null

      case 'phone':
        if (!trimmedValue) {
          return null // Phone is optional
        }
        // Remove common phone formatting characters for validation
        const cleanPhone = trimmedValue.replace(/[\s\-\(\)\+\.]/g, '')
        if (cleanPhone.length < 10) {
          return 'Phone number must be at least 10 digits'
        }
        if (cleanPhone.length > 20) {
          return 'Phone number must be less than 20 digits'
        }
        // Phone should contain only digits after removing formatting
        if (!/^\d+$/.test(cleanPhone)) {
          return 'Phone number must contain only digits'
        }
        return null

      default:
        return null
    }
  }

  const handleSaveField = async (field) => {
    // Validate the field
    const error = validateField(field, formData[field])
    if (error) {
      toast.error(error)
      return
    }

    try {
      const backendField = field === 'firstName' ? 'firstName' : 
                           field === 'lastName' ? 'lastName' : 
                           field
      
      // Clean and prepare the value
      let cleanValue = formData[field]?.trim() || ''
      
      // Special handling for phone - remove formatting
      if (field === 'phone' && cleanValue) {
        cleanValue = cleanValue.replace(/[\s\-\(\)\+\.]/g, '')
      }
      
      const updatePayload = {}
      updatePayload[backendField] = cleanValue
      
      const updatedUser = await updateProfile(updatePayload)
      // Update local form data with the response to keep it in sync
      if (updatedUser) {
        setFormData(prev => ({
          ...prev,
          [field]: updatedUser[field] || updatedUser[backendField] || formData[field]
        }))
      }
      setEditingField(null)
      toast.success(`${field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'username' ? 'Username' : 'Phone'} updated successfully!`)
    } catch (error) {
      // Handle specific backend validation errors
      const errorMessage = error.response?.data?.message || error.message || `Failed to update ${field}`
      toast.error(errorMessage)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setIsUploading(true)
    try {
      const response = await authAPI.uploadAvatar(file)
      const updatedUser = await updateProfile({ avatar: response.url })
      // Update local form data with the response
      setFormData(prev => ({ ...prev, avatar: response.url }))
      toast.success('Avatar updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Helper function to parse backend validation errors into user-friendly messages
  const parseBackendError = (errorMessage) => {
    if (!errorMessage) return 'Validation failed. Please check your input.'
    
    // Map common backend validation errors to user-friendly messages
    const errorMap = {
      'Phone.*min': 'Phone number must be at least 10 digits',
      'Phone.*max': 'Phone number must be less than 20 digits',
      'first_name.*min': 'First name must be at least 2 characters',
      'first_name.*max': 'First name must be less than 50 characters',
      'last_name.*min': 'Last name must be at least 2 characters',
      'last_name.*max': 'Last name must be less than 50 characters',
      'address_line_1.*min': 'Street address must be at least 5 characters',
      'address_line_1.*max': 'Street address must be less than 255 characters',
      'city.*min': 'City must be at least 2 characters',
      'city.*max': 'City must be less than 100 characters',
      'state.*min': 'State must be at least 2 characters',
      'state.*max': 'State must be less than 100 characters',
      'postal_code.*min': 'Postal code must be at least 3 characters',
      'postal_code.*max': 'Postal code must be less than 20 characters',
      'country.*min': 'Country must be at least 2 characters',
      'country.*max': 'Country must be less than 100 characters',
    }

    // Check for matching patterns
    for (const [pattern, message] of Object.entries(errorMap)) {
      if (new RegExp(pattern, 'i').test(errorMessage)) {
        return message
      }
    }

    // If no pattern matches, try to extract a cleaner message
    if (errorMessage.includes('Field validation')) {
      const fieldMatch = errorMessage.match(/'(\w+)'/g)
      const tagMatch = errorMessage.match(/'(\w+)' tag/g)
      if (fieldMatch && tagMatch) {
        const field = fieldMatch[0].replace(/'/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        const tag = tagMatch[0].replace(/'/g, '').replace(' tag', '')
        if (tag === 'min') {
          return `${field} is too short. Please check the minimum length requirement.`
        } else if (tag === 'max') {
          return `${field} is too long. Please check the maximum length requirement.`
        }
      }
    }

    return errorMessage
  }

  // Validate phone number
  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return null // Phone is optional
    }
    const cleanPhone = phone.trim().replace(/[\s\-\(\)\+\.]/g, '')
    if (cleanPhone.length < 10) {
      return 'Phone number must be at least 10 digits'
    }
    if (cleanPhone.length > 20) {
      return 'Phone number must be less than 20 digits'
    }
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Phone number must contain only digits'
    }
    return null
  }

  const handleCreateAddress = async () => {
    // Validate required fields
    if (!addressForm.address_line_1 || addressForm.address_line_1.trim().length < 5) {
      toast.error('Street address must be at least 5 characters')
      return
    }
    if (!addressForm.city || addressForm.city.trim().length < 2) {
      toast.error('City is required')
      return
    }
    if (!addressForm.state || addressForm.state.trim().length < 2) {
      toast.error('State is required')
      return
    }
    if (!addressForm.postal_code || addressForm.postal_code.trim().length < 3) {
      toast.error('Postal code is required')
      return
    }
    if (!addressForm.country || addressForm.country.trim().length < 2) {
      toast.error('Country is required')
      return
    }
    if (!addressForm.first_name || addressForm.first_name.trim().length < 2) {
      toast.error('First name must be at least 2 characters')
      return
    }
    if (!addressForm.last_name || addressForm.last_name.trim().length < 2) {
      toast.error('Last name must be at least 2 characters')
      return
    }

    // Validate phone if provided
    const phoneError = validatePhone(addressForm.phone)
    if (phoneError) {
      toast.error(phoneError)
      return
    }

    try {
      // Clean and prepare the data
      let cleanPhone = addressForm.phone?.trim() || ''
      if (cleanPhone) {
        cleanPhone = cleanPhone.replace(/[\s\-\(\)\+\.]/g, '')
      }

      const cleanAddressData = {
        type: addressForm.type,
        first_name: addressForm.first_name.trim(),
        last_name: addressForm.last_name.trim(),
        company: addressForm.company?.trim() || '',
        address_line_1: addressForm.address_line_1.trim(),
        address_line_2: addressForm.address_line_2?.trim() || '',
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postal_code: addressForm.postal_code.trim(),
        country: addressForm.country.trim(),
        phone: cleanPhone || '',
        is_default: addressForm.is_default || false,
      }

      const data = await authAPI.createAddress(cleanAddressData)
      setAddresses([...addresses, data])
      setAddressForm({
        type: 'shipping',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        is_default: false,
      })
      setShowAddAddress(false)
      toast.success('Address added successfully!')
    } catch (error) {
      console.error('Address creation error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add address'
      const friendlyError = parseBackendError(errorMsg)
      toast.error(friendlyError)
    }
  }

  const handleUpdateAddress = async (resourceId) => {
    // Validate required fields
    if (!addressForm.address_line_1 || addressForm.address_line_1.trim().length < 5) {
      toast.error('Street address must be at least 5 characters')
      return
    }
    if (!addressForm.city || addressForm.city.trim().length < 2) {
      toast.error('City is required')
      return
    }
    if (!addressForm.state || addressForm.state.trim().length < 2) {
      toast.error('State is required')
      return
    }
    if (!addressForm.postal_code || addressForm.postal_code.trim().length < 3) {
      toast.error('Postal code is required')
      return
    }
    if (!addressForm.country || addressForm.country.trim().length < 2) {
      toast.error('Country is required')
      return
    }
    if (!addressForm.first_name || addressForm.first_name.trim().length < 2) {
      toast.error('First name must be at least 2 characters')
      return
    }
    if (!addressForm.last_name || addressForm.last_name.trim().length < 2) {
      toast.error('Last name must be at least 2 characters')
      return
    }

    // Validate phone if provided
    const phoneError = validatePhone(addressForm.phone)
    if (phoneError) {
      toast.error(phoneError)
      return
    }

    try {
      // Clean and prepare the data
      let cleanPhone = addressForm.phone?.trim() || ''
      if (cleanPhone) {
        cleanPhone = cleanPhone.replace(/[\s\-\(\)\+\.]/g, '')
      }

      const cleanAddressData = {
        type: addressForm.type,
        first_name: addressForm.first_name.trim(),
        last_name: addressForm.last_name.trim(),
        company: addressForm.company?.trim() || '',
        address_line_1: addressForm.address_line_1.trim(),
        address_line_2: addressForm.address_line_2?.trim() || '',
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postal_code: addressForm.postal_code.trim(),
        country: addressForm.country.trim(),
        phone: cleanPhone || '',
        is_default: addressForm.is_default || false,
      }

      const data = await authAPI.updateAddress(resourceId, cleanAddressData)
      setAddresses(addresses.map(addr => addr.resource_id === resourceId ? data : addr))
      setEditingAddress(null)
      setAddressForm({
        type: 'shipping',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        is_default: false,
      })
      setShowAddAddress(false)
      toast.success('Address updated successfully!')
    } catch (error) {
      console.error('Address update error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update address'
      const friendlyError = parseBackendError(errorMsg)
      toast.error(friendlyError)
    }
  }

  const handleDeleteAddress = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return

    try {
      await authAPI.deleteAddress(resourceId)
      setAddresses(addresses.filter(addr => addr.resource_id !== resourceId))
      toast.success('Address deleted successfully!')
    } catch (error) {
      console.error('Address deletion error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete address')
    }
  }

  const handleSetDefault = async (resourceId) => {
    try {
      await authAPI.setDefaultAddress(resourceId)
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.resource_id === resourceId
      })))
      toast.success('Default address updated!')
    } catch (error) {
      console.error('Set default address error:', error)
      toast.error(error.response?.data?.message || 'Failed to set default address')
    }
  }

  const startEditAddress = (address) => {
    setEditingAddress(address.resource_id)
    setAddressForm({
      type: address.type,
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company || '',
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default,
    })
    setShowAddAddress(true)
  }

  const getInitials = () => {
    const first = formData.firstName?.[0]?.toUpperCase() || ''
    const last = formData.lastName?.[0]?.toUpperCase() || ''
    return first + last || user?.email?.[0]?.toUpperCase() || 'U'
  }

  const avatarUrl = formData.avatar ? getImageUrl(formData.avatar) : null

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section with Avatar */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 border-b border-gray-200">
          <div className="flex flex-col items-center">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${formData.firstName} ${formData.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{getInitials()}</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              {/* Camera Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name Section */}
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.firstName || formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`.trim()
                  : 'User'}
              </h2>
              {user?.isVerified && (
                <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="p-6 space-y-4">
          {/* Username */}
          <EditableField
            label="Username"
            value={formData.username}
            icon={<AtSign className="w-5 h-5 text-blue-600" />}
            editing={editingField === 'username'}
            onEdit={() => handleFieldEdit('username')}
            onChange={(value) => handleInputChange('username', value)}
            onSave={() => handleSaveField('username')}
            onCancel={() => setEditingField(null)}
            field="username"
          />

          {/* Email (Read-only) */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Email</label>
              <p className="text-sm font-semibold text-gray-900 truncate">{formData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          {/* First Name */}
          <EditableField
            label="First Name"
            value={formData.firstName}
            icon={<User className="w-5 h-5 text-blue-600" />}
            editing={editingField === 'firstName'}
            onEdit={() => handleFieldEdit('firstName')}
            onChange={(value) => handleInputChange('firstName', value)}
            onSave={() => handleSaveField('firstName')}
            onCancel={() => setEditingField(null)}
            field="firstName"
          />

          {/* Last Name */}
          <EditableField
            label="Last Name"
            value={formData.lastName}
            icon={<User className="w-5 h-5 text-blue-600" />}
            editing={editingField === 'lastName'}
            onEdit={() => handleFieldEdit('lastName')}
            onChange={(value) => handleInputChange('lastName', value)}
            onSave={() => handleSaveField('lastName')}
            onCancel={() => setEditingField(null)}
            field="lastName"
          />

          {/* Phone */}
          <EditableField
            label="Phone"
            value={formData.phone}
            icon={<Phone className="w-5 h-5 text-blue-600" />}
            editing={editingField === 'phone'}
            onEdit={() => handleFieldEdit('phone')}
            onChange={(value) => handleInputChange('phone', value)}
            onSave={() => handleSaveField('phone')}
            onCancel={() => setEditingField(null)}
            field="phone"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Addresses Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Addresses
            </h3>
            <button
              onClick={() => {
                setShowAddAddress(!showAddAddress)
                setEditingAddress(null)
                setAddressForm({
                  type: 'shipping',
                  first_name: '',
                  last_name: '',
                  company: '',
                  address_line_1: '',
                  address_line_2: '',
                  city: '',
                  state: '',
                  postal_code: '',
                  country: '',
                  phone: '',
                  is_default: false,
                })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Add/Edit Address Form */}
          <AnimatePresence>
            {showAddAddress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-xl p-6 border-2 border-blue-200 space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddAddress(false)
                      setEditingAddress(null)
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
                    <select
                      value={addressForm.type}
                      onChange={(e) => handleAddressChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="shipping">Shipping</option>
                      <option value="billing">Billing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      placeholder="Country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={addressForm.first_name}
                      onChange={(e) => handleAddressChange('first_name', e.target.value)}
                      placeholder="First Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={addressForm.last_name}
                      onChange={(e) => handleAddressChange('last_name', e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 1</label>
                    <input
                      type="text"
                      value={addressForm.address_line_1}
                      onChange={(e) => handleAddressChange('address_line_1', e.target.value)}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.address_line_2}
                      onChange={(e) => handleAddressChange('address_line_2', e.target.value)}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      value={addressForm.postal_code}
                      onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                      placeholder="Postal Code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      placeholder="Phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Company (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.company}
                      onChange={(e) => handleAddressChange('company', e.target.value)}
                      placeholder="Company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={addressForm.is_default}
                      onChange={(e) => handleAddressChange('is_default', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_default" className="text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => editingAddress ? handleUpdateAddress(editingAddress) : handleCreateAddress()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddAddress(false)
                      setEditingAddress(null)
                    }}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Addresses List */}
          {loadingAddresses ? (
            <div className="text-center py-8 text-gray-500">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No addresses yet</p>
              <p className="text-xs text-gray-400 mt-1">Add your first address to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.resource_id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    address.is_default
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          address.type === 'billing'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {address.type === 'billing' ? 'Billing' : 'Shipping'}
                        </span>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                            <Star className="w-3 h-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {address.first_name} {address.last_name}
                        </p>
                        <p className="text-sm text-gray-700">
                          {address.address_line_1}
                          {address.address_line_2 && `, ${address.address_line_2}`}
                        </p>
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm text-gray-700">{address.country}</p>
                        {address.phone && (
                          <p className="text-sm text-gray-600 mt-2">Phone: {address.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.resource_id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEditAddress(address)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.resource_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Editable Field Component - Improved styling
const EditableField = ({ label, value, icon, editing, onEdit, onChange, onSave, onCancel, field, placeholder }) => {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  // Validation function
  const validateField = (field, value) => {
    const trimmedValue = value?.trim() || ''

    switch (field) {
      case 'username':
        if (!trimmedValue) {
          return 'Username is required'
        }
        if (trimmedValue.length < 3) {
          return 'Username must be at least 3 characters long'
        }
        if (trimmedValue.length > 50) {
          return 'Username must be less than 50 characters'
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedValue)) {
          return 'Username can only contain letters, numbers, and underscores'
        }
        return null

      case 'firstName':
        if (!trimmedValue) {
          return 'First name is required'
        }
        if (trimmedValue.length < 2) {
          return 'First name must be at least 2 characters long'
        }
        if (trimmedValue.length > 50) {
          return 'First name must be less than 50 characters'
        }
        if (!/^[a-zA-Z\s-]+$/.test(trimmedValue)) {
          return 'First name can only contain letters, spaces, and hyphens'
        }
        return null

      case 'lastName':
        if (!trimmedValue) {
          return 'Last name is required'
        }
        if (trimmedValue.length < 2) {
          return 'Last name must be at least 2 characters long'
        }
        if (trimmedValue.length > 50) {
          return 'Last name must be less than 50 characters'
        }
        if (!/^[a-zA-Z\s-]+$/.test(trimmedValue)) {
          return 'Last name can only contain letters, spaces, and hyphens'
        }
        return null

      case 'phone':
        if (!trimmedValue) {
          return null // Phone is optional
        }
        const cleanPhone = trimmedValue.replace(/[\s\-\(\)\+\.]/g, '')
        if (cleanPhone.length < 10) {
          return 'Phone number must be at least 10 digits'
        }
        if (cleanPhone.length > 20) {
          return 'Phone number must be less than 20 digits'
        }
        if (!/^\d+$/.test(cleanPhone)) {
          return 'Phone number must contain only digits'
        }
        return null

      default:
        return null
    }
  }

  const handleChange = (newValue) => {
    onChange(newValue)
    if (touched) {
      const validationError = validateField(field, newValue)
      setError(validationError)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    const validationError = validateField(field, value)
    setError(validationError)
  }

  const handleSave = () => {
    setTouched(true)
    const validationError = validateField(field, value)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }
    setError(null)
    onSave()
  }

  const handleCancel = () => {
    setError(null)
    setTouched(false)
    onCancel()
  }

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
      editing 
        ? error 
          ? 'bg-red-50 border-red-300 shadow-sm' 
          : 'bg-blue-50 border-blue-300 shadow-sm'
        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
    }`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5 ${
        error && editing ? 'bg-red-100' : 'bg-blue-100'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type={field === 'phone' ? 'tel' : 'text'}
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-gray-900 bg-white transition-colors ${
                    error 
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                      : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button
                  onClick={handleSave}
                  disabled={!!error}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-600 flex items-center gap-1"
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between group"
            >
              <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                {value || <span className="text-gray-400 italic">Not set</span>}
              </p>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProfileInfo
