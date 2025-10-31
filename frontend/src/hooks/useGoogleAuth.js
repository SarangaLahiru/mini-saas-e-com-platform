import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loadGoogleScript } from '../utils/googleAuth'

const useGoogleAuth = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const startGoogleRedirect = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            await loadGoogleScript()
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
            if (!clientId) {
                throw new Error('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID')
            }

            const oauthClient = window.google.accounts.oauth2.initCodeClient({
                client_id: clientId,
                scope: 'email profile openid',
                ux_mode: 'redirect',
                redirect_uri: `${window.location.origin}/auth/google/callback`,
            })
            oauthClient.requestCode()
        } catch (error) {
            toast.error(error.message || 'Google authentication failed')
            setIsLoading(false)
        }
    }

    return {
        startGoogleRedirect,
        isLoading
    }
}

export default useGoogleAuth
