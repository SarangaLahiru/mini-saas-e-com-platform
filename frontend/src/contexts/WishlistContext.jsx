import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { wishlistAPI } from '../services/api'
import { useAuth } from './AuthContext'
import toast from '../utils/toast'

const WishlistContext = createContext()

const initialState = { items: [], isLoading: false, error: null }

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'success':
      return { ...state, isLoading: false, items: action.payload || [] }
    case 'error':
      return { ...state, isLoading: false, error: action.payload }
    case 'add_optimistic':
      // Check if already exists to avoid duplicates
      const itemExists = state.items.some(i => i.product_id === action.payload.product_id)
      if (itemExists) return state
      return { ...state, items: [...state.items, action.payload] }
    case 'remove_optimistic':
      return { ...state, items: state.items.filter(i => i.product_id !== action.payload) }
    default:
      return state
  }
}

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { isAuthenticated } = useAuth()

  // Load wishlist on authentication change
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated) {
        dispatch({ type: 'success', payload: [] })
        return
      }

      try {
        dispatch({ type: 'loading' })
        const data = await wishlistAPI.getWishlist()
        dispatch({ type: 'success', payload: data })
      } catch (e) {
        console.error('Failed to load wishlist:', e)
        dispatch({ type: 'error', payload: e.message })
        // Don't show error toast on initial load
      }
    }

    loadWishlist()
  }, [isAuthenticated])

  const addToWishlist = async (productId) => {
    console.log('🎯 addToWishlist called with productId:', productId)
    try {
      // Optimistic update
      dispatch({ 
        type: 'add_optimistic', 
        payload: { 
          id: `temp-${productId}`,
          product_id: productId,
          product: {}
        } 
      })
      console.log('📝 Optimistic update dispatched')

      // API call
      console.log('📡 Calling API: POST /wishlist with product_id:', productId)
      const result = await wishlistAPI.addToWishlist(productId)
      console.log('✅ API Response:', result)
      toast.success('Added to wishlist')

      // Refresh wishlist to get full product details
      console.log('🔄 Refreshing wishlist data...')
      const data = await wishlistAPI.getWishlist()
      console.log('📚 Wishlist refreshed:', data)
      dispatch({ type: 'success', payload: data })
    } catch (e) {
      console.error('❌ Error adding to wishlist:', e)
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to add to wishlist')
      // Revert optimistic update by refreshing
      try {
        const data = await wishlistAPI.getWishlist()
        dispatch({ type: 'success', payload: data })
      } catch {}
    }
  }

  const removeFromWishlist = async (productId) => {
    console.log('🎯 removeFromWishlist called with productId:', productId)
    try {
      // Optimistic update
      dispatch({ type: 'remove_optimistic', payload: productId })
      console.log('📝 Optimistic update dispatched')

      // API call
      console.log('📡 Calling API: DELETE /wishlist/' + productId)
      const result = await wishlistAPI.removeFromWishlist(productId)
      console.log('✅ API Response:', result)
      toast.success('Removed from wishlist')

      // Refresh wishlist
      console.log('🔄 Refreshing wishlist data...')
      const data = await wishlistAPI.getWishlist()
      console.log('📚 Wishlist refreshed:', data)
      dispatch({ type: 'success', payload: data })
    } catch (e) {
      console.error('❌ Error removing from wishlist:', e)
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to remove from wishlist')
      // Revert optimistic update by refreshing
      try {
        const data = await wishlistAPI.getWishlist()
        dispatch({ type: 'success', payload: data })
      } catch {}
    }
  }

  const value = {
    ...state,
    wishlistItems: state.items,
    itemsCount: state.items.length,
    addToWishlist,
    removeFromWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
