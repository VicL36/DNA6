-- ===== SCHEMA COMPLETO DNA UP PLATFORM =====
-- Migração completa para criar todas as tabelas e configurações

-- ===== HABILITAR EXTENSÕES =====
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== LIMPAR TABELAS EXISTENTES (SE HOUVER) =====
DROP TABLE IF EXISTS user_responses CASCADE;
DROP TABLE IF EXISTS analysis_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===== TABELA DE USUÁRIOS =====
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_audio_time INTEGER DEFAULT 0
);

-- ===== TABELA DE SESSÕES DE ANÁLISE =====
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  current_question INTEGER DEFAULT 1,
  total_questions INTEGER DEFAULT 108,
  progress_percentage INTEGER DEFAULT 0,
  final_synthesis TEXT,
  pdf_file_url TEXT,
  drive_folder_id TEXT
);

-- ===== TABELA DE RESPOSTAS DOS USUÁRIOS =====
CREATE TABLE user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
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

-- ===== HABILITAR ROW LEVEL SECURITY =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS DE SEGURANÇA PARA USERS =====
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- ===== POLÍTICAS DE SEGURANÇA PARA ANALYSIS_SESSIONS =====
CREATE POLICY "Users can access own sessions" ON analysis_sessions
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- ===== POLÍTICAS DE SEGURANÇA PARA USER_RESPONSES =====
CREATE POLICY "Users can access own responses" ON user_responses
  FOR ALL USING (
    session_id IN (
      SELECT id FROM analysis_sessions 
      WHERE user_email = auth.jwt() ->> 'email'
    )
  );

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_analysis_sessions_user_email ON analysis_sessions(user_email);
CREATE INDEX idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX idx_analysis_sessions_created_at ON analysis_sessions(created_at);

CREATE INDEX idx_user_responses_session_id ON user_responses(session_id);
CREATE INDEX idx_user_responses_question_index ON user_responses(question_index);
CREATE INDEX idx_user_responses_created_at ON user_responses(created_at);

-- ===== FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS DO USUÁRIO =====
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas quando uma resposta é inserida
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

-- ===== FUNÇÃO PARA ATUALIZAR SESSÕES COMPLETAS =====
CREATE OR REPLACE FUNCTION update_completed_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar quando uma sessão é marcada como completa
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE users 
    SET completed_sessions = completed_sessions + 1
    WHERE email = NEW.user_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== TRIGGERS PARA ESTATÍSTICAS AUTOMÁTICAS =====
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON user_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_completed_sessions
  AFTER UPDATE ON analysis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_sessions();

-- ===== VERIFICAÇÃO FINAL =====
-- Verificar se todas as tabelas foram criadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'analysis_sessions', 'user_responses');

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'analysis_sessions', 'user_responses');

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public';