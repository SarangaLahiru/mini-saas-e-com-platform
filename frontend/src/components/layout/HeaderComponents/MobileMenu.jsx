import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import SearchAutocomplete from './SearchAutocomplete'

const MobileMenu = ({ isOpen, onClose, user, onLogout }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const navigate = useNavigate()
  const isAdmin = user?.is_admin || user?.isAdmin

  const handleClose = () => {
    setIsAccountOpen(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200 py-4"
        >
          <div className="px-4 pb-3">
            <SearchAutocomplete 
              onSubmit={(q) => { 
                handleClose()
                navigate(`/products?search=${encodeURIComponent(q)}`) 
              }} 
            />
          </div>

          <div className="space-y-2">
            <Link
              to="/products"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleClose}
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleClose}
            >
              Categories
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleClose}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleClose}
            >
              Contact
            </Link>
          </div>

          <div className="mt-2">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-gray-800 font-medium hover:bg-gray-100"
              onClick={() => setIsAccountOpen(!isAccountOpen)}
            >
              <span>Account</span>
              <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/>
              </svg>
            </button>
            <AnimatePresence initial={false}>
              {isAccountOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-2 space-y-2"
                >
                  {!user ? (
                    <>
                      <Link
                        to="/auth/login"
                        onClick={() => { handleClose(); setIsAccountOpen(false) }}
                        className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/auth/register"
                        onClick={() => { handleClose(); setIsAccountOpen(false) }}
                        className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => { handleClose(); setIsAccountOpen(false) }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md mb-2"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => { handleClose(); setIsAccountOpen(false) }}
                        className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => { handleClose(); setIsAccountOpen(false); onLogout() }}
                        className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu

