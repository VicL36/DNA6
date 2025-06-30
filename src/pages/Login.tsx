import React, { useState, useEffect } from 'react'
import { User } from '@/entities/User'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Rocket, Eye, EyeOff, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface LoginProps {
  onLogin: (user: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showOAuthSetup, setShowOAuthSetup] = useState(false)

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        try {
          setGoogleLoading(true)
          await User.handleAuthCallback()
          const user = await User.me()
          console.log('Login bem-sucedido:', user.email)
          onLogin(user)
        } catch (error) {
          console.error('Error handling auth callback:', error)
          setError('Erro ao processar login')
          setGoogleLoading(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [onLogin])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const { user } = await User.signIn(email, password)
        if (user) {
          const userProfile = await User.me()
          onLogin(userProfile)
        }
      } else {
        await User.signUp(email, password, fullName)
        setSuccess('Conta criada com sucesso! Faça login para continuar.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err: any) {
      console.error('Erro na autenticação:', err)
      setError(err.message || 'Erro na autenticação')
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Iniciando login com Google...')
      await User.signInWithGoogle()
      // O listener de auth state change vai lidar com o resto
    } catch (err: any) {
      console.error('Erro no Google login:', err)
      
      if (err.message.includes('não está habilitado') || 
          err.message.includes('not enabled') ||
          err.message.includes('OAuth')) {
        setShowOAuthSetup(true)
        setError('Google OAuth não está configurado. Veja as instruções abaixo.')
      } else {
        setError(err.message || 'Erro ao fazer login com Google')
      }
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg neural-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Logo container with neon glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-orange to-neon-blue opacity-20 animate-pulse-orange"></div>
            <div className="absolute inset-2 rounded-full bg-dark-surface flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="DNA UP Logo" 
                className="w-20 h-20 object-contain animate-glow"
              />
            </div>
            {/* Rocket */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-orange rounded-full flex items-center justify-center animate-float">
              <Rocket className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <motion.h1 
            className="text-5xl font-bold mb-2 text-glow-orange"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            DNA UP
          </motion.h1>
          
          <motion.p 
            className="text-neon-blue font-medium text-xl mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Deep Narrative Analysis
          </motion.p>
          
          <motion.p 
            className="text-text-secondary text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Descubra os padrões profundos da sua personalidade através de 108 perguntas estratégicas
          </motion.p>
        </motion.div>

        {/* OAuth Setup Instructions */}
        {showOAuthSetup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="glass-morphism border-0 shadow-glass border-neon-orange/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-orange">
                  <AlertCircle className="w-5 h-5" />
                  Configuração Google OAuth Necessária
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-text-secondary space-y-2">
                  <p><strong>1. Google Cloud Console:</strong></p>
                  <a 
                    href="https://console.cloud.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neon-blue hover:text-neon-orange transition-colors"
                  >
                    Criar OAuth credentials <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <p className="mt-3"><strong>2. Supabase Dashboard:</strong></p>
                  <a 
                    href="https://supabase.com/dashboard/project/nzsyuhewavijzszlgshx/auth/providers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neon-blue hover:text-neon-orange transition-colors"
                  >
                    Habilitar Google Provider <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <div className="bg-dark-surface/60 rounded-lg p-3 mt-3">
                    <p className="text-xs text-text-muted">
                      <strong>Redirect URL:</strong><br/>
                      https://nzsyuhewavijzszlgshx.supabase.co/auth/v1/callback
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowOAuthSetup(false)}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent border-white/20 text-text-secondary hover:border-neon-orange hover:text-neon-orange"
                >
                  Fechar Instruções
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-morphism border-0 shadow-glass card-hover">
            <CardHeader className="text-center">
              <CardTitle className="text-text-primary text-xl">
                {isLogin ? 'Acesse sua Análise Narrativa' : 'Crie sua Conta'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Google Login Button */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 rounded-lg shadow-neon-blue hover:shadow-neon-blue-lg transition-all duration-300 border-0 group"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {googleLoading ? 'Conectando...' : 'Continuar com Google'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-surface text-text-muted">ou</span>
                </div>
              </div>
              
              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-2">
                      Nome Completo
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:border-neon-orange focus:outline-none transition-colors"
                      placeholder="Seu nome completo"
                      required={!isLogin}
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:border-neon-orange focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-surface border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:border-neon-orange focus:outline-none transition-colors pr-12"
                      placeholder="Sua senha"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-neon-orange shadow-neon-orange hover:shadow-neon-orange-lg transition-all duration-300 py-4"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
                </Button>
              </form>

              {/* Toggle Login/Register */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setSuccess('')
                    setShowOAuthSetup(false)
                  }}
                  className="text-sm text-text-secondary hover:text-neon-orange transition-colors"
                >
                  {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm p-4 rounded-lg border bg-green-500/20 text-green-300 border-green-500/30 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm p-4 rounded-lg border bg-red-500/20 text-red-300 border-red-500/30 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              {/* Features */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="w-2 h-2 rounded-full bg-neon-orange"></div>
                  <span>108 perguntas estratégicas em 9 domínios</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                  <span>Análise psicológica profunda com IA</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="w-2 h-2 rounded-full bg-neon-orange"></div>
                  <span>Relatório personalizado completo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-text-muted text-sm"
        >
          <p>Análise psicológica baseada no protocolo Clara R.</p>
          <p className="mt-1">Seguro • Privado • Científico</p>
        </motion.div>
      </div>
    </div>
  )
}