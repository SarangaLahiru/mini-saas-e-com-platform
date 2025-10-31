/**
 * Utility functions for handling user data
 */

/**
 * Normalizes user data to ensure consistent field names
 * @param {Object} user - User object from API
 * @returns {Object} Normalized user object
 */
export const normalizeUserData = (user) => {
    if (!user) return null

    return {
        ...user,
        // Normalize name fields to camelCase
        firstName: user.first_name || user.firstName || '',
        lastName: user.last_name || user.lastName || '',
        // Normalize role flag to camelCase
        isAdmin: typeof user.isAdmin === 'boolean' ? user.isAdmin : !!user.is_admin,
        // Keep original fields for backward compatibility
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        // Ensure avatar is properly formatted
        avatar: user.avatar || null,
    }
}

/**
 * Gets user initials from user object
 * @param {Object} user - User object
 * @returns {string} User initials
 */
export const getUserInitials = (user) => {
    if (!user) return 'U'

    const firstName = user.first_name || user.firstName || ''
    const lastName = user.last_name || user.lastName || ''

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : ''
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ''

    const initials = firstInitial + lastInitial
    return initials || 'U'
}

/**
 * Gets user display name
 * @param {Object} user - User object
 * @returns {string} User display name
 */
export const getUserDisplayName = (user) => {
    if (!user) return 'User'

    const firstName = user.first_name || user.firstName || ''
    const lastName = user.last_name || user.lastName || ''

    const name = `${firstName} ${lastName}`.trim()
    return name || 'User'
}
