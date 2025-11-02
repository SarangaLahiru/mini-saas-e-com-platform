import axios from 'axios'
import toast from '../utils/toast'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Always send cookies for auth
})

// Request interceptor (cookies are sent automatically via withCredentials)
api.interceptors.request.use(
    (config) => {
        // Cookies are automatically sent with withCredentials: true
        // No need to manually add Authorization header when using HttpOnly cookies
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token refresh with cookies
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Don't try to refresh token for login/auth endpoints - let them handle their own errors
        // These endpoints can return 401 for invalid credentials/OTP, which is expected
        // Check both full URL and pathname to handle different URL formats
        const requestUrl = originalRequest.url || ''
        const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                              requestUrl.includes('/auth/register') ||
                              requestUrl.includes('/auth/refresh') ||
                              requestUrl.includes('/auth/verify-otp') ||
                              requestUrl.includes('/auth/resend-otp') ||
                              requestUrl.includes('/auth/send-otp') ||
                              requestUrl.includes('/auth/forgot-password') ||
                              requestUrl.includes('/auth/password-reset') ||
                              requestUrl.includes('/auth/reset-password')

        // On 401, try to refresh using cookie-based refresh token
        // But skip auth endpoints (login/register) as they should handle their own 401 errors
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true

            try {
                // Call refresh endpoint (refresh_token cookie sent automatically)
                await api.post('/auth/refresh', {})

                // Retry the original request (new access_token cookie set by server)
                return api(originalRequest)
            } catch (refreshError) {
                // Refresh failed - redirect to login
                window.location.href = '/auth/login'
                return Promise.reject(refreshError)
            }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.')
        } else if (error.response?.status === 404) {
            toast.error('Resource not found.')
        } else if (error.response?.status === 403) {
            toast.error('Access denied.')
        }

        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
    register: (userData) => api.post('/auth/register', userData).then(res => res.data),
    logout: () => api.post('/auth/logout').then(res => res.data),
    getProfile: () => api.get('/auth/profile').then(res => res.data),
    updateProfile: (profileData) => api.put('/auth/profile', profileData).then(res => res.data),
    uploadAvatar: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data)
    },
    // Address API
    getAddresses: () => api.get('/auth/addresses').then(res => res.data),
    createAddress: (addressData) => api.post('/auth/addresses', addressData).then(res => res.data),
    updateAddress: (resourceId, addressData) => api.put(`/auth/addresses/${resourceId}`, addressData).then(res => res.data),
    deleteAddress: (resourceId) => api.delete(`/auth/addresses/${resourceId}`).then(res => res.data),
    setDefaultAddress: (resourceId) => api.post(`/auth/addresses/${resourceId}/default`).then(res => res.data),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }).then(res => res.data),
    googleAuth: (googleData) => api.post('/auth/google', googleData).then(res => res.data),
    googleIDTokenAuth: (idToken) => api.post('/auth/google/id-token', { id_token: idToken }).then(res => res.data),

    // OTP API
    sendOTP: (email, type) => api.post('/auth/send-otp', { email, type }).then(res => res.data),
    verifyOTP: (email, code, type) => api.post('/auth/verify-otp', { email, otp_code: code, type }).then(res => res.data),
    resendOTP: (email, type) => api.post('/auth/resend-otp', { email, type }).then(res => res.data),
}

export async function sendForgotPasswordOTP(email) {
    const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'password_reset' }),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
}

export async function submitResetPassword({ email, otp_code, new_password, confirm_password }) {
    const res = await fetch('/api/v1/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            otp_code,
            new_password,
            confirm_password,
        }),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
}

// Products API
export const productsAPI = {
    getProducts: (params) => api.get('/products', { params }).then(res => res.data),
    getProduct: (id) => api.get(`/products/${id}`).then(res => res.data),
    getCategories: (params) => api.get('/categories', { params }).then(res => res.data),
    getBrands: () => api.get('/brands').then(res => res.data),
    suggest: (q, limit = 8) => api.get('/search/suggest', { params: { q, limit } }).then(res => res.data),
    search: (q, limit = 5) => api.get('/search', { params: { q, limit } }).then(res => res.data),
    getCategory: (slug) => api.get(`/categories/${slug}`).then(res => res.data),
    searchProducts: (query, filters) => api.get('/products/search', {
        params: { q: query, ...filters }
    }).then(res => res.data),
    getFeaturedProducts: () => api.get('/products/featured').then(res => res.data),
    getRelatedProducts: (productId) => api.get(`/products/${productId}/related`).then(res => res.data),
}

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart').then(res => res.data),
    addToCart: (itemData) => api.post('/cart/items', itemData).then(res => res.data),
    updateCartItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data).then(res => res.data),
    removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`).then(res => res.data),
    clearCart: () => api.delete('/cart').then(res => res.data),
}

// Orders API
export const ordersAPI = {
    getOrders: (params) => api.get('/orders', { params }).then(res => res.data),
    getOrder: (id) => api.get(`/orders/${id}`).then(res => res.data),
    createOrder: (orderData) => api.post('/orders', orderData).then(res => res.data),
    cancelOrder: (id) => api.post(`/orders/${id}/cancel`).then(res => res.data),
}

// Payments API
export const paymentsAPI = {
    createPayment: (paymentData) => api.post('/payments', paymentData).then(res => res.data),
}

// Wishlist API
export const wishlistAPI = {
    getWishlist: () => api.get('/wishlist').then(res => res.data),
    addToWishlist: (productId) => api.post('/wishlist', { product_id: productId }).then(res => res.data),
    removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`).then(res => res.data),
}

// Reviews API
export const reviewsAPI = {
    getProductReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }).then(res => res.data),
    createReview: (reviewData) => api.post('/reviews', reviewData).then(res => res.data),
    updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData).then(res => res.data),
    deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`).then(res => res.data),
    getMyReviews: (params) => api.get('/reviews/my', { params }).then(res => res.data),

    // Reply methods
    createReply: (replyData) => api.post('/reviews/replies', replyData).then(res => res.data),
    deleteReply: (replyId) => api.delete(`/reviews/replies/${replyId}`).then(res => res.data),
}

// Admin API
export const adminAPI = {
    // Products
    getAdminProducts: (params) => api.get('/admin/products', { params }).then(res => res.data),
    createProduct: (productData) => api.post('/admin/products', productData).then(res => res.data),
    updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData).then(res => res.data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`).then(res => res.data),

    // Orders
    getAdminOrders: (params) => api.get('/admin/orders', { params }).then(res => res.data),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }).then(res => res.data),

    // Users
    getUsers: (params) => api.get('/admin/users', { params }).then(res => res.data),
    updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData).then(res => res.data),

    // Analytics
    getAnalytics: (params) => api.get('/admin/analytics', { params }).then(res => res.data),
    getSalesData: (params) => api.get('/admin/analytics/sales', { params }).then(res => res.data),
    getTopProducts: (params) => api.get('/admin/analytics/top-products', { params }).then(res => res.data),
}

// File Upload API
export const uploadAPI = {
    uploadImage: (file, type = 'product') => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        return api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(res => res.data)
    },
}

export default api
