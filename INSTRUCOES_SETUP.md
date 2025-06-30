# 🚨 INSTRUÇÕES URGENTES - DNA UP SETUP

## ❌ PROBLEMAS IDENTIFICADOS:

1. **PROJETO SUPABASE NÃO EXISTE**: `jesvvdegtmbbuiuqwkdd` é inválido
2. **GOOGLE OAUTH RECUSADO**: Configuração incorreta
3. **API KEYS INVÁLIDAS**: Não configuradas
4. **MIGRAÇÃO COM ERRO**: Coluna `created_at` não existe

---

## 🔧 SOLUÇÃO PASSO A PASSO:

### PASSO 1: CRIAR NOVO PROJETO SUPABASE

1. **Acesse**: https://supabase.com/dashboard
2. **Clique**: "New Project" 
3. **Configure**:
   - **Nome**: DNA UP Platform
   - **Senha DB**: Crie uma senha forte (ANOTE!)
   - **Região**: South America (São Paulo)
4. **Aguarde**: 2-3 minutos
5. **Copie credenciais**:
   - Settings > API
   - Project URL
   - anon public key

### PASSO 2: ATUALIZAR .ENV

Substitua no arquivo `.env`:
```env
VITE_SUPABASE_URL=https://SEU_NOVO_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_NOVA_CHAVE
```

### PASSO 3: EXECUTAR MIGRAÇÃO

1. **Supabase Dashboard** > SQL Editor
2. **Cole e execute** todo o conteúdo de:
   `supabase/migrations/create_complete_schema.sql`
3. **Verifique** se 3 tabelas foram criadas

### PASSO 4: CONFIGURAR GOOGLE OAUTH

1. **Google Cloud Console**: https://console.cloud.google.com
2. **Criar projeto**: "DNA UP"
3. **Habilitar APIs**:
   - Google OAuth2 API
   - Google Drive API
4. **Criar credenciais OAuth 2.0**
5. **URLs autorizadas**:
   - `http://localhost:5173/auth/callback`
   - `https://seu-dominio.com/auth/callback`

### PASSO 5: CONFIGURAR SUPABASE AUTH

1. **Supabase** > Authentication > Providers
2. **Habilitar Google**
3. **Adicionar**:
   - Client ID do Google
   - Client Secret do Google
4. **Site URL**: `http://localhost:5173`
5. **Redirect URLs**: `http://localhost:5173/auth/callback`

### PASSO 6: OBTER API KEYS

#### OpenAI (Análise)
- **URL**: https://platform.openai.com/api-keys
- **Criar**: Nova chave
- **Copiar**: Para `.env`

#### Deepgram (Transcrição)
- **URL**: https://console.deepgram.com
- **Criar**: Nova API key
- **Copiar**: Para `.env`

---

## ✅ CHECKLIST DE VERIFICAÇÃO:

- [ ] Novo projeto Supabase criado
- [ ] URL e chaves atualizadas no `.env`
- [ ] Migração executada com sucesso
- [ ] 3 tabelas criadas (users, analysis_sessions, user_responses)
- [ ] RLS habilitado
- [ ] Google OAuth configurado no Google Cloud
- [ ] Google OAuth configurado no Supabase
- [ ] OpenAI API key obtida
- [ ] Deepgram API key obtida
- [ ] `npm run dev` funcionando
- [ ] Login com Google testado

---

## 🔗 LINKS CORRETOS (APÓS CRIAR PROJETO):

**Supabase Dashboard**: https://supabase.com/dashboard/project/SEU_NOVO_ID
**Database Editor**: https://supabase.com/dashboard/project/SEU_NOVO_ID/editor
**Authentication**: https://supabase.com/dashboard/project/SEU_NOVO_ID/auth/users

---

## 🆘 SE DER ERRO:

### "Project does not exist"
- Criar novo projeto Supabase
- Atualizar `.env` com novo ID

### "Invalid API key"
- Regenerar chaves no Supabase
- Verificar se copiou corretamente

### "Column does not exist"
- Executar nova migração
- Verificar se SQL foi executado completamente

### "Google OAuth refused"
- Verificar URLs no Google Cloud Console
- Verificar configuração no Supabase Auth

---

## 🎯 RESULTADO ESPERADO:

Após seguir todos os passos:
1. ✅ Login com Google funcionando
2. ✅ Gravação de áudio funcionando
3. ✅ Transcrição funcionando
4. ✅ Análise funcionando
5. ✅ Dashboard com dados
6. ✅ Histórico funcionando

---

**🧬 DNA UP - Deep Narrative Analysis Platform**