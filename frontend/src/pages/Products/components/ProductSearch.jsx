import React from 'react'
import { motion } from 'framer-motion'
import SearchBar from '../../../components/ui/SearchBar'

const ProductSearch = () => {
  const handleSearch = (query) => {
    // Implement search functionality
  }

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search products..."
        className="max-w-md"
      />
    </motion.div>
  )
}

export default ProductSearch
