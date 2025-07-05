-- ===== CONFIGURAÇÃO SUPABASE STORAGE - DNA UP (CORRIGIDA) =====
-- Criado em: 2025-06-30
-- Versão: 1.0.2
-- Descrição: Configurar Storage para arquivos de áudio, transcrições, relatórios e datasets

-- ===== CRIAR BUCKET PRINCIPAL =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dna-protocol-files',
  'dna-protocol-files', 
  true,
  52428800, -- 50MB
  ARRAY['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm', 'text/plain', 'application/json', 'application/jsonl']
) ON CONFLICT (id) DO NOTHING;

-- ===== HABILITAR RLS NO STORAGE (se não estiver habilitado) =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ===== REMOVER POLÍTICAS EXISTENTES (se houver) =====
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- ===== POLÍTICAS DE STORAGE =====

-- Política para UPLOAD (usuários autenticados podem fazer upload)
CREATE POLICY "Authenticated users can upload files" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'dna-protocol-files'
);

-- Política para VISUALIZAÇÃO (usuários podem ver seus próprios arquivos)
CREATE POLICY "Users can view own files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'dna-protocol-files' AND
  (
    -- Permitir acesso se o caminho contém o email do usuário
    name LIKE 'users/' || replace(replace(auth.jwt() ->> 'email', '@', '_'), '.', '_') || '/%'
    OR
    -- Ou se é um arquivo público
    name NOT LIKE 'users/%'
  )
);

-- Política para ATUALIZAÇÃO (usuários podem atualizar seus próprios arquivos)
CREATE POLICY "Users can update own files" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'dna-protocol-files' AND
  name LIKE 'users/' || replace(replace(auth.jwt() ->> 'email', '@', '_'), '.', '_') || '/%'
);

-- Política para EXCLUSÃO (usuários podem deletar seus próprios arquivos)
CREATE POLICY "Users can delete own files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'dna-protocol-files' AND
  name LIKE 'users/' || replace(replace(auth.jwt() ->> 'email', '@', '_'), '.', '_') || '/%'
);

-- ===== VERIFICAÇÃO FINAL =====
SELECT 
  'dna-protocol-files' as bucket_name,
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'dna-protocol-files') 
    THEN '✅ BUCKET CRIADO' 
    ELSE '❌ ERRO NO BUCKET' 
  END as bucket_status;

-- Verificar políticas criadas
SELECT 
  policyname,
  '✅ Política ativa' as policy_status
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%files%';

-- Mensagem final
SELECT '🗄️ SUPABASE STORAGE CONFIGURADO COM SUCESSO! ✅' as resultado;