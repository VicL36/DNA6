# 🔧 CONFIGURAÇÃO GOOGLE OAUTH - DNA UP

## 🚨 ERRO ATUAL
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

## ✅ SOLUÇÃO PASSO A PASSO

### 1. 🔵 CONFIGURAR GOOGLE CLOUD CONSOLE

1. **Acesse**: https://console.cloud.google.com
2. **Crie projeto**: "DNA UP Platform"
3. **Habilite APIs**:
   - Google+ API
   - Google OAuth2 API
4. **Criar credenciais**:
   - Credentials > Create Credentials > OAuth client ID
   - Application type: Web application
   - Name: DNA UP Platform
   - **Authorized JavaScript origins**:
     ```
     https://nzsyuhewavijzszlgshx.supabase.co
     https://dnav1.up.railway.app
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     https://nzsyuhewavijzszlgshx.supabase.co/auth/v1/callback
     https://dnav1.up.railway.app/auth/callback
     http://localhost:5173/auth/callback
     ```

### 2. 🔵 CONFIGURAR SUPABASE

1. **Acesse**: https://supabase.com/dashboard/project/nzsyuhewavijzszlgshx
2. **Vá para**: Authentication > Providers
3. **Habilite Google**:
   - Toggle: ON
   - Client ID: `SEU_GOOGLE_CLIENT_ID`
   - Client Secret: `SEU_GOOGLE_CLIENT_SECRET`
   - Redirect URL: `https://nzsyuhewavijzszlgshx.supabase.co/auth/v1/callback`

### 3. 🔵 CONFIGURAR RAILWAY

Adicione as variáveis de ambiente no Railway:

```env
VITE_SUPABASE_URL=https://nzsyuhewavijzszlgshx.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
VITE_GOOGLE_CLIENT_ID=SEU_GOOGLE_CLIENT_ID
VITE_DEEPGRAM_API_KEY=SUA_CHAVE_DEEPGRAM (opcional)
VITE_GEMINI_API_KEY=SUA_CHAVE_GEMINI (opcional)
```

## 🎯 CHECKLIST URGENTE

- [ ] ✅ Criar projeto no Google Cloud Console
- [ ] ✅ Configurar OAuth credentials
- [ ] ✅ Habilitar Google provider no Supabase
- [ ] ✅ Adicionar Client ID e Secret no Supabase
- [ ] ✅ Configurar URLs de redirect corretas
- [ ] ✅ Testar login com Google

## 🔗 LINKS IMPORTANTES

- **Google Cloud Console**: https://console.cloud.google.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/nzsyuhewavijzszlgshx
- **Railway Dashboard**: https://railway.app/dashboard
- **App em Produção**: https://dnav1.up.railway.app

## ⚠️ IMPORTANTE

Após configurar, aguarde 5-10 minutos para as configurações se propagarem.