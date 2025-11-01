/**
 * Extract user-friendly error message from API error response
 * 
 * Backend error format: { error: "...", message: "..." }
 * 
 * @param {Error} error - The error object from API call
 * @param {Object} options - Options for error extraction
 * @param {string} options.defaultMessage - Default message if no backend message
 * @param {boolean} options.useStatusMessages - Whether to use status code fallbacks
 * @returns {string} - User-friendly error message
 */
export function extractErrorMessage(error, options = {}) {
  const {
    defaultMessage = 'An error occurred. Please try again.',
    useStatusMessages = true
  } = options

  // If error has response (HTTP error)
  if (error?.response) {
    const status = error.response.status
    const data = error.response.data

    // Priority 1: Backend message field (most specific and user-friendly)
    if (data?.message && typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim()
    }

    // Priority 2: Backend error field (fallback if message not available)
    if (data?.error && typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim()
    }

    // Priority 3: Check for error in different formats (some APIs use different structures)
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || data.errors[0] || defaultMessage
    }

    // Priority 4: Use status code messages if enabled (only if no backend message)
    if (useStatusMessages) {
      switch (status) {
        case 400:
          return 'Invalid request. Please check your information.'
        case 401:
          return 'Invalid credentials. Please check your email and password.'
        case 403:
          return 'Access denied. You do not have permission.'
        case 404:
          return 'Resource not found. Please try again.'
        case 409:
          return 'Conflict. This resource already exists.'
        case 422:
          return 'Validation error. Please check your input.'
        case 429:
          return 'Too many requests. Please try again later.'
        case 500:
        case 502:
        case 503:
          return 'Server error. Please try again later.'
        default:
          return defaultMessage
      }
    }
  }

  // Network or client-side errors
  if (error?.message) {
    const msg = error.message.toLowerCase()
    
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('failed to fetch')) {
      return 'Connection error. Please check your internet connection and try again.'
    }
    
    if (msg.includes('cors')) {
      return 'Server connection issue. Please contact support.'
    }

    // Return the error message as-is for other cases
    return error.message
  }

  // Fallback to default
  return defaultMessage
}

/**
 * Extract field-specific errors from validation error response
 * 
 * @param {Error} error - The error object from API call
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export function extractFieldErrors(error) {
  const fieldErrors = {}

  if (error?.response?.data) {
    const data = error.response.data

    // Handle validation errors in format { errors: { field: ["message"] } }
    if (data.errors && typeof data.errors === 'object') {
      Object.keys(data.errors).forEach(field => {
        const errors = data.errors[field]
        if (Array.isArray(errors) && errors.length > 0) {
          fieldErrors[field] = errors[0]
        } else if (typeof errors === 'string') {
          fieldErrors[field] = errors
        }
      })
    }

    // Handle validation errors in format { field: "message" }
    if (data.validation) {
      Object.assign(fieldErrors, data.validation)
    }
  }

  return fieldErrors
}

