import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Package, Folder, Tag, Image as ImageIcon } from 'lucide-react'
import { productsAPI } from '../../../services/api'
import { getImageUrl } from '../../../utils/imageUrl'

const SearchAutocomplete = ({ onSubmit }) => {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState({ type: null, index: -1 })
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)
  const controllerRef = useRef(null)

  const getTotalItems = () => {
    if (!results?.results) return 0
    return (results.results.products?.length || 0) + 
           (results.results.categories?.length || 0) + 
           (results.results.brands?.length || 0)
  }

  const getItemAtGlobalIndex = (globalIdx) => {
    if (!results?.results) return null
    const products = results.results.products || []
    const categories = results.results.categories || []
    const brands = results.results.brands || []
    
    if (globalIdx < products.length) {
      return { type: 'product', item: products[globalIdx], index: globalIdx }
    }
    const categoryIdx = globalIdx - products.length
    if (categoryIdx < categories.length) {
      return { type: 'category', item: categories[categoryIdx], index: categoryIdx }
    }
    const brandIdx = globalIdx - products.length - categories.length
    if (brandIdx < brands.length) {
      return { type: 'brand', item: brands[brandIdx], index: brandIdx }
    }
    return null
  }

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    
    if (q.length < 2) {
      setResults(null)
      setOpen(false)
      return
    }

    const controller = new AbortController()
    controllerRef.current = controller

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await productsAPI.search(q)
        if (!controller.signal.aborted) {
          setResults(data)
          setOpen(true)
          setHighlight({ type: null, index: -1 })
        }
      } catch (error) {
        if (!controller.signal.aborted && error.name !== 'AbortError') {
          console.error('Search failed:', error)
          setResults(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [q])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    const totalItems = getTotalItems()
    if (totalItems === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(prev => {
        const nextIndex = (prev.index + 1) % totalItems
        const item = getItemAtGlobalIndex(nextIndex)
        return { type: item?.type, index: nextIndex }
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(prev => {
        const nextIndex = (prev.index - 1 + totalItems) % totalItems
        const item = getItemAtGlobalIndex(nextIndex)
        return { type: item?.type, index: nextIndex }
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = getItemAtGlobalIndex(highlight.index)
      if (item) {
        handleItemClick(item.type, item.item)
      } else if (q.trim()) {
        onSubmit?.(q.trim())
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleItemClick = (type, item) => {
    if (type === 'product') {
      navigate(`/products/${item.resource_id || item.slug}`)
    } else if (type === 'category') {
      navigate(`/categories/${item.slug}`)
    } else if (type === 'brand') {
      navigate(`/products?brand=${item.slug}`)
    }
    setOpen(false)
  }

  return (
    <div className="relative w-full" ref={boxRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { if (results?.results) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder="Search products, categories, brands..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {loading && (
              <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            )}

            {!loading && results?.results && (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {results.results.products && results.results.products.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Products {results.totals?.products > 0 && `(${results.totals.products})`}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {results.results.products.map((item, idx) => (
                          <li key={item.resource_id || idx}>
                            <button
                              onClick={() => handleItemClick('product', item)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                highlight.type === 'product' && highlight.index === idx ? 'bg-blue-50' : ''
                              }`}
                              onMouseEnter={() => setHighlight({ type: 'product', index: idx })}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                {item.image ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.brand && `${item.brand} • `}${item.price ? `$${item.price.toFixed(2)}` : ''}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.results.categories && results.results.categories.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Categories {results.totals?.categories > 0 && `(${results.totals.categories})`}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {results.results.categories.map((item, idx) => (
                          <li key={item.resource_id || item.slug || idx}>
                            <button
                              onClick={() => handleItemClick('category', item)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                highlight.type === 'category' && highlight.index === idx ? 'bg-blue-50' : ''
                              }`}
                              onMouseEnter={() => setHighlight({ type: 'category', index: idx })}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                {item.image ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Folder className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Category</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.results.brands && results.results.brands.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Brands {results.totals?.brands > 0 && `(${results.totals.brands})`}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {results.results.brands.map((item, idx) => (
                          <li key={item.resource_id || item.slug || idx}>
                            <button
                              onClick={() => handleItemClick('brand', item)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                highlight.type === 'brand' && highlight.index === idx ? 'bg-blue-50' : ''
                              }`}
                              onMouseEnter={() => setHighlight({ type: 'brand', index: idx })}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Brand</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {(results.totals?.products > 0 || results.totals?.categories > 0 || results.totals?.brands > 0) && (
                  <button
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-medium text-blue-600 hover:from-blue-100 hover:to-indigo-100 border-t border-gray-200 transition-colors"
                    onClick={() => { onSubmit?.(q.trim()); setOpen(false) }}
                  >
                    View all results for "{q}"
                  </button>
                )}
              </>
            )}

            {!loading && results?.results && 
             (!results.results.products || results.results.products.length === 0) &&
             (!results.results.categories || results.results.categories.length === 0) &&
             (!results.results.brands || results.results.brands.length === 0) && (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
                <p className="text-xs text-gray-500 mb-4">Try different keywords or check your spelling.</p>
                <button
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => { onSubmit?.(q.trim()); setOpen(false) }}
                >
                  Search for "{q}" anyway
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchAutocomplete

