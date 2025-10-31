import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react'

const UserProfileCard = ({ 
  user, 
  onEdit, 
  showActions = true,
  size = 'default' // 'small', 'default', 'large'
}) => {
  if (!user) return null

  const sizeClasses = {
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  }

  const avatarSizes = {
    small: 'w-12 h-12',
    default: 'w-16 h-16',
    large: 'w-20 h-20'
  }

  const textSizes = {
    small: {
      name: 'text-lg',
      email: 'text-sm',
      info: 'text-xs'
    },
    default: {
      name: 'text-xl',
      email: 'text-base',
      info: 'text-sm'
    },
    large: {
      name: 'text-2xl',
      email: 'text-lg',
      info: 'text-base'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${sizeClasses[size]} ${
        showActions ? 'hover:shadow-xl' : ''
      } transition-all duration-300`}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`${avatarSizes[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg`}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className={`${avatarSizes[size]} rounded-full object-cover`}
              />
            ) : (
              <User className={`${size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-10 h-10' : 'w-8 h-8'} text-white`} />
            )}
          </div>
          
          {/* Verification Status */}
          <div className="flex justify-center mt-2">
            {user.isVerified ? (
              <div className="flex items-center text-green-600 bg-green-100 rounded-full px-2 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-600 bg-orange-100 rounded-full px-2 py-1">
                <XCircle className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`${textSizes[size].name} font-bold text-gray-900 truncate`}>
                {user.firstName} {user.lastName}
              </h3>
              <p className={`${textSizes[size].email} text-gray-600 truncate`}>
                {user.email}
              </p>
            </div>

            {/* Admin Badge */}
            {user.isAdmin && (
              <div className="flex items-center bg-purple-100 text-purple-800 rounded-full px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Admin</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4 space-y-2">
            {user.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className={textSizes[size].info}>{user.phone}</span>
              </div>
            )}

            {user.address && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className={`${textSizes[size].info} truncate`}>{user.address}</span>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className={textSizes[size].info}>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            {user.lastLoginAt && (
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className={textSizes[size].info}>
                  Last login {new Date(user.lastLoginAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && onEdit && (
          <div className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Edit className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Stats Row (for larger cards) */}
      {size === 'large' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Wishlist</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default UserProfileCard
