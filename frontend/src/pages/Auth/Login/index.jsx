import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import AuthSkeleton from '../../../components/auth/AuthSkeleton'
import LoginHeader from './components/LoginHeader'
import LoginForm from './components/LoginForm'
import toast from 'react-hot-toast'

const Login = () => {
  const { login, googleAuth, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleLoginSuccess = (user) => {
    toast.success('Login successful! Welcome back!')
    if (user?.isAdmin || user?.is_admin) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    try {
      await googleAuth()
      toast.success('Google login successful! Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Google login failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // If already logged in, redirect based on role
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isAdmin || user?.is_admin) navigate('/admin')
      else navigate('/')
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <AuthSkeleton type="login" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto mb-8"
        >
          <LoginHeader />
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onGoogleAuth={handleGoogleAuth}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default Login