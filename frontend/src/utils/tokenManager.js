// Modern Token Management Utility
// Used by major sites like GitHub, Stripe, Vercel, etc.

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token'
}

export const tokenManager = {
    // Get access token
    getAccessToken: () => {
        return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
    },

    // Get refresh token
    getRefreshToken: () => {
        return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
    },

    // Set tokens
    setTokens: (accessToken, refreshToken) => {
        if (accessToken) {
            localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken)
        }
        if (refreshToken) {
            localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken)
        }
    },

    // Clear all tokens
    clearTokens: () => {
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
    },

    // Get token expiration (if JWT)
    getTokenExpiration: () => {
        const token = tokenManager.getAccessToken()
        if (!token) return null

        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.exp ? new Date(payload.exp * 1000) : null
        } catch {
            return null
        }
    },

    // Check if token is expired
    isTokenExpired: () => {
        const expiration = tokenManager.getTokenExpiration()
        if (!expiration) return false
        return new Date() >= expiration
    },

    // Check if token needs refresh (expires in next 5 minutes)
    needsRefresh: () => {
        const expiration = tokenManager.getTokenExpiration()
        if (!expiration) return false

        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
        return expiration <= fiveMinutesFromNow
    }
}

export default tokenManager
