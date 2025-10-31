// Google OAuth utility functions
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'

// Load Google OAuth script
export const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

// Initialize Google OAuth
export const initializeGoogleAuth = () => {
    return new Promise((resolve, reject) => {
        loadGoogleScript()
            .then(() => {
                if (window.google) {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: (response) => {
                            resolve(response.credential)
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    })
                } else {
                    reject(new Error('Google OAuth script failed to load'))
                }
            })
            .catch(reject)
    })
}

// Trigger Google OAuth popup
export const triggerGoogleAuth = () => {
    return new Promise((resolve, reject) => {
        if (!window.google) {
            reject(new Error('Google OAuth not initialized'))
            return
        }

        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                reject(new Error('Google OAuth popup was blocked or skipped'))
            }
        })
    })
}

// Decode Google JWT token
export const decodeGoogleToken = (token) => {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        throw new Error('Failed to decode Google token')
    }
}

// Authenticate with Google ID token
export const authenticateWithGoogle = async (idToken) => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
        const response = await fetch(`${API_BASE_URL}/auth/google/id-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_token: idToken
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Google authentication failed')
        }

        const data = await response.json()
        return data
    } catch (error) {
        throw new Error(`Google authentication failed: ${error.message}`)
    }
}
