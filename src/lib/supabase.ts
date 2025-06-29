import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database Types - Updated to use created_at instead of created_date
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