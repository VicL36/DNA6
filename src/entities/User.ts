import { supabase } from '@/lib/supabase'

export class User {
  static async me() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) throw new Error('User not authenticated')
    
    // Get user profile from users table - use maybeSingle() to handle no rows gracefully
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()
    
    if (profileError) {
      throw profileError
    }
    
    return profile || {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      created_at: user.created_at,
      last_login: new Date().toISOString(),
      total_sessions: 0,
      completed_sessions: 0,
      total_responses: 0,
      total_audio_time: 0
    }
  }
  
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) throw error
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null,
          last_login: new Date().toISOString(),
          total_sessions: 0,
          completed_sessions: 0,
          total_responses: 0,
          total_audio_time: 0
        })
      
      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }
    
    return data
  }
  
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // Update last login
    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', data.user.email)
    }
    
    return data
  }
  
  static async signInWithGoogle() {
    try {
      // 🔥 CORREÇÃO CRÍTICA: Detectar ambiente corretamente
      const isProduction = window.location.hostname === 'dnav1.up.railway.app'
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      let redirectTo: string
      
      if (isProduction) {
        redirectTo = 'https://dnav1.up.railway.app/auth/callback'
      } else if (isDevelopment) {
        redirectTo = 'http://localhost:5173/auth/callback'
      } else {
        // Fallback para qualquer outro domínio
        redirectTo = `${window.location.origin}/auth/callback`
      }
      
      console.log('🔵 Iniciando Google OAuth...')
      console.log('🌍 Hostname:', window.location.hostname)
      console.log('🔗 Redirect URL:', redirectTo)
      console.log('🏠 Origin:', window.location.origin)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      })
      
      if (error) {
        console.error('❌ Erro no Google OAuth:', error)
        
        // Verificar tipos específicos de erro
        if (error.message.includes('provider is not enabled') || 
            error.message.includes('Unsupported provider') ||
            error.message.includes('validation_failed') ||
            error.message.includes('PGRST301')) {
          throw new Error('GOOGLE_OAUTH_DISABLED')
        }
        
        if (error.message.includes('refused') || error.message.includes('CORS')) {
          throw new Error('GOOGLE_OAUTH_CORS_ERROR')
        }
        
        if (error.message.includes('Invalid provider')) {
          throw new Error('GOOGLE_OAUTH_NOT_CONFIGURED')
        }
        
        throw error
      }
      
      console.log('✅ Google OAuth iniciado com sucesso')
      return data
    } catch (error: any) {
      console.error('❌ Erro completo no Google OAuth:', error)
      
      if (error.message === 'GOOGLE_OAUTH_DISABLED') {
        throw new Error('Login com Google não está habilitado no Supabase. Vá em Authentication > Providers > Google e habilite.')
      }
      
      if (error.message === 'GOOGLE_OAUTH_CORS_ERROR') {
        throw new Error('Erro de CORS. Verifique se o domínio está autorizado no Google Cloud Console.')
      }
      
      if (error.message === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
        throw new Error('Google OAuth não está configurado. Configure Client ID e Secret no Supabase.')
      }
      
      throw new Error('Erro no login com Google. Verifique a configuração do OAuth.')
    }
  }
  
  static async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  
  static async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    const user = await this.me()
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', user.email)
    
    if (error) throw error
    
    return this.me()
  }

  static async handleAuthCallback() {
    try {
      console.log('🔵 Processando callback de autenticação...')
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Erro ao obter sessão:', error)
        throw error
      }
      
      if (data.session?.user) {
        const user = data.session.user
        console.log('✅ Usuário autenticado:', user.email)
        
        // Create or update user profile
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            last_login: new Date().toISOString(),
            total_sessions: 0,
            completed_sessions: 0,
            total_responses: 0,
            total_audio_time: 0
          }, {
            onConflict: 'email'
          })
        
        if (upsertError) {
          console.error('❌ Erro ao criar/atualizar perfil:', upsertError)
        } else {
          console.log('✅ Perfil criado/atualizado com sucesso')
        }
      }
      
      return data
    } catch (error) {
      console.error('❌ Erro no callback de autenticação:', error)
      throw error
    }
  }
}