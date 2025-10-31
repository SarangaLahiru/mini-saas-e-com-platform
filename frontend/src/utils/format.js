// Currency formatting
export const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(price)
}

// Number formatting
export const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat('en-US', options).format(number)
}

// Date formatting
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }

    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date))
}

// Relative time formatting
export const formatRelativeTime = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// File size formatting
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)

    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`
    }

    return phoneNumber
}

// Credit card formatting
export const formatCreditCard = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})(\d{4})$/)

    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`
    }

    return cardNumber
}

// Percentage formatting
export const formatPercentage = (value, decimals = 0) => {
    return `${(value * 100).toFixed(decimals)}%`
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

// Capitalize first letter
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Format order status
export const formatOrderStatus = (status) => {
    const statusMap = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
    }

    return statusMap[status] || status
}

// Format payment status
export const formatPaymentStatus = (status) => {
    const statusMap = {
        pending: 'Pending',
        paid: 'Paid',
        failed: 'Failed',
        refunded: 'Refunded',
    }

    return statusMap[status] || status
}

// Generate initials
export const generateInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

// Format address
export const formatAddress = (address) => {
    if (!address) return ''

    const parts = [
        address.street,
        address.city,
        address.state,
        address.postal_code,
        address.country,
    ].filter(Boolean)

    return parts.join(', ')
}

// Format product SKU
export const formatSKU = (sku) => {
    return sku?.toUpperCase() || ''
}

// Format discount code
export const formatDiscountCode = (code) => {
    return code?.toUpperCase() || ''
}

// Format rating
export const formatRating = (rating) => {
    return rating?.toFixed(1) || '0.0'
}

// Format stock status
export const formatStockStatus = (stock, minStock = 0) => {
    if (stock === 0) return 'Out of Stock'
    if (stock <= minStock) return 'Low Stock'
    return 'In Stock'
}

// Format weight
export const formatWeight = (weight, unit = 'lbs') => {
    return `${weight} ${unit}`
}

// Format dimensions
export const formatDimensions = (dimensions) => {
    return dimensions || 'N/A'
}
