# 🚀 SETUP COMPLETO - DNA UP PLATFORM

## ⚠️ PROBLEMAS IDENTIFICADOS E SOLUÇÕES

### 1. ❌ PROJETO SUPABASE NÃO EXISTE
**Problema**: O ID `jesvvdegtmbbuiuqwkdd` não é válido
**Solução**: Criar novo projeto Supabase

### 2. ❌ ERRO DE COLUNA `created_at`
**Problema**: Migração tentando usar coluna inexistente
**Solução**: Nova migração corrigida

### 3. ❌ API KEYS INVÁLIDAS
**Problema**: Chaves não configuradas ou incorretas
**Solução**: Configuração completa no `.env`

---

## 🔧 PASSO A PASSO PARA CONFIGURAR

### PASSO 1: CRIAR PROJETO SUPABASE

1. **Acesse**: https://supabase.com/dashboard
2. **Clique**: "New Project"
3. **Configure**:
   - **Nome**: DNA UP Platform
   - **Database Password**: Crie uma senha forte (ANOTE!)
   - **Região**: South America (São Paulo)
4. **Aguarde**: 2-3 minutos para criação
5. **Copie as credenciais**:
   - Vá em Settings > API
   - Copie Project URL e anon key

### PASSO 2: ATUALIZAR .ENV

```env
VITE_SUPABASE_URL=https://SEU_NOVO_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_NOVA_CHAVE_ANONIMA
```

### PASSO 3: EXECUTAR MIGRAÇÃO

1. **Acesse**: Supabase Dashboard > SQL Editor
2. **Cole e execute** o SQL da migração
3. **Verifique**: Se todas as tabelas foram criadas

### PASSO 4: CONFIGURAR GOOGLE OAUTH

1. **Acesse**: https://console.cloud.google.com
2. **Crie projeto**: "DNA UP"
3. **Habilite APIs**:
   - Google OAuth2 API
   - Google Drive API
4. **Configure OAuth**:
   - Tela de consentimento
   - Credenciais OAuth 2.0
   - URLs autorizadas

### PASSO 5: OBTER API KEYS

#### OpenAI (Análise Psicológica)
- **URL**: https://platform.openai.com/api-keys
- **Criar**: Nova chave secreta
- **Copiar**: Para VITE_OPENAI_API_KEY

#### Deepgram (Transcrição)
- **URL**: https://console.deepgram.com
- **Criar**: Nova API key
- **Copiar**: Para VITE_DEEPGRAM_API_KEY

### PASSO 6: CONFIGURAR SUPABASE AUTH

1. **Vá para**: Authentication > Providers
2. **Habilite**: Google
3. **Configure**:
   - Client ID do Google
   - Client Secret do Google
4. **URLs de Redirect**:
   - `http://localhost:5173/auth/callback`
   - `https://seu-dominio.com/auth/callback`

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### ✅ Supabase
- [ ] Projeto criado
- [ ] URL e chaves copiadas
- [ ] Migração executada
- [ ] Tabelas criadas
- [ ] RLS habilitado
- [ ] Google OAuth configurado

### ✅ Google Cloud
- [ ] Projeto criado
- [ ] APIs habilitadas
- [ ] OAuth configurado
- [ ] URLs autorizadas
- [ ] Credenciais copiadas

### ✅ APIs Externas
- [ ] OpenAI API key obtida
- [ ] Deepgram API key obtida
- [ ] Chaves testadas

### ✅ Aplicação
- [ ] .env atualizado
- [ ] npm install executado
- [ ] npm run dev funcionando
- [ ] Login testado
- [ ] Gravação testada

---

## 🔗 LINKS IMPORTANTES

### Supabase (SUBSTITUA O ID)
- **Dashboard**: https://supabase.com/dashboard/project/SEU_NOVO_ID
- **Database**: https://supabase.com/dashboard/project/SEU_NOVO_ID/editor
- **Auth**: https://supabase.com/dashboard/project/SEU_NOVO_ID/auth/users

### APIs
- **OpenAI**: https://platform.openai.com
- **Deepgram**: https://console.deepgram.com
- **Google Cloud**: https://console.cloud.google.com

---

## 🆘 TROUBLESHOOTING

### Erro: "Project does not exist"
- Criar novo projeto Supabase
- Atualizar URL no .env

### Erro: "Invalid API key"
- Verificar se chaves estão corretas
- Regenerar chaves se necessário

### Erro: "Column does not exist"
- Executar nova migração
- Verificar se tabelas foram criadas

### Erro: "CORS"
- Configurar URLs no Google Cloud
- Verificar configuração OAuth

---

## 🎯 PRÓXIMOS PASSOS

1. **Criar projeto Supabase**
2. **Atualizar .env**
3. **Executar migração**
4. **Configurar Google OAuth**
5. **Testar aplicação**
6. **Deploy em produção**

---

**🧬 DNA UP - Deep Narrative Analysis Platform**