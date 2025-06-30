import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { User } from '@/entities/User'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Analysis from '@/pages/Analysis'
import History from '@/pages/History'
import Login from '@/pages/Login'
import AuthCallback from '@/pages/AuthCallback'
import { Loader2, AlertTriangle } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticação...')
      const currentUser = await User.me()
      console.log('✅ Usuário autenticado:', currentUser.email)
      setUser(currentUser)
    } catch (error) {
      console.log('ℹ️ Usuário não autenticado:', error.message)
      setError(null) // Não é erro, apenas não autenticado
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
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
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-neon-orange animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2 text-glow-orange">DNA UP</h1>
          <p className="text-neon-blue font-medium">Deep Narrative Analysis</p>
          <p className="text-text-muted text-sm mt-2">Carregando aplicação...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg neural-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full"></div>
            <div className="absolute inset-2 bg-dark-surface rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">Erro de Configuração</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-neon-orange px-6 py-3 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout currentPageName="Dashboard">
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analysis"
          element={
            user ? (
              <Layout currentPageName="Analysis">
                <Analysis />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/history"
          element={
            user ? (
              <Layout currentPageName="History">
                <History />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App