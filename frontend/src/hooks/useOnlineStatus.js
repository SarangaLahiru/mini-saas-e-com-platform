import { useState, useEffect } from 'react'

/**
 * Hook to detect online/offline status
 * @returns {Object} { isOnline, wasOffline }
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Keep wasOffline true temporarily to show "back online" message
      setWasOffline(true)
      // Reset after showing the message
      setTimeout(() => {
        setWasOffline(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    if (!navigator.onLine) {
      setWasOffline(true)
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}

