import React from 'react'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'

const Wishlist = () => {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Wishlist</h1>
        <p className="text-gray-500 mb-8">You haven't added any items to your wishlist yet.</p>
        <Link to="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id || item.product_id} className="overflow-hidden group">
            <Link to={`/products/${item.product?.resource_id || item.product?.id || item.product_id}`}>
              <div className="relative h-56 bg-gray-100">
                <img
                  src={item.product?.image || item.image || 'https://via.placeholder.com/300'}
                  alt={item.product?.name || 'Product'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(item.product?.id || item.product_id) }}
                    className="px-2.5 py-1.5 text-xs bg-white/90 hover:bg-white rounded-lg text-gray-700 shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/products/${item.product?.resource_id || item.product?.id || item.product_id}`} className="block">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.product?.name || 'Product'}
                </h3>
              </Link>
              {item.product?.price && (
                <p className="text-blue-600 font-bold mt-1">${item.product.price}</p>
              )}
              <div className="mt-4">
                <Button 
                  className="w-full"
                  onClick={async () => {
                    const product = item.product || item
                    await addToCart(product, 1, null)
                    await removeFromWishlist(product.id || item.product_id)
                  }}
                >
                  Move to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Wishlist
