-- Fix column names to match Supabase defaults
-- Supabase uses 'created_at' instead of 'created_date'

-- Update users table to use correct column names
DO $$
BEGIN
  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- If created_date exists, copy data and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'created_date'
  ) THEN
    UPDATE users SET created_at = created_date WHERE created_at IS NULL;
    ALTER TABLE users DROP COLUMN created_date;
  END IF;
END $$;

-- Update analysis_sessions table
DO $$
BEGIN
  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- If created_date exists, copy data and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'created_date'
  ) THEN
    UPDATE analysis_sessions SET created_at = created_date WHERE created_at IS NULL;
    ALTER TABLE analysis_sessions DROP COLUMN created_date;
  END IF;
END $$;

-- Update user_responses table
DO $$
BEGIN
  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_responses' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_responses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- If created_date exists, copy data and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_responses' AND column_name = 'created_date'
  ) THEN
    UPDATE user_responses SET created_at = created_date WHERE created_at IS NULL;
    ALTER TABLE user_responses DROP COLUMN created_date;
  END IF;
END $$;

-- Recreate indexes with correct column names
DROP INDEX IF EXISTS idx_analysis_sessions_created_date;
DROP INDEX IF EXISTS idx_user_responses_created_date;

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created_at ON analysis_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_responses_created_at ON user_responses(created_at);