import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'

const AdminSearchBar = ({ onNavigate }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const debounceTimer = useRef(null)

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (query.trim().length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await adminAPI.search(query.trim(), 5)
        setResults(data)
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search error:', error)
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (type, resourceId) => {
    setIsOpen(false)
    setQuery('')
    setResults(null)

    // Call parent callback if provided (for mobile search)
    if (onNavigate) {
      onNavigate()
    }

    const routes = {
      product: `/admin/products`,
      order: `/admin/orders`,
      user: `/admin/customers`,
      category: `/admin/categories`,
      brand: `/admin/products`, // Brands are managed in products section
    }

    const baseRoute = routes[type]
    if (baseRoute) {
      // Navigate to the list page - you could add filters in the future
      navigate(baseRoute)
    }
  }

  const getResultIcon = (type) => {
    const icons = {
      product: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      order: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      user: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      category: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      brand: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    }
    return icons[type] || icons.product
  }

  const getResultColor = (type) => {
    const colors = {
      product: 'bg-blue-50 text-blue-700 border-blue-200',
      order: 'bg-green-50 text-green-700 border-green-200',
      user: 'bg-purple-50 text-purple-700 border-purple-200',
      category: 'bg-orange-50 text-orange-700 border-orange-200',
      brand: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    }
    return colors[type] || colors.product
  }

  const allResults = results && results.results
    ? [
        ...(results.results.products || []).map((r) => ({ ...r, type: 'product' })),
        ...(results.results.orders || []).map((r) => ({ ...r, type: 'order' })),
        ...(results.results.users || []).map((r) => ({ ...r, type: 'user' })),
        ...(results.results.categories || []).map((r) => ({ ...r, type: 'category' })),
        ...(results.results.brands || []).map((r) => ({ ...r, type: 'brand' })),
      ]
    : []

  const handleKeyDown = (e) => {
    if (!isOpen || allResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < allResults.length) {
          handleNavigate(allResults[selectedIndex].type, allResults[selectedIndex].resource_id)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery('')
        break
    }
  }

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && results && setIsOpen(true)}
          placeholder="Search products, orders, users, categories..."
          className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults(null)
              setIsOpen(false)
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results && results.results && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] overflow-hidden"
        >
          <div className="overflow-y-auto max-h-[600px]">
            {/* Products */}
            {results.results.products && results.results.products.length > 0 && (
              <div className="p-3">
                <div className="flex items-center space-x-2 mb-2 px-2">
                  <div className="p-1.5 rounded bg-blue-100">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Products ({results.totals?.products || 0})
                  </span>
                </div>
                {(results.results.products || []).map((product, idx) => {
                  const globalIdx = idx
                  return (
                    <button
                      key={product.resource_id}
                      onClick={() => handleNavigate('product', product.resource_id)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedIndex === globalIdx
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-gray-500">{product.sku}</span>
                          <span className="text-xs font-semibold text-primary-600">${product.price.toFixed(2)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Orders */}
            {results.results.orders && results.results.orders.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2 px-2">
                  <div className="p-1.5 rounded bg-green-100">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Orders ({results.totals?.orders || 0})
                  </span>
                </div>
                {(results.results.orders || []).map((order, idx) => {
                  const globalIdx = (results.results.products?.length || 0) + idx
                  return (
                    <button
                      key={order.resource_id}
                      onClick={() => handleNavigate('order', order.resource_id)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedIndex === globalIdx
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.customer}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Users */}
            {results.results.users && results.results.users.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2 px-2">
                  <div className="p-1.5 rounded bg-purple-100">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Users ({results.totals?.users || 0})
                  </span>
                </div>
                {(results.results.users || []).map((user, idx) => {
                  const globalIdx =
                    (results.results.products?.length || 0) +
                    (results.results.orders?.length || 0) +
                    idx
                  return (
                    <button
                      key={user.resource_id}
                      onClick={() => handleNavigate('user', user.resource_id)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedIndex === globalIdx
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name || user.last_name
                            ? `${user.first_name} ${user.last_name}`.trim()
                            : user.username || user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        {user.is_admin && (
                          <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-medium">
                            Admin
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Categories */}
            {results.results.categories && results.results.categories.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2 px-2">
                  <div className="p-1.5 rounded bg-orange-100">
                    <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Categories ({results.totals?.categories || 0})
                  </span>
                </div>
                {(results.results.categories || []).map((category, idx) => {
                  const globalIdx =
                    (results.results.products?.length || 0) +
                    (results.results.orders?.length || 0) +
                    (results.results.users?.length || 0) +
                    idx
                  return (
                    <button
                      key={category.resource_id}
                      onClick={() => handleNavigate('category', category.resource_id)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedIndex === globalIdx
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {category.image && (
                        <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{category.slug}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Brands */}
            {results.results.brands && results.results.brands.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2 px-2">
                  <div className="p-1.5 rounded bg-indigo-100">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Brands ({results.totals?.brands || 0})
                  </span>
                </div>
                {(results.results.brands || []).map((brand, idx) => {
                  const globalIdx =
                    (results.results.products?.length || 0) +
                    (results.results.orders?.length || 0) +
                    (results.results.users?.length || 0) +
                    (results.results.categories?.length || 0) +
                    idx
                  return (
                    <button
                      key={brand.resource_id}
                      onClick={() => handleNavigate('brand', brand.resource_id)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedIndex === globalIdx
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {brand.image && (
                        <img src={brand.image} alt={brand.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{brand.slug}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* No Results */}
            {allResults.length === 0 && (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSearchBar

