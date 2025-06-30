# 🚨 CONFIGURAÇÃO OAUTH FINAL - DNA UP

## ✅ PROGRESSO ATUAL
- ✅ Google OAuth está funcionando (chegou na tela de autorização)
- ❌ Redirecionamento está indo para localhost:3000 (incorreto)

## 🔧 CORREÇÃO NECESSÁRIA NO GOOGLE CLOUD CONSOLE

### 1. Acesse Google Cloud Console
https://console.cloud.google.com

### 2. Vá em APIs & Services > Credentials

### 3. Edite seu OAuth 2.0 Client ID

### 4. **ATUALIZE AS URLs DE REDIRECT** (CRÍTICO):

**Authorized JavaScript origins:**
```
https://dnav1.up.railway.app
https://nzsyuhewavijzszlgshx.supabase.co
http://localhost:5173
```

**Authorized redirect URIs:**
```
https://nzsyuhewavijzszlgshx.supabase.co/auth/v1/callback
```

### 5. **REMOVA QUALQUER REFERÊNCIA A localhost:3000**

## 🔧 CONFIGURAÇÃO NO SUPABASE

### 1. Acesse Supabase Dashboard
https://supabase.com/dashboard/project/nzsyuhewavijzszlgshx

### 2. Vá em Authentication > Settings

### 3. **Site URL:**
```
https://dnav1.up.railway.app
```

### 4. **Redirect URLs:**
```
https://dnav1.up.railway.app/auth/callback
http://localhost:5173/auth/callback
```

## 🎯 TESTE FINAL

1. Salve todas as configurações
2. Aguarde 2-3 minutos
3. Acesse: https://dnav1.up.railway.app
4. Clique em "Continuar com Google"
5. Autorize o acesso
6. Deve redirecionar corretamente para o dashboard

## ⚠️ IMPORTANTE

- **NÃO** use localhost:3000 em lugar nenhum
- **USE APENAS** dnav1.up.railway.app para produção
- **USE APENAS** localhost:5173 para desenvolvimento