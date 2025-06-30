import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@/entities/User'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      console.log('Processando callback de autenticação...')
      await User.handleAuthCallback()
      console.log('Callback processado com sucesso, redirecionando...')
      // Redirect to dashboard after successful authentication
      navigate('/dashboard')
    } catch (error) {
      console.error('Auth callback error:', error)
      // Redirect to login on error
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg neural-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-orange to-neon-blue rounded-full animate-pulse-orange"></div>
          <div className="absolute inset-2 bg-dark-surface rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="DNA UP Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-text-primary mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-neon-orange" />
          <span className="text-lg">Finalizando login...</span>
        </div>
        <p className="text-neon-blue">Aguarde enquanto configuramos sua conta</p>
      </div>
    </div>
  )
}