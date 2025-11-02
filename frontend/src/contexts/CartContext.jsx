import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { cartAPI } from '../services/api'
import toast from '../utils/toast'
import { useAuth } from './AuthContext'

// Cart Context
const CartContext = createContext()

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'CART_SUCCESS':
      return {
        ...state,
        isLoading: false,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemsCount: action.payload.itemsCount || 0,
        error: null,
      }
    case 'CART_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }
    case 'ADD_ITEM_OPTIMISTIC':
      // Optimistically add item to cart immediately
      return {
        ...state,
        items: [...state.items, action.payload],
        itemsCount: state.itemsCount + 1,
        total: state.total + (action.payload.price * action.payload.quantity),
      }
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        itemsCount: state.itemsCount + 1,
        total: state.total + (action.payload.price * action.payload.quantity),
      }
    case 'UPDATE_ITEM_OPTIMISTIC':
      // Optimistically update item quantity immediately
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      )
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        ),
      }
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
        total: state.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        ),
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        itemsCount: Math.max(0, state.itemsCount - 1),
        total: state.items
          .filter(item => item.id !== action.payload)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0),
      }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        itemsCount: 0,
        total: 0,
      }
    default:
      return state
  }
}

// Initial State
const initialState = {
  items: [],
  total: 0,
  itemsCount: 0,
  isLoading: false,
  error: null,
}

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { isAuthenticated } = useAuth();

  // Load or clear cart when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        dispatch({ type: 'CART_LOADING' })
        const cartData = await cartAPI.getCart()
        dispatch({ type: 'CART_SUCCESS', payload: cartData })
      } catch (error) {
        console.error('Failed to load cart:', error)
        dispatch({ type: 'CART_ERROR', payload: error.message })
      }
    }
    if (isAuthenticated) {
      loadCart()
    } else {
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [isAuthenticated])

  // Add item to cart with optimistic update
  const addToCart = async (product, quantity = 1, variant = null) => {
    // Optimistic update - add immediately to UI
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      product_id: product.id,
      quantity: Number(quantity),
      price: variant?.price || product.price,
      product: {
        id: product.id,
        resource_id: product.resource_id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url || '',
        price: product.price,
      },
      variant: variant,
    }

    dispatch({ type: 'ADD_ITEM_OPTIMISTIC', payload: optimisticItem })
    toast.success(`${product.name} added to cart!`)

    try {
      const itemData = {
        product_resource_id: product.resource_id || product.id,
        quantity: Number(quantity),
        variant_id: variant?.id || null,
      }

      const response = await cartAPI.addToCart(itemData)
      
      // Update with real data from server
      dispatch({ type: 'CART_SUCCESS', payload: response })
      return response
    } catch (error) {
      // Rollback optimistic update on error
      dispatch({ type: 'REMOVE_ITEM', payload: optimisticItem.id })
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart'
      dispatch({ type: 'CART_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Update item quantity with optimistic update
  const updateQuantity = async (itemId, quantity) => {
    // Find the item to update
    const item = state.items.find(i => i.id === itemId)
    if (!item) return

    // Store old quantity for rollback
    const oldQuantity = item.quantity

    // Optimistic update - update UI immediately
    dispatch({ 
      type: 'UPDATE_ITEM_OPTIMISTIC', 
      payload: { id: itemId, quantity: Number(quantity) }
    })

    try {
      const response = await cartAPI.updateCartItem(itemId, { quantity: Number(quantity) })
      
      // Update with server response
      dispatch({ type: 'CART_SUCCESS', payload: response })
      return response
    } catch (error) {
      // Rollback on error
      dispatch({ 
        type: 'UPDATE_ITEM_OPTIMISTIC', 
        payload: { id: itemId, quantity: oldQuantity }
      })
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart'
      dispatch({ type: 'CART_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Remove item from cart with optimistic update
  const removeFromCart = async (itemId) => {
    // Find and store the item for potential rollback
    const item = state.items.find(i => i.id === itemId)
    if (!item) return

    // Optimistic update - remove immediately from UI
    dispatch({ type: 'REMOVE_ITEM', payload: itemId })
    toast.success('Item removed from cart!')

    try {
      await cartAPI.removeFromCart(itemId)
      
      // Refresh cart from server to ensure sync
      const cartData = await cartAPI.getCart()
      dispatch({ type: 'CART_SUCCESS', payload: cartData })
    } catch (error) {
      // Rollback - add item back
      dispatch({ type: 'ADD_ITEM', payload: item })
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from cart'
      dispatch({ type: 'CART_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' })
      
      await cartAPI.clearCart()
      
      dispatch({ type: 'CLEAR_CART' })
      toast.success('Cart cleared!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart'
      dispatch({ type: 'CART_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  }

  // Get item count
  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Get total price
  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Check if item is in cart
  const isInCart = (productId, variantId = null) => {
    return state.items.some(item => 
      item.product_id === productId && item.variant_id === variantId
    )
  }

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getTotalPrice,
    isInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
