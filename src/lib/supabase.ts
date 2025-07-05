import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 ERRO: Variáveis de ambiente Supabase não encontradas!')
  console.error('📋 Verifique o arquivo .env na raiz do projeto')
  console.error('✅ VITE_SUPABASE_URL deve estar configurado')
  console.error('✅ VITE_SUPABASE_ANON_KEY deve estar configurado')
} else {
  console.log('✅ Supabase configurado corretamente')
  console.log('📍 URL:', supabaseUrl?.substring(0, 30) + '...')
  console.log('🔑 Key length:', supabaseAnonKey?.length || 0)
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'dna-up-platform'
      }
    }
  }
)

// Test connection
if (supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro na conexão Supabase:', error.message)
    } else {
      console.log('✅ Conexão Supabase OK:', data.session ? 'Autenticado' : 'Não autenticado')
    }
  })
}

// Database Types - Updated to use created_at
export interface Database {
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          id: string
          created_at: string
          user_email: string
          status: 'active' | 'completed' | 'paused'
          current_question: number
          total_questions: number
          progress_percentage: number
          final_synthesis: string | null
          pdf_file_url: string | null
          drive_folder_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_email: string
          status?: 'active' | 'completed' | 'paused'
          current_question?: number
          total_questions?: number
          progress_percentage?: number
          final_synthesis?: string | null
          pdf_file_url?: string | null
          drive_folder_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_email?: string
          status?: 'active' | 'completed' | 'paused'
          current_question?: number
          total_questions?: number
          progress_percentage?: number
          final_synthesis?: string | null
          pdf_file_url?: string | null
          drive_folder_id?: string | null
        }
      }
      user_responses: {
        Row: {
          id: string
          created_at: string
          session_id: string
          question_index: number
          question_text: string
          question_domain: string
          transcript_text: string | null
          audio_duration: number | null
          audio_file_url: string | null
          drive_file_id: string | null
          analysis_keywords: string[]
          sentiment_score: number | null
          emotional_tone: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          question_index: number
          question_text: string
          question_domain: string
          transcript_text?: string | null
          audio_duration?: number | null
          audio_file_url?: string | null
          drive_file_id?: string | null
          analysis_keywords?: string[]
          sentiment_score?: number | null
          emotional_tone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          question_index?: number
          question_text?: string
          question_domain?: string
          transcript_text?: string | null
          audio_duration?: number | null
          audio_file_url?: string | null
          drive_file_id?: string | null
          analysis_keywords?: string[]
          sentiment_score?: number | null
          emotional_tone?: string | null
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          last_login: string | null
          total_sessions: number
          completed_sessions: number
          total_responses: number
          total_audio_time: number
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          last_login?: string | null
          total_sessions?: number
          completed_sessions?: number
          total_responses?: number
          total_audio_time?: number
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          last_login?: string | null
          total_sessions?: number
          completed_sessions?: number
          total_responses?: number
          total_audio_time?: number
        }
      }
    }
  }
}