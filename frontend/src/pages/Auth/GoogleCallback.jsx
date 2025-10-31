import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import FormSkeleton from '../../components/ui/FormSkeleton'

const GoogleCallback = () => {
  const navigate = useNavigate()
  const { googleAuth } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (!code) {
          throw new Error('Missing authorization code')
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
        const res = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Google exchange failed')
        }
        const data = await res.json()
        await googleAuth(data)
        toast.success('Google sign-in successful')
        if (data?.user?.isAdmin || data?.user?.is_admin) {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } catch (e) {
        toast.error(e.message || 'Google sign-in failed')
        navigate('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) return <FormSkeleton type="login" />
  return null
}

export default GoogleCallback
