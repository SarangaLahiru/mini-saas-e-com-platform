import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { productsAPI } from '../../../services/api'
import { useCart } from '../../../contexts/CartContext'
import { useWishlist } from '../../../contexts/WishlistContext'
import { useAuth } from '../../../contexts/AuthContext'
import { formatPrice } from '../../../utils/format'
import { 
  HeartIcon,
  ShoppingCartIcon, 
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import toast from '../../../utils/toast'

const ProductInfo = ({ productId }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()
  
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsAPI.getProduct(productId),
  })

  const isInWishlist = React.useMemo(() => 
    wishlistItems.some(item => item.product_id === product?.id),
    [wishlistItems, product?.id]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    )
  }

  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const hasVariants = product.variants && product.variants.length > 0

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      navigate('/auth/login')
      return
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart(product, quantity, selectedVariant)
      toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`)
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist')
      navigate('/auth/login')
      return
    }

    setIsWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product.id)
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const handleQuantityChange = (value) => {
    const newQty = Math.max(1, Math.min(product.stock, value))
    setQuantity(newQty)
  }

  return (
    <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <button onClick={() => navigate('/')} className="hover:text-gray-700">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-gray-700">Products</button>
          {product.category && (
            <>
              <span>/</span>
              <button 
                onClick={() => navigate(`/categories/${product.category.slug}`)} 
                className="hover:text-gray-700"
              >
                {product.category.name}
              </button>
            </>
          )}
        </div>

        {/* Product Title */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">
              {product.name}
            </h1>
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist ? (
                <HeartSolidIcon className="w-7 h-7 text-red-500" />
              ) : (
                <HeartIcon className="w-7 h-7 text-gray-600" />
              )}
            </button>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {product.is_featured && (
              <Badge variant="primary">Featured</Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="sale">-{discountPercentage}% OFF</Badge>
            )}
            {product.is_new && (
              <Badge variant="success">New</Badge>
            )}
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating */}
        {product.average_rating > 0 && (
          <div className="flex items-center space-x-3 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.average_rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {product.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({product.total_reviews || 0} {product.total_reviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-2xl text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <p className="text-sm text-green-600 font-medium">
              You save {formatPrice(product.compare_price - product.price)} ({discountPercentage}%)
            </p>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-3">
          {product.stock > 0 ? (
            <>
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-green-600">In Stock</span>
              <span className="text-sm text-gray-500">
                ({product.stock} {product.stock === 1 ? 'unit' : 'units'} available)
              </span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-6 h-6 text-red-600" />
              <span className="text-lg font-semibold text-red-600">Out of Stock</span>
            </>
          )}
        </div>

        {/* Variants */}
        {hasVariants && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Select Variant:</label>
            <div className="grid grid-cols-2 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    selectedVariant?.id === variant.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{variant.name}</span>
                    <span className="text-xs">{formatPrice(variant.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Quantity:</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-200 rounded-lg">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-4 py-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center font-semibold text-lg border-0 focus:outline-none"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="px-4 py-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            {product.stock > 0 && quantity === product.stock && (
              <span className="text-sm text-orange-600">Maximum quantity reached</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          loading={isAddingToCart}
          disabled={product.stock === 0 || isAddingToCart}
        >
          <ShoppingCartIcon className="w-6 h-6 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 gap-3 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <TruckIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>Free shipping on orders over $100</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ArrowPathIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>30-day return policy</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>1-year warranty included</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.sku && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">SKU</span>
                <span className="text-gray-900">{product.sku}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">Brand</span>
                <span className="text-gray-900">{product.brand}</span>
              </div>
            )}
            {product.model && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">Model</span>
                <span className="text-gray-900">{product.model}</span>
              </div>
            )}
            {product.weight && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">Weight</span>
                <span className="text-gray-900">{product.weight}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">Dimensions</span>
                <span className="text-gray-900">{product.dimensions}</span>
              </div>
            )}
            {product.category && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">Category</span>
                <span className="text-gray-900">{product.category.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

export default ProductInfo
