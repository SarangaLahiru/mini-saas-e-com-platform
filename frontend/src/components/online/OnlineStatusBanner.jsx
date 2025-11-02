import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react'

const OnlineStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)
  const [hasBeenOffline, setHasBeenOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(true)
      // Hide banner after 3 seconds
      setTimeout(() => {
        setShowBanner(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
      setHasBeenOffline(true)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show banner if already offline on mount
    if (!navigator.onLine) {
      setShowBanner(true)
      setHasBeenOffline(true)
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[10000] shadow-lg"
        >
          <div
            className={`${
              isOnline
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            } shadow-lg`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-3 py-3 min-h-[44px]">
                {isOnline ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-5 h-5" />
                      <p className="font-medium text-sm sm:text-base">
                        {hasBeenOffline
                          ? 'Connection restored. You\'re back online!'
                          : 'You\'re online'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <WifiOff className="w-5 h-5" />
                      <p className="font-medium text-sm sm:text-base">
                        You're offline. Check your connection.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OnlineStatusBanner

