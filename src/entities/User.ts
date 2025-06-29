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
      created_date: user.created_at,
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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    if (data.session?.user) {
      const user = data.session.user
      
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
        console.error('Error upserting user profile:', upsertError)
      }
    }
    
    return data
  }
}