/*
  # Fix Database Schema for DNA Platform

  1. Tables
    - Ensure all required tables exist with correct columns
    - Add missing user_email column to analysis_sessions
    - Fix any missing columns or constraints

  2. Security
    - Enable RLS on all tables
    - Add proper policies for data access

  3. Indexes
    - Add performance indexes
*/

-- Ensure users table exists with all required columns
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_audio_time INTEGER DEFAULT 0
);

-- Ensure analysis_sessions table exists with ALL required columns including user_email
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  current_question INTEGER DEFAULT 1,
  total_questions INTEGER DEFAULT 108,
  progress_percentage INTEGER DEFAULT 0,
  final_synthesis TEXT,
  pdf_file_url TEXT,
  drive_folder_id TEXT
);

-- Add user_email column if it doesn't exist (for existing databases)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN user_email TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Ensure user_responses table exists
CREATE TABLE IF NOT EXISTS user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_domain TEXT NOT NULL,
  transcript_text TEXT,
  audio_duration NUMERIC,
  audio_file_url TEXT,
  drive_file_id TEXT,
  analysis_keywords TEXT[] DEFAULT '{}',
  sentiment_score NUMERIC,
  emotional_tone TEXT
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can access own sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Users can access own responses" ON user_responses;

-- Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Policies for analysis_sessions table
CREATE POLICY "Users can access own sessions" ON analysis_sessions
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- Policies for user_responses table
CREATE POLICY "Users can access own responses" ON user_responses
  FOR ALL USING (
    session_id IN (
      SELECT id FROM analysis_sessions 
      WHERE user_email = auth.jwt() ->> 'email'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_email ON analysis_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created_date ON analysis_sessions(created_date);
CREATE INDEX IF NOT EXISTS idx_user_responses_session_id ON user_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_question_index ON user_responses(question_index);
CREATE INDEX IF NOT EXISTS idx_user_responses_created_date ON user_responses(created_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update statistics when a response is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET 
      total_responses = total_responses + 1,
      total_audio_time = total_audio_time + COALESCE(NEW.audio_duration, 0)
    WHERE email = (
      SELECT user_email FROM analysis_sessions 
      WHERE id = NEW.session_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_user_stats ON user_responses;

-- Create trigger for updating user statistics
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON user_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Function to update completed sessions
CREATE OR REPLACE FUNCTION update_completed_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update when a session is marked as complete
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE users 
    SET completed_sessions = completed_sessions + 1
    WHERE email = NEW.user_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_completed_sessions ON analysis_sessions;

-- Create trigger for completed sessions
CREATE TRIGGER trigger_update_completed_sessions
  AFTER UPDATE ON analysis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_sessions();