/**
 * Admin API Client
 * 
 * Dedicated API client for admin operations with:
 * - Admin-specific error handling (redirects to admin login on 403)
 * - Longer timeout for bulk operations
 * - Organized API methods by resource type
 * - Backward compatibility with legacy adminAPI methods
 * 
 * Usage:
 *   import { adminAPI } from '@/services/adminApi'
 *   
 *   // New structured way (recommended)
 *   await adminAPI.products.getProducts()
 *   await adminAPI.orders.updateStatus(id, status)
 *   
 *   // Legacy way (still supported)
 *   await adminAPI.getAdminProducts()
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Create dedicated admin axios instance with admin-specific configuration
const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: 15000, // Longer timeout for admin operations (might involve bulk operations)
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Admin-specific request interceptor
adminApi.interceptors.request.use(
    (config) => {
        // Add any admin-specific headers or logging here
        // Cookies are automatically sent with withCredentials: true
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Admin-specific response interceptor with enhanced error handling
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized - try refresh, then redirect to admin login
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh token
                await adminApi.post('/auth/refresh', {})
                
                // Retry the original request
                return adminApi(originalRequest)
            } catch (refreshError) {
                // Refresh failed - redirect to admin login
                toast.error('Session expired. Please login again.')
                window.location.href = '/auth/login?redirect=/admin'
                return Promise.reject(refreshError)
            }
        }

        // Handle 403 Forbidden - admin access denied
        if (error.response?.status === 403) {
            toast.error('Admin access denied. You do not have permission to perform this action.')
            // Redirect to home instead of admin dashboard
            window.location.href = '/'
            return Promise.reject(error)
        }

        // Handle server errors
        if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.')
        } else if (error.response?.status === 404) {
            toast.error('Resource not found.')
        }

        return Promise.reject(error)
    }
)

// ============================================
// ADMIN PRODUCTS API
// ============================================
export const adminProductsAPI = {
    // Get all products with filters and pagination
    getProducts: (params = {}) => 
        adminApi.get('/admin/products', { params }).then(res => res.data),
    
    // Get single product by ID
    getProduct: (id) => 
        adminApi.get(`/admin/products/${id}`).then(res => res.data),
    
    // Create new product
    createProduct: (productData) => 
        adminApi.post('/admin/products', productData).then(res => res.data),
    
    // Update existing product
    updateProduct: (id, productData) => 
        adminApi.put(`/admin/products/${id}`, productData).then(res => res.data),
    
    // Delete product
    deleteProduct: (id) => 
        adminApi.delete(`/admin/products/${id}`).then(res => res.data),
    
    // Bulk operations
    bulkDelete: (ids) => 
        adminApi.post('/admin/products/bulk-delete', { ids }).then(res => res.data),
    
    bulkUpdateStatus: (ids, status) => 
        adminApi.put('/admin/products/bulk-status', { ids, status }).then(res => res.data),
}

// ============================================
// ADMIN ORDERS API
// ============================================
export const adminOrdersAPI = {
    // Get all orders with filters
    getOrders: (params = {}) => 
        adminApi.get('/admin/orders', { params }).then(res => res.data),
    
    // Get single order by ID
    getOrder: (id) => 
        adminApi.get(`/admin/orders/${id}`).then(res => res.data),
    
    // Update order status
    updateStatus: (id, status, notes) => 
        adminApi.put(`/admin/orders/${id}/status`, { status, notes }).then(res => res.data),
    
    // Cancel order
    cancelOrder: (id, reason) => 
        adminApi.post(`/admin/orders/${id}/cancel`, { reason }).then(res => res.data),
    
    // Refund order
    refundOrder: (id, amount) => 
        adminApi.post(`/admin/orders/${id}/refund`, { amount }).then(res => res.data),
}

// ============================================
// ADMIN USERS/CUSTOMERS API
// ============================================
export const adminUsersAPI = {
    // Get all users/customers
    getUsers: (params = {}) => 
        adminApi.get('/admin/users', { params }).then(res => res.data),
    
    // Get single user by ID
    getUser: (id) => 
        adminApi.get(`/admin/users/${id}`).then(res => res.data),
    
    // Update user
    updateUser: (id, userData) => 
        adminApi.put(`/admin/users/${id}`, userData).then(res => res.data),
    
    // Delete user
    deleteUser: (id) => 
        adminApi.delete(`/admin/users/${id}`).then(res => res.data),
    
    // Update user status (active/inactive)
    updateStatus: (id, isActive) => 
        adminApi.patch(`/admin/users/${id}/status`, { is_active: isActive }).then(res => res.data),
    
    // Get user orders
    getUserOrders: (userId, params = {}) => 
        adminApi.get(`/admin/users/${userId}/orders`, { params }).then(res => res.data),
}

// ============================================
// ADMIN CATEGORIES API
// ============================================
export const adminCategoriesAPI = {
    // Get all categories
    getCategories: (params = {}) => 
        adminApi.get('/admin/categories', { params }).then(res => res.data),
    
    // Get single category
    getCategory: (id) => 
        adminApi.get(`/admin/categories/${id}`).then(res => res.data),
    
    // Create category
    createCategory: (categoryData) => 
        adminApi.post('/admin/categories', categoryData).then(res => res.data),
    
    // Update category
    updateCategory: (id, categoryData) => 
        adminApi.put(`/admin/categories/${id}`, categoryData).then(res => res.data),
    
    // Delete category
    deleteCategory: (id) => 
        adminApi.delete(`/admin/categories/${id}`).then(res => res.data),
    
    // Update category order
    updateOrder: (id, sortOrder) => 
        adminApi.patch(`/admin/categories/${id}/order`, { sort_order: sortOrder }).then(res => res.data),
}

// ============================================
// ADMIN ANALYTICS API
// ============================================
export const adminAnalyticsAPI = {
    // Get dashboard analytics
    getDashboard: (params = {}) => 
        adminApi.get('/admin/analytics/dashboard', { params }).then(res => res.data),
    
    // Get sales data
    getSalesData: (params = {}) => 
        adminApi.get('/admin/analytics/sales', { params }).then(res => res.data),
    
    // Get top products
    getTopProducts: (params = {}) => 
        adminApi.get('/admin/analytics/top-products', { params }).then(res => res.data),
    
    // Get revenue statistics
    getRevenue: (params = {}) => 
        adminApi.get('/admin/analytics/revenue', { params }).then(res => res.data),
    
    // Get customer statistics
    getCustomerStats: (params = {}) => 
        adminApi.get('/admin/analytics/customers', { params }).then(res => res.data),
    
    // Get order statistics
    getOrderStats: (params = {}) => 
        adminApi.get('/admin/analytics/orders', { params }).then(res => res.data),
}

// ============================================
// ADMIN REVIEWS API
// ============================================
export const adminReviewsAPI = {
    // Get all reviews
    getReviews: (params = {}) => 
        adminApi.get('/admin/reviews', { params }).then(res => res.data),
    
    // Get single review
    getReview: (id) => 
        adminApi.get(`/admin/reviews/${id}`).then(res => res.data),
    
    // Update review (approve/reject)
    updateReview: (id, reviewData) => 
        adminApi.put(`/admin/reviews/${id}`, reviewData).then(res => res.data),
    
    // Delete review
    deleteReview: (id) => 
        adminApi.delete(`/admin/reviews/${id}`).then(res => res.data),
    
    // Bulk approve/reject
    bulkUpdateStatus: (ids, isApproved) => 
        adminApi.put('/admin/reviews/bulk-status', { ids, is_approved: isApproved }).then(res => res.data),
}

// ============================================
// ADMIN FILE UPLOAD API
// ============================================
export const adminUploadAPI = {
    // Upload image
    uploadImage: (file, type = 'product') => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        return adminApi.post('/admin/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(res => res.data)
    },
    
    // Upload multiple images
    uploadMultipleImages: (files, type = 'product') => {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('files', file)
        })
        formData.append('type', type)

        return adminApi.post('/admin/upload/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(res => res.data)
    },
    
    // Delete uploaded image
    deleteImage: (imageId) => 
        adminApi.delete(`/admin/upload/images/${imageId}`).then(res => res.data),
}

// ============================================
// UNIFIED ADMIN API (for backward compatibility)
// ============================================
export const adminAPI = {
    // Products
    products: adminProductsAPI,
    
    // Orders
    orders: adminOrdersAPI,
    
    // Users/Customers
    users: adminUsersAPI,
    customers: adminUsersAPI, // Alias for users
    
    // Categories
    categories: adminCategoriesAPI,
    
    // Analytics
    analytics: adminAnalyticsAPI,
    
    // Reviews
    reviews: adminReviewsAPI,
    
    // Upload
    upload: adminUploadAPI,
    
    // Legacy methods (for backward compatibility - will be deprecated)
    getAdminProducts: adminProductsAPI.getProducts,
    createProduct: adminProductsAPI.createProduct,
    updateProduct: adminProductsAPI.updateProduct,
    deleteProduct: adminProductsAPI.deleteProduct,
    
    getAdminOrders: adminOrdersAPI.getOrders,
    updateOrderStatus: adminOrdersAPI.updateStatus,
    
    getUsers: adminUsersAPI.getUsers,
    updateUser: adminUsersAPI.updateUser,
    
    getAnalytics: adminAnalyticsAPI.getDashboard,
    getSalesData: adminAnalyticsAPI.getSalesData,
    getTopProducts: adminAnalyticsAPI.getTopProducts,
}

export default adminApi

