import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { User } from '@/entities/User'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Analysis from '@/pages/Analysis'
import History from '@/pages/History'
import Login from '@/pages/Login'
import AuthCallback from '@/pages/AuthCallback'
import { Loader2 } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await User.me()
      setUser(currentUser)
    } catch (error) {
      console.log('User not authenticated')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">DNA Platform</h1>
          <p className="text-amber-400 font-medium">Deep Narrative Analysis</p>
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