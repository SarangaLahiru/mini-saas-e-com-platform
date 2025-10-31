import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

// App Context
const AppContext = createContext()

// App Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload,
      }
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notification: null,
      }
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      }
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload,
      }
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          category: null,
          priceRange: [0, 10000],
          brand: null,
          rating: null,
          sortBy: 'name',
          sortOrder: 'asc',
        },
      }
    default:
      return state
  }
}

// Initial State
const initialState = {
  isLoading: false,
  error: null,
  notification: null,
  theme: 'light',
  sidebarOpen: false,
  searchQuery: '',
  filters: {
    category: null,
    priceRange: [0, 10000],
    brand: null,
    rating: null,
    sortBy: 'name',
    sortOrder: 'asc',
  },
}

// App Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme })
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', state.theme)
    document.documentElement.setAttribute('data-theme', state.theme)
  }, [state.theme])

  // Set loading state
  const setLoading = (isLoading) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
  }

  // Set error
  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
    toast.error(error)
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Set notification
  const setNotification = (notification) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: notification })
    toast.success(notification)
  }

  // Clear notification
  const clearNotification = () => {
    dispatch({ type: 'CLEAR_NOTIFICATION' })
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    dispatch({ type: 'SET_THEME', payload: newTheme })
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  // Set sidebar state
  const setSidebar = (isOpen) => {
    dispatch({ type: 'SET_SIDEBAR', payload: isOpen })
  }

  // Set search query
  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }

  // Handle global errors
  const handleError = (error) => {
    console.error('Global error:', error)
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred'
    setError(errorMessage)
  }

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    setNotification,
    clearNotification,
    toggleTheme,
    toggleSidebar,
    setSidebar,
    setSearchQuery,
    setFilters,
    clearFilters,
    handleError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
