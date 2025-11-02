import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsAPI, productsAPI } from '../../../services/api'
import { useAuth } from '../../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  StarIcon, 
  ChatBubbleLeftRightIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import Button from '../../../components/ui/Button'
import toast from '../../../utils/toast'
import { formatDistanceToNow } from 'date-fns'
import { getImageUrl } from '../../../utils/imageUrl'

// Avatar component with image or initials fallback
const Avatar = ({ firstName = '', lastName = '', src, size = 'md', className = '' }) => {
  const [imageError, setImageError] = React.useState(false)
  const initials = `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'U'
  const sizeMap = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' }
  const pickedSize = sizeMap[size] || sizeMap.md

  // Get proper image URL using utility
  const url = src ? getImageUrl(src) : null

  React.useEffect(() => {
    // Reset error state when src changes
    setImageError(false)
  }, [src])

  if (url && !imageError) {
    return (
      <div className="relative">
        <img
          src={url}
          alt={`${firstName} ${lastName}`.trim() || 'User avatar'}
          className={`rounded-full object-cover border-2 border-white shadow-md ${pickedSize} ${className}`}
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md ${pickedSize} ${className}`}
      aria-label={initials}
    >
      {initials}
    </div>
  )
}

const ProductReviews = ({ productId }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('recent') // 'recent' or 'rating'

  // Fetch product to get numeric ID
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsAPI.getProduct(productId),
    enabled: !!productId,
  })

  const numericProductId = product?.id

  // Fetch reviews using numeric product ID
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', numericProductId, page],
    queryFn: () => reviewsAPI.getProductReviews(numericProductId, { page, limit: 10 }),
    enabled: !!numericProductId,
  })

  const reviews = reviewsData?.reviews || []
  const total = reviewsData?.total || 0
  const averageRating = reviewsData?.average_rating || 0
  const ratingCounts = reviewsData?.rating_counts || {}

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: reviewsAPI.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', numericProductId])
      toast.success('Review posted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post review')
    },
  })

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: reviewsAPI.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', numericProductId])
      toast.success('Review deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    },
  })

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: reviewsAPI.createReply,
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', numericProductId])
      toast.success('Reply posted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post reply')
    },
  })

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Delete your review?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">·</span>
            <span className="text-gray-600">{total} {total === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Add Review Form (YouTube Style) */}
      {user && numericProductId && (
        <div className="pb-6 border-b">
          <ReviewForm
            productId={numericProductId}
            user={user}
            onSubmit={(data) => createReviewMutation.mutate(data)}
            isSubmitting={createReviewMutation.isPending}
          />
        </div>
      )}

      {!user && (
        <div className="py-4 px-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700">
            <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>{' '}
            to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUser={user}
              onDelete={handleDeleteReview}
              onReply={(data) => createReplyMutation.mutate(data)}
              isReplySubmitting={createReplyMutation.isPending}
            />
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">No reviews yet</p>
            <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="secondary"
            size="sm"
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-gray-700 flex items-center">
            Page {page} of {Math.ceil(total / 10)}
          </span>
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            variant="secondary"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

// YouTube-Style Review Form
const ReviewForm = ({ productId, user, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error('Please write a review')
      return
    }
    onSubmit({
      product_id: productId,
      rating,
      comment: comment.trim(),
    })
    setComment('')
    setRating(5)
    setIsFocused(false)
  }

  const handleCancel = () => {
    setComment('')
    setRating(5)
    setIsFocused(false)
  }

  return (
    <div className="flex gap-3">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          firstName={user?.first_name}
          lastName={user?.last_name}
          src={user?.avatar || user?.avatar_url || user?.profile_image}
          size="md"
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="space-y-3">
          {/* Star Rating - Shows when focused or has content */}
          <AnimatePresence>
            {(isFocused || comment) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-medium text-gray-700">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <StarIconSolid
                        className={`w-6 h-6 transition-colors ${
                          value <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none transition-colors"
            placeholder="Add a review..."
            rows={isFocused ? 4 : 1}
            style={{ outline: 'none' }}
          />

          {/* Action Buttons - Show when focused or has content */}
          <AnimatePresence>
            {(isFocused || comment) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-end gap-2"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!comment.trim() || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Review
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  )
}

// Review Item Component (YouTube Style)
const ReviewItem = React.forwardRef(({ review, currentUser, onDelete, onReply, isReplySubmitting }, ref) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [replyText, setReplyText] = useState('')

  const isOwner = currentUser && currentUser.id === review.user_id
  const hasReplies = review.replies && review.replies.length > 0

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (!replyText.trim()) {
      toast.error('Please write a reply')
      return
    }
    onReply({
      review_id: review.id,
      comment: replyText.trim(),
    })
    setReplyText('')
    setShowReplyForm(false)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3"
    >
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          firstName={review.user.first_name}
          lastName={review.user.last_name}
          src={review.user.avatar || review.user.avatar_url || review.user.profile_image}
          size="md"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">
                {review.user.first_name} {review.user.last_name}
              </span>
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
              {review.is_verified_purchase && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Verified Purchase
                    </span>
                  )}
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Delete Button */}
          {isOwner && (
            <button
              onClick={() => onDelete(review.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Delete review"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Comment Text */}
        <p className="text-gray-800 mt-2 whitespace-pre-wrap break-words">
          {review.comment}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-3">
          {currentUser && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Reply
            </button>
          )}
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && currentUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar
                    firstName={currentUser?.first_name}
                    lastName={currentUser?.last_name}
                    src={currentUser?.avatar || currentUser?.avatar_url || currentUser?.profile_image}
                    size="sm"
                  />
                </div>
                <form onSubmit={handleReplySubmit} className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none text-sm"
                    placeholder="Add a reply..."
                    rows={2}
                    autoFocus
                    style={{ outline: 'none' }}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false)
                        setReplyText('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!replyText.trim() || isReplySubmitting}
                      isLoading={isReplySubmitting}
                    >
                      Reply
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies */}
        {hasReplies && (
          <div className="mt-4">
            {/* Toggle Replies Button */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-3"
            >
              {showReplies ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
              {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
            </button>

            {/* Replies List */}
            <AnimatePresence>
              {showReplies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Avatar
                          firstName={reply.user.first_name}
                          lastName={reply.user.last_name}
                          src={reply.user.avatar || reply.user.avatar_url || reply.user.profile_image}
                          size="sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">
                            {reply.user.first_name} {reply.user.last_name}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap break-words">
                          {reply.comment}
                        </p>
                      </div>
            </div>
          ))}
                </motion.div>
              )}
            </AnimatePresence>
        </div>
        )}
      </div>
    </motion.div>
  )
})

ReviewItem.displayName = 'ReviewItem'

export default ProductReviews
