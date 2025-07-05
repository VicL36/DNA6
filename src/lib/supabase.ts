import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 ERRO: Variáveis de ambiente Supabase não encontradas!')
  console.error('📋 CHECKLIST URGENTE:')
  console.error('1. ✅ Verificar arquivo .env na raiz do projeto')
  console.error('2. ✅ Configurar VITE_SUPABASE_URL')
  console.error('3. ✅ Configurar VITE_SUPABASE_ANON_KEY')
  console.error('4. ✅ Reiniciar o servidor de desenvolvimento')
  console.error('5. ✅ Verificar se o projeto Supabase existe')
  
  // Em desenvolvimento, mostrar erro mais claro
  if (!import.meta.env.PROD) {
    console.error('❌ CONFIGURAÇÃO SUPABASE INCOMPLETA')
    console.error('📝 Crie um arquivo .env na raiz com:')
    console.error('VITE_SUPABASE_URL=sua_url_aqui')
    console.error('VITE_SUPABASE_ANON_KEY=sua_chave_aqui')
  }
}

console.log('🔵 Configurando Supabase DNA UP...')
console.log('📍 URL:', supabaseUrl?.substring(0, 30) + '...')
console.log('🔑 Key length:', supabaseAnonKey?.length || 0)

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

// Test connection only in development
if (!import.meta.env.PROD && supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro na conexão Supabase:', error.message)
      console.error('🔧 Possíveis soluções:')
      console.error('1. Verificar se o projeto Supabase existe')
      console.error('2. Verificar se as credenciais estão corretas')
      console.error('3. Executar a migração SQL')
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