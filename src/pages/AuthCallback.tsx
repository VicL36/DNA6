import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@/entities/User'
import { Loader2, Brain } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      await User.handleAuthCallback()
      // Redirect to dashboard after successful authentication
      navigate('/dashboard')
    } catch (error) {
      console.error('Auth callback error:', error)
      // Redirect to login on error
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10 text-amber-400" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-white mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Finalizando login...</span>
        </div>
        <p className="text-amber-400">Aguarde enquanto configuramos sua conta</p>
      </div>
    </div>
  )
}