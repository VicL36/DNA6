-- Corrigir nomes de colunas para usar created_at (padrão Supabase)
-- Esta migração resolve o erro de coluna inexistente

-- Primeiro, verificar e criar colunas created_at se não existirem
DO $$
BEGIN
  -- Para tabela users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Se created_date existe, copiar dados
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'created_date'
    ) THEN
      UPDATE users SET created_at = created_date WHERE created_at IS NULL;
      ALTER TABLE users DROP COLUMN created_date;
    END IF;
  END IF;
END $$;

-- Para tabela analysis_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Se created_date existe, copiar dados
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'analysis_sessions' AND column_name = 'created_date'
    ) THEN
      UPDATE analysis_sessions SET created_at = created_date WHERE created_at IS NULL;
      ALTER TABLE analysis_sessions DROP COLUMN created_date;
    END IF;
  END IF;
END $$;

-- Para tabela user_responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_responses' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_responses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Se created_date existe, copiar dados
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'user_responses' AND column_name = 'created_date'
    ) THEN
      UPDATE user_responses SET created_at = created_date WHERE created_at IS NULL;
      ALTER TABLE user_responses DROP COLUMN created_date;
    END IF;
  END IF;
END $$;

-- Recriar índices com nomes corretos
DROP INDEX IF EXISTS idx_analysis_sessions_created_date;
DROP INDEX IF EXISTS idx_user_responses_created_date;

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created_at ON analysis_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_responses_created_at ON user_responses(created_at);