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
import Card from '../../../components/ui/Card'

const ProductImages = ({ productId }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
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
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen, selectedImage])

  if (isLoading) {
    return (
      <Card className="p-4 lg:p-6">
        <div className="space-y-4">
          {/* Main image skeleton */}
          <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          {/* Thumbnails skeleton */}
          <div className="grid grid-cols-4 gap-2 lg:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-4 lg:p-6 lg:sticky lg:top-24 h-fit">
        <div className="space-y-3 lg:space-y-4">
          {/* Main Image Container - Fixed Height Standard */}
          <motion.div 
            className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-50 rounded-xl overflow-hidden group cursor-zoom-in border border-gray-200"
            onClick={() => setIsLightboxOpen(true)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
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
                  className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
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
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
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
      </Card>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 lg:p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 lg:top-6 lg:right-6 p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm z-10"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </motion.button>

            {/* Image Counter Badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 lg:top-6 px-4 py-2 lg:px-6 lg:py-3 bg-white/10 text-white text-sm lg:text-lg rounded-full font-medium backdrop-blur-sm"
            >
              {selectedImage + 1} / {displayImages.length}
            </motion.div>

            {/* Main Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Image - Consistent Sizing */}
              <img
                src={getImageUrl(currentImage)}
                alt={currentImage?.alt || `Product image ${selectedImage + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={() => handleImageError(currentImage?.url)}
              />
            </motion.div>

            {/* Navigation Arrows - Larger for Lightbox */}
            {displayImages.length > 1 && (
              <>
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevImage()
                  }}
                  className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 p-3 lg:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </motion.button>
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 p-3 lg:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </motion.button>
              </>
            )}

            {/* Thumbnail Strip - Bottom */}
            {displayImages.length > 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 lg:bottom-6 flex gap-2 lg:gap-3 p-2 lg:p-3 bg-black/50 rounded-xl backdrop-blur-sm max-w-full overflow-x-auto scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
              >
                {displayImages.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-14 h-14 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-white ring-2 ring-white/50 shadow-lg scale-110'
                        : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                    }`}
                    whileHover={{ scale: selectedImage === index ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain bg-white/10 p-1"
                      onError={() => handleImageError(image?.url)}
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Keyboard Hint - Desktop Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:block absolute bottom-6 right-6 text-white/60 text-sm"
            >
              Use ← → arrow keys or ESC
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProductImages
