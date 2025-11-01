import React from 'react'
import { motion } from 'framer-motion'
import ProcessingLoader from '../ui/ProcessingLoader'
import ModernSkeleton from '../ui/ModernSkeleton'

const AuthSkeleton = ({ type = 'login' }) => {
  const renderLoginSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <ModernSkeleton.Avatar size="md" className="mx-auto mb-4" />
            </motion.div>
            <ModernSkeleton width="w-3/4" height="h-8" className="mx-auto mb-2 rounded-lg" />
            <ModernSkeleton width="w-1/2" height="h-4" className="mx-auto rounded" />
          </div>

          {/* Form Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
              >
                <ModernSkeleton width="w-1/4" height="h-4" className="mb-2 rounded" />
                <ModernSkeleton width="w-full" height="h-12" className="rounded-lg" />
              </motion.div>
            ))}
          </div>
          
          {/* Button Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="mt-6"
          >
            <ModernSkeleton width="w-full" height="h-12" className="rounded-lg" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )

  const renderRegisterSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <ModernSkeleton.Avatar size="md" className="mx-auto mb-4" />
            <ModernSkeleton width="w-3/4" height="h-8" className="mx-auto mb-2" />
            <ModernSkeleton width="w-1/2" height="h-4" className="mx-auto" />
          </div>

          {/* Form Skeleton */}
          <ModernSkeleton.Form fields={7} />
        </div>
      </motion.div>
    </div>
  )

  const renderOTPSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <ModernSkeleton.Avatar size="lg" className="mx-auto mb-4" />
            </motion.div>
            <ModernSkeleton width="w-3/4" height="h-8" className="mx-auto mb-2 rounded-lg" />
            <ModernSkeleton width="w-1/2" height="h-4" className="mx-auto mb-2 rounded" />
            <ModernSkeleton width="w-1/3" height="h-4" className="mx-auto rounded" />
          </div>

          {/* OTP Input Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mb-6"
          >
            <ModernSkeleton width="w-1/2" height="h-4" className="mx-auto mb-4 rounded" />
            <div className="flex justify-center space-x-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.2 }}
                >
                  <ModernSkeleton width="w-12" height="h-12" className="rounded-lg" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timer Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="text-center mb-6"
          >
            <ModernSkeleton width="w-32" height="h-4" className="mx-auto rounded" />
          </motion.div>

          {/* Verify Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <ModernSkeleton.Button width="w-full" height="h-12" className="mb-4 rounded-lg" />
          </motion.div>

          {/* Resend Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            className="text-center"
          >
            <ModernSkeleton width="w-24" height="h-4" className="mx-auto rounded" />
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.3 }}
            className="text-center mt-6"
          >
            <ModernSkeleton width="w-32" height="h-4" className="mx-auto rounded" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )

  switch (type) {
    case 'login':
      return renderLoginSkeleton()
    case 'register':
      return renderRegisterSkeleton()
    case 'otp':
      return renderOTPSkeleton()
    default:
      return renderLoginSkeleton()
  }
}

export default AuthSkeleton
