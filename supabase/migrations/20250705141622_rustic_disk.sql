-- ===== CONFIGURAÇÃO SUPABASE STORAGE - DNA UP =====
-- Criado em: 2025-06-30
-- Versão: 1.0.1
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

-- ===== POLÍTICAS DE STORAGE =====

-- Política para UPLOAD (usuários autenticados podem fazer upload)
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'dna-protocol-files'
  );

-- Política para VISUALIZAÇÃO (usuários podem ver seus próprios arquivos)
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'dna-protocol-files' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = replace(replace(auth.jwt() ->> 'email', '@', '_'), '.', '_')
  );

-- Política para ATUALIZAÇÃO (usuários podem atualizar seus próprios arquivos)
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'dna-protocol-files' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = replace(replace(auth.jwt() ->> 'email', '@', '_'), '.', '_')
  );

-- Política para EXCLUSÃO (usuários podem deletar seus próprios arquivos)
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'dna-protocol-files' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = replace(replace(auth.jwt() ->> 'email', '@', '_'), '.', '_')
  );

-- ===== HABILITAR RLS NO STORAGE =====
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Mensagem final
SELECT '🗄️ SUPABASE STORAGE CONFIGURADO COM SUCESSO! ✅' as resultado;