import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, Shield, ChevronDown, User, Package } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { getUserDisplayName } from '../../../utils/userUtils'
import Avatar from '../../ui/Avatar'

const UserMenuDropdown = ({ scrolled, isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.is_admin || user?.isAdmin

  const userMenuItems = [
    ...(isAdmin ? [{
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
      href: '/admin',
      description: 'Manage your store',
      adminOnly: true
    }] : []),
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      description: 'View and edit your profile'
    },
    {
      icon: Package,
      label: 'Orders',
      href: '/orders',
      description: 'Track your orders'
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      onClose()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return (
      <div className="hidden md:flex items-center space-x-2">
        <Link
          to="/auth/login"
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/auth/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => onClose(!isOpen)}
        className="flex items-center rounded-lg hover:bg-gray-100 transition-colors overflow-hidden"
        animate={{
          padding: scrolled ? '0.25rem' : '0.5rem',
          gap: scrolled ? '0' : '0.75rem',
          marginLeft: scrolled ? '0' : '0',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <motion.div 
          className="relative flex-shrink-0"
          animate={{
            width: scrolled ? 36 : 40,
            height: scrolled ? 36 : 40,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Avatar 
            user={user} 
            size={scrolled ? "sm" : "md"}
            showOnlineStatus={!scrolled}
          />
          {isAdmin && (
            <motion.div 
              className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
              animate={{
                width: scrolled ? 16 : 20,
                height: scrolled ? 16 : 20,
                padding: scrolled ? '0.125rem' : '0.25rem',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Shield className={scrolled ? "w-2.5 h-2.5" : "w-3 h-3"} style={{ color: 'white' }} />
            </motion.div>
          )}
        </motion.div>
        <motion.div 
          className="hidden sm:block text-left flex-1 min-w-0 overflow-hidden"
          animate={{
            opacity: scrolled ? 0 : 1,
            width: scrolled ? 0 : 'auto',
            marginLeft: scrolled ? 0 : '0.75rem',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <p className="text-sm font-medium text-gray-900 truncate">
            {getUserDisplayName(user)}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </motion.div>
        <motion.div
          animate={{
            opacity: scrolled ? 0 : 1,
            width: scrolled ? 0 : 'auto',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Avatar 
                  user={user} 
                  size="lg" 
                  showOnlineStatus={true}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {getUserDisplayName(user)}
                    </p>
                    {user?.is_verified || user?.isVerified ? (
                      <div className="flex items-center gap-1 shrink-0" title="Verified Account">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600 truncate flex-1">{user.email}</p>
                    {user?.is_verified || user?.isVerified ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 shrink-0">
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="px-2 pt-3 pb-2">
                <Link
                  to="/admin"
                  onClick={() => onClose(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors group"
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                  <Shield className="w-4 h-4 ml-auto" />
                </Link>
              </div>
            )}

            <div className="py-1">
              {userMenuItems.filter(item => !item.adminOnly).map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => onClose(false)}
                  className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenuDropdown

