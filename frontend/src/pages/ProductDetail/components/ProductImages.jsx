import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import { getImageUrl as convertImageUrl } from '../../../utils/imageUrl'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  MagnifyingGlassPlusIcon 
} from '@heroicons/react/24/outline'

const ProductImages = ({ productId }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set())
  
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsAPI.getProduct(productId),
  })

  const images = product?.images || []
  const hasImages = images.length > 0

  // Fallback to placeholder if no images
  const displayImages = hasImages 
    ? images 
    : [{ url: 'https://via.placeholder.com/800x800?text=No+Image', alt: 'No image available' }]

  const currentImage = displayImages[selectedImage]

  const handlePrevImage = (e) => {
    e?.stopPropagation()
    setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e) => {
    e?.stopPropagation()
    setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e) => {
    if (!isLightboxOpen) return
    if (e.key === 'ArrowLeft') handlePrevImage()
    if (e.key === 'ArrowRight') handleNextImage()
    if (e.key === 'Escape') setIsLightboxOpen(false)
  }

  const handleImageError = (imageUrl) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl))
  }

  const getImageUrl = (image) => {
    if (imageLoadErrors.has(image.url)) {
      return 'https://via.placeholder.com/800x800/e5e7eb/6b7280?text=Image+Not+Available'
    }
    return convertImageUrl(image.url)
  }

  React.useEffect(() => {
    if (isLightboxOpen) {
      // Save current scroll position immediately
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      const scrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft
      
      // Force immediate scroll to top
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.documentElement.scrollLeft = 0
      document.body.scrollTop = 0
      document.body.scrollLeft = 0
      
      // Use requestAnimationFrame to ensure scroll completes
      requestAnimationFrame(() => {
        // Prevent body scroll and lock position
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.left = `-${scrollX}px`
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        
        // Also lock html element
        document.documentElement.style.overflow = 'hidden'
        document.documentElement.style.position = 'fixed'
        document.documentElement.style.top = `-${scrollY}px`
        document.documentElement.style.left = `-${scrollX}px`
        document.documentElement.style.width = '100%'
        document.documentElement.style.height = '100%'
        
        // Force scroll to top again after locking
        window.scrollTo(0, 0)
      })
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        
        // Restore scroll position
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.width = ''
        document.body.style.height = ''
        
        document.documentElement.style.overflow = ''
        document.documentElement.style.position = ''
        document.documentElement.style.top = ''
        document.documentElement.style.left = ''
        document.documentElement.style.width = ''
        document.documentElement.style.height = ''
        
        // Restore scroll position after a brief delay
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY)
        })
      }
    }
  }, [isLightboxOpen, selectedImage])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Main image skeleton */}
        <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-200 rounded-xl animate-pulse" />
        {/* Thumbnails skeleton */}
        <div className="grid grid-cols-4 gap-2 lg:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 lg:space-y-4">
          {/* Main Image Container - Fixed Height Standard */}
          <motion.div 
            className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-50 rounded-xl overflow-hidden group cursor-zoom-in border border-gray-200"
            onClick={() => {
              // First scroll to top, then open lightbox
              setIsScrolling(true)
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
              
              // Wait for scroll to complete, then open lightbox
              setTimeout(() => {
                setIsScrolling(false)
                setIsLightboxOpen(true)
              }, 500) // Wait for smooth scroll to complete
            }}
          >
            {/* Image with consistent sizing */}
            <img
              src={getImageUrl(currentImage)}
              alt={currentImage?.alt || `Product image ${selectedImage + 1}`}
              className="w-full h-full object-contain p-4 lg:p-8 transition-transform duration-300 group-hover:scale-105"
              onError={() => handleImageError(currentImage?.url)}
              loading="eager"
            />
            
            {/* Zoom Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
                <MagnifyingGlassPlusIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-800" />
              </div>
            </div>

            {/* Navigation Arrows - Desktop Only */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevImage()
                  }}
                  className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/75 text-white text-xs lg:text-sm rounded-full font-medium backdrop-blur-sm">
                {selectedImage + 1} / {displayImages.length}
              </div>
            )}

            {/* Primary Badge */}
            {currentImage?.is_primary && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                Main
              </div>
            )}
          </motion.div>

          {/* Thumbnail Grid - Consistent Sizing */}
          {displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 lg:gap-3">
              {displayImages.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  {/* Thumbnail Image - Consistent Sizing */}
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                    onError={() => handleImageError(image?.url)}
                    loading="lazy"
                  />
                  
                  {/* Selected Indicator */}
                  {selectedImage === index && (
                    <motion.div 
                      layoutId="selected-indicator"
                      className="absolute inset-0 bg-blue-500/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Thumbnail Number */}
                  <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                    selectedImage === index 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Image Info Text */}
          {currentImage?.alt && (
            <p className="text-xs lg:text-sm text-gray-500 text-center italic">
              {currentImage.alt}
            </p>
          )}
        </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[9999] bg-black"
            onClick={() => setIsLightboxOpen(false)}
            style={{ 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              position: 'fixed',
              overflow: 'hidden',
              margin: 0,
              padding: 0,
              height: '100vh',
              width: '100vw',
              transform: 'translate(0, 0)',
              zIndex: 9999
            }}
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.1 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsLightboxOpen(false)
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm cursor-pointer touch-manipulation"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>

            {/* Image Counter Badge */}
            {displayImages.length > 1 && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-30 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 text-white text-xs sm:text-sm rounded-full font-medium backdrop-blur-sm pointer-events-none"
              >
                {selectedImage + 1} / {displayImages.length}
              </motion.div>
            )}

            {/* Main Image Container - Centered */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                height: '100vh',
                width: '100vw',
                margin: 0,
                padding: 0
              }}
            >
              {currentImage && !imageLoadErrors.has(currentImage?.url) ? (
                <motion.img
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={getImageUrl(currentImage)}
                  alt={currentImage?.alt || `Product image ${selectedImage + 1}`}
                  className="object-contain select-none pointer-events-auto"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '95vw',
                    maxHeight: '75vh',
                    margin: 0
                  }}
                  onError={() => handleImageError(currentImage?.url)}
                  draggable={false}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-gray-400 pointer-events-none"
                  style={{
                    width: '90vw',
                    height: '75vh',
                    maxWidth: '600px'
                  }}
                >
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-lg font-medium">No Image Available</p>
                  <p className="text-sm mt-2">This image could not be loaded</p>
                </motion.div>
              )}
            </div>

            {/* Navigation Arrows - Larger for Lightbox */}
            {displayImages.length > 1 && (
              <>
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevImage()
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm cursor-pointer touch-manipulation"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.button>
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm cursor-pointer touch-manipulation"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.button>
              </>
            )}

            {/* Thumbnail Strip - Bottom */}
            {displayImages.length > 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.25 }}
                className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2 p-2 sm:p-3 bg-black/60 rounded-xl backdrop-blur-md max-w-[95vw] sm:max-w-[90vw] overflow-x-auto scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
              >
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(index)
                    }}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer touch-manipulation ${
                      selectedImage === index
                        ? 'border-white ring-2 ring-white/50 shadow-lg'
                        : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain bg-white/10 p-0.5 sm:p-1"
                      onError={() => handleImageError(image?.url)}
                      draggable={false}
                    />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Keyboard Hint - Desktop Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:block absolute bottom-20 right-4 z-30 px-4 py-2 bg-white/10 text-white/80 text-xs rounded-full backdrop-blur-sm pointer-events-none"
            >
              Use ← → arrow keys or ESC to close
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProductImages
