# 🚨 SETUP URGENTE - DNA UP

## ❌ PROBLEMAS IDENTIFICADOS:

1. **PROJETO SUPABASE NÃO EXISTE**: `jesvvdegtmbbuiuqwkdd` é inválido
2. **APLICAÇÃO FALHOU**: Erro no Railway
3. **CONFIGURAÇÕES INCORRETAS**: APIs não configuradas

---

## 🔧 SOLUÇÃO PASSO A PASSO:

### 🎯 PASSO 1: CRIAR NOVO PROJETO SUPABASE

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

### 🎯 PASSO 2: ATUALIZAR .ENV

Substitua no arquivo `.env`:
```env
VITE_SUPABASE_URL=https://SEU_NOVO_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_NOVA_CHAVE
```

### 🎯 PASSO 3: EXECUTAR MIGRAÇÃO

1. **Supabase Dashboard** > SQL Editor
2. **Cole e execute** a migração completa
3. **Verifique** se 3 tabelas foram criadas

### 🎯 PASSO 4: OBTER API KEYS

#### Gemini AI (Análise Psicológica) - GRATUITO
1. **Acesse**: https://makersuite.google.com/app/apikey
2. **Login** com Google
3. **Clique**: "Create API Key"
4. **Copie** para `.env`: `VITE_GEMINI_API_KEY=`

#### Deepgram (Transcrição) - GRATUITO
1. **Acesse**: https://console.deepgram.com
2. **Crie conta**
3. **API Keys** > "Create API Key"
4. **Copie** para `.env`: `VITE_DEEPGRAM_API_KEY=`

#### Google OAuth (Login)
1. **Acesse**: https://console.cloud.google.com
2. **Criar projeto**: "DNA UP"
3. **Habilitar**: Google OAuth2 API
4. **Credenciais** > OAuth 2.0
5. **URLs autorizadas**:
   - `http://localhost:5173/auth/callback`

### 🎯 PASSO 5: CONFIGURAR SUPABASE AUTH

1. **Supabase** > Authentication > Providers
2. **Habilitar Google**
3. **Adicionar**:
   - Client ID do Google
   - Client Secret do Google
4. **Site URL**: `http://localhost:5173`
5. **Redirect URLs**: `http://localhost:5173/auth/callback`

---

## ✅ CHECKLIST COMPLETO:

### Supabase
- [ ] Novo projeto criado
- [ ] URL e chaves copiadas
- [ ] Migração executada
- [ ] 3 tabelas criadas
- [ ] RLS habilitado
- [ ] Google OAuth configurado

### APIs
- [ ] Gemini API key obtida
- [ ] Deepgram API key obtida
- [ ] Google OAuth configurado
- [ ] Todas as chaves no .env

### Aplicação
- [ ] .env atualizado
- [ ] npm install
- [ ] npm run dev funcionando
- [ ] Login testado
- [ ] Gravação testada

---

## 🔗 LINKS IMPORTANTES:

**Criar Supabase**: https://supabase.com/dashboard
**Gemini API**: https://makersuite.google.com/app/apikey
**Deepgram**: https://console.deepgram.com
**Google Cloud**: https://console.cloud.google.com

---

## 🆘 TROUBLESHOOTING:

### "Project does not exist"
✅ Criar novo projeto Supabase
✅ Atualizar .env com novo ID

### "Invalid API key"
✅ Regenerar chaves
✅ Verificar se copiou corretamente

### "Application failed"
✅ Verificar todas as variáveis .env
✅ Executar migração no Supabase
✅ Testar localmente primeiro

---

**🧬 DNA UP - Deep Narrative Analysis Platform**