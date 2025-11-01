import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import ProcessingLoader from '../../components/ui/ProcessingLoader'

const GoogleCallback = () => {
  const navigate = useNavigate()
  const { googleAuth } = useAuth()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Authenticating with Google...')
  const [subMessage, setSubMessage] = useState('Please wait while we verify your account')

  useEffect(() => {
    // Prevent body scroll when loading overlay is shown
    document.body.style.overflow = 'hidden'
    
    // Cleanup function to remove flag and restore scroll if component unmounts
    return () => {
      document.body.style.overflow = ''
      sessionStorage.removeItem('google_auth_redirecting')
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (!code) {
          throw new Error('Missing authorization code')
        }
        
        setMessage('Connecting to Google...')
        setSubMessage('Verifying your credentials')
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
        const res = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || err.error || 'Google authentication failed')
        }
        
        const data = await res.json()
        
        setMessage('Completing sign in...')
        setSubMessage('Setting up your account')
        
        await googleAuth(data)
        
        // Determine redirect path
        const isAdmin = data?.user?.isAdmin || data?.user?.is_admin
        const redirectPath = isAdmin ? '/admin' : '/'
        
        setMessage('Success!')
        setSubMessage('Loading your dashboard...')
        
        // Mark that we're redirecting from Google auth to prevent skeleton flash
        sessionStorage.setItem('google_auth_redirecting', 'true')
        
        // Keep loading visible longer to ensure smooth transition
        // The fixed overlay will stay visible until page fully loads
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
          // Keep loader visible - it will disappear when component unmounts after page loads
        }, 800)
        
      } catch (e) {
        setLoading(false)
        const errorMessage = e.message || 'Google sign-in failed'
        toast.error(errorMessage)
        
        // Redirect to login on error with replace to avoid back button issues
        setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 1000)
      }
    }
    run()
  }, [googleAuth, navigate])

  // Keep showing loader even after redirect to prevent skeleton flash
  // The loader will be hidden when the component unmounts after page loads
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <ProcessingLoader
            message={message}
            subMessage={subMessage}
            variant={loading ? "default" : "success"}
            size="md"
          />
        </div>
      </motion.div>
    </div>
  )
}

export default GoogleCallback
