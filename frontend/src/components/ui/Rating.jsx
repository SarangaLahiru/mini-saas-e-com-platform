import React from 'react'
import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const Rating = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }
  
  const handleClick = (newRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }
  
  return (
    <div className={clsx('flex items-center space-x-1', className)} {...props}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starRating = index + 1
        const isFilled = starRating <= rating
        const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0
        
        return (
          <motion.button
            key={index}
            className={clsx(
              'text-yellow-400 transition-colors',
              interactive && 'cursor-pointer hover:text-yellow-500',
              !interactive && 'cursor-default'
            )}
            onClick={() => handleClick(starRating)}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
            disabled={!interactive}
          >
            {isFilled ? (
              <StarIcon className={sizes[size]} />
            ) : isHalfFilled ? (
              <div className="relative">
                <StarOutlineIcon className={sizes[size]} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <StarIcon className={sizes[size]} />
                </div>
              </div>
            ) : (
              <StarOutlineIcon className={sizes[size]} />
            )}
          </motion.button>
        )
      })}
      
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

const RatingDisplay = ({ rating, reviewCount, size = 'md', className = '', ...props }) => {
  return (
    <div className={clsx('flex items-center space-x-2', className)} {...props}>
      <Rating rating={rating} size={size} showValue />
      {reviewCount && (
        <span className="text-sm text-gray-500">
          ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  )
}

Rating.Display = RatingDisplay

export default Rating
