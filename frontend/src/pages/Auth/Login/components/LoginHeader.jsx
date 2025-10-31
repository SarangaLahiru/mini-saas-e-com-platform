import React from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <User className="w-8 h-8 text-white" />
      </motion.div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-gray-600">
        Sign in to continue your journey
      </p>
    </div>
  )
}

export default LoginHeader
