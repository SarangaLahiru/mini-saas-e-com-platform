import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchAutocomplete from './SearchAutocomplete'

const MobileSearchBar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden border-t border-gray-200 bg-white"
        >
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchAutocomplete 
                  onSubmit={(q) => {
                    navigate(`/products?search=${encodeURIComponent(q)}`)
                    onClose()
                  }} 
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileSearchBar

