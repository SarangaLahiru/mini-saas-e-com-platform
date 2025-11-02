import React from 'react'
import { motion } from 'framer-motion'
import { getUserInitials } from '../../utils/userUtils'
import { getImageUrl } from '../../utils/imageUrl'

const Avatar = ({ 
  user, 
  src,
  name,
  size = 'md', 
  className = '',
  showOnlineStatus = false,
  onClick = null 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  }

  // Support both object format (user) and simple props (src, name)
  // Process avatar URL to handle relative paths
  const rawAvatarUrl = user?.avatar || src
  const avatarUrl = rawAvatarUrl ? getImageUrl(rawAvatarUrl) : null
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : name || ''

  const [imageError, setImageError] = React.useState(false)

  React.useEffect(() => {
    // Reset error state when avatarUrl changes
    setImageError(false)
  }, [avatarUrl])

  const getInitials = () => {
    if (user) return getUserInitials(user)
    
    // Extract initials from name string
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name[0].toUpperCase()
    }
    return 'U'
  }

  const initials = getInitials()
  const showImage = avatarUrl && !imageError

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative ${sizeClasses[size]} ${className}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg">
        {showImage ? (
          <img
            key={avatarUrl} // Force re-render when avatar URL changes
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold shadow-sm">
            {initials}
          </div>
        )}
      </div>
      
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </motion.div>
  )
}

export default Avatar
