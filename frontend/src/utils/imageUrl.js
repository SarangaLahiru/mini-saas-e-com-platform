/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Extract base URL without /api/v1
const getBaseUrl = () => {
  const base = API_BASE_URL.replace(/\/api\/v1$/, '')
  return base || 'http://localhost:8080'
}

/**
 * Converts a relative image URL to a full URL
 * @param {string} url - Image URL (can be relative or absolute)
 * @returns {string} - Full image URL
 */
export const getImageUrl = (url) => {
  if (!url) return null
  
  // If already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If it's a relative path starting with /uploads, prepend the API base URL
  if (url.startsWith('/uploads/')) {
    const baseUrl = getBaseUrl()
    return `${baseUrl}${url}`
  }
  
  // If it's just a filename or path, assume it's in uploads/product
  if (!url.startsWith('/') && !url.startsWith('http')) {
    const baseUrl = getBaseUrl()
    return `${baseUrl}/uploads/product/${url}`
  }
  
  // Default: return as is (might be a full URL or already correct)
  return url
}

/**
 * Gets the primary image URL from a product or image array
 * @param {Object} product - Product object with images array
 * @returns {string|null} - Primary image URL or first image URL
 */
export const getPrimaryImageUrl = (product) => {
  if (!product) return null
  
  // Check for images array
  if (product.images && product.images.length > 0) {
    // Find primary image first
    const primaryImage = product.images.find(img => img.is_primary || img.isPrimary)
    if (primaryImage) {
      return getImageUrl(primaryImage.url)
    }
    // Otherwise return first image
    return getImageUrl(product.images[0].url)
  }
  
  // Fallback to single image property
  if (product.image) {
    return getImageUrl(product.image)
  }
  
  return null
}

