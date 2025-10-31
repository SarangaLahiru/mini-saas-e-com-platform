import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import tokenManager from '../utils/tokenManager'
import { normalizeUserData } from '../utils/userUtils'
import toast from 'react-hot-toast'

// Auth Context
const AuthContext = createContext()

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: action.payload?.user || null,
        error: action.payload?.message || action.payload,
        needsVerification: action.payload?.needsVerification || false,
      }
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  needsVerification: false,
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!tokenManager.isAuthenticated()) {
          dispatch({ type: 'AUTH_FAILURE', payload: null })
          return
        }

        // Verify token and get user data
        const userData = await authAPI.getProfile()
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalizeUserData(userData) } })
      } catch (error) {
        console.error('Auth initialization failed:', error)
        
        // Try to refresh token if access token is invalid
        try {
          const refreshToken = tokenManager.getRefreshToken()
          if (refreshToken) {
            const response = await authAPI.refreshToken(refreshToken)
            tokenManager.setTokens(response.access_token, response.refresh_token)
            
            // Try to get profile again
            const userData = await authAPI.getProfile()
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalizeUserData(userData) } })
            return
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
        
        // If refresh also fails, clear tokens and set as unauthenticated
        tokenManager.clearTokens()
        dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired. Please login again.' })
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.login(credentials)

      // Store tokens using token manager (modern standard)
      tokenManager.setTokens(response.access_token, response.refresh_token)

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalizeUserData(response.user) } })
      toast.success('Login successful!')
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.register(userData)

      // Store tokens using token manager (modern standard)
      tokenManager.setTokens(response.access_token, response.refresh_token)

      // Only authenticate if user is verified
      if (response.user.isVerified) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalizeUserData(response.user) } })
        toast.success('Registration successful! Welcome to our platform!')
      } else {
        // Set user but don't authenticate - they need email verification
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: { 
            user: response.user, 
            needsVerification: true,
            message: response.message || 'Please verify your email to complete registration'
          } 
        })
        toast.success('Registration successful! Please check your email for verification code.')
      }
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Google Auth function
  const googleAuth = async (authResponse) => {
    try {
      dispatch({ type: 'AUTH_START' })

      // Store tokens using token manager (modern standard)
      tokenManager.setTokens(authResponse.access_token, authResponse.refresh_token)

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalizeUserData(authResponse.user) } })
      toast.success('Google authentication successful!')
      return authResponse
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Google authentication failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // Clear tokens using token manager
      tokenManager.clearTokens()
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const updatedUser = await authAPI.updateProfile(profileData)
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      toast.success('Profile updated successfully!')
      return updatedUser
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')

      const response = await authAPI.refreshToken(refreshToken)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)

      return response
    } catch (error) {
      logout()
      throw error
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Refresh auth state function
  const refreshAuthState = async () => {
    try {
      if (!tokenManager.isAuthenticated()) {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
        return
      }

          const userData = await authAPI.getProfile()
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalizeUserData(userData) } })
    } catch (error) {
      console.error('Auth refresh failed:', error)
      tokenManager.clearTokens()
      dispatch({ type: 'AUTH_FAILURE', payload: error.message })
    }
  }

  const value = {
    ...state,
    login,
    register,
    googleAuth,
    logout,
    updateProfile,
    refreshToken,
    clearError,
    refreshAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
