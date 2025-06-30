# 🔧 GUIA COMPLETO - CONFIGURAÇÃO GOOGLE DRIVE API
## DNA UP Platform - Passo a Passo Detalhado

---

## 🎯 VARIÁVEIS NECESSÁRIAS

Você precisa obter estas 4 variáveis:

```env
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN=1//04xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_PARENT_FOLDER_ID=1BeMvN-FCm751EO7JXhZi6pdpl5g7EO8q
VITE_GOOGLE_CLIENT_ID=123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ **GOOGLE CLOUD CONSOLE - Criar Projeto**

**🔗 Link Principal:** https://console.cloud.google.com

**📝 Passos:**
1. Acesse o link acima
2. Clique em "Novo Projeto" (canto superior direito)
3. Nome do projeto: `DNA UP Platform`
4. Clique em "Criar"
5. Aguarde a criação (1-2 minutos)

---

### 2️⃣ **HABILITAR APIs NECESSÁRIAS**

**🔗 Link Direto:** https://console.cloud.google.com/apis/library

**📝 Passos:**
1. Acesse o link acima
2. Procure por "Google Drive API"
3. Clique em "Google Drive API"
4. Clique em "Ativar"
5. Repita para "Google OAuth2 API"

---

### 3️⃣ **CRIAR CREDENCIAIS OAUTH**

**🔗 Link Direto:** https://console.cloud.google.com/apis/credentials

**📝 Passos:**
1. Acesse o link acima
2. Clique em "Criar Credenciais" → "ID do cliente OAuth 2.0"
3. **Tipo de aplicativo:** Aplicativo da Web
4. **Nome:** DNA UP Platform
5. **Origens JavaScript autorizadas:**
   ```
   https://tangerine-mermaid-d19ca7.netlify.app
   http://localhost:5173
   ```
6. **URIs de redirecionamento autorizados:**
   ```
   https://tangerine-mermaid-d19ca7.netlify.app/auth/callback
   http://localhost:5173/auth/callback
   ```
7. Clique em "Criar"
8. **COPIE E SALVE:**
   - `VITE_GOOGLE_CLIENT_ID` = ID do cliente
   - `GOOGLE_CLIENT_SECRET` = Chave secreta do cliente

---

### 4️⃣ **OBTER REFRESH TOKEN - MÉTODO SIMPLES**

**🔗 Link Direto:** https://developers.google.com/oauthplayground

**📝 Passos:**
1. Acesse o OAuth 2.0 Playground
2. **Configurar (canto superior direito):**
   - Marque "Use your own OAuth credentials"
   - Cole seu `Client ID` (do passo anterior)
   - Cole seu `Client Secret` (do passo anterior)
3. **Step 1 - Select & authorize APIs:**
   - Procure por "Drive API v3"
   - Marque: `https://www.googleapis.com/auth/drive`
   - Clique em "Authorize APIs"
4. **Autorizar no Google:**
   - Faça login com sua conta Google
   - Clique em "Permitir"
5. **Step 2 - Exchange authorization code for tokens:**
   - Clique em "Exchange authorization code for tokens"
6. **COPIE E SALVE:**
   - `GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN` = Refresh token

---

### 5️⃣ **CRIAR PASTA NO GOOGLE DRIVE**

**🔗 Link Direto:** https://drive.google.com

**📝 Passos:**
1. Acesse o Google Drive
2. Clique em "Novo" → "Pasta"
3. Nome da pasta: `DNA`
4. Clique em "Criar"
5. **Abra a pasta criada**
6. **Na URL, copie o ID da pasta:**
   ```
   https://drive.google.com/drive/folders/1BeMvN-FCm751EO7JXhZi6pdpl5g7EO8q
                                            ↑ ESTE É O ID DA PASTA ↑
   ```
7. **COPIE E SALVE:**
   - `GOOGLE_DRIVE_PARENT_FOLDER_ID` = ID da pasta

---

## 🚀 CONFIGURAR NO NETLIFY

### **Adicionar Variáveis de Ambiente**

**🔗 Link Direto:** https://app.netlify.com/sites/tangerine-mermaid-d19ca7/settings/env

**📝 Passos:**
1. Acesse o link acima (ou vá em Site settings → Environment variables)
2. Clique em "Add variable"
3. Adicione uma por uma:

```env
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN=1//04xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_PARENT_FOLDER_ID=1BeMvN-FCm751EO7JXhZi6pdpl5g7EO8q
VITE_GOOGLE_CLIENT_ID=123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

4. Clique em "Save"
5. **Importante:** Faça um novo deploy após adicionar as variáveis

---

## 🔧 CONFIGURAR SUPABASE OAUTH

### **Habilitar Google Provider**

**🔗 Link Direto:** https://supabase.com/dashboard/project/nzsyuhewavijzszlgshx/auth/providers

**📝 Passos:**
1. Acesse o link acima
2. Encontre "Google" na lista de providers
3. **Habilite o toggle**
4. **Adicione:**
   - **Client ID:** (mesmo do passo 3)
   - **Client Secret:** (mesmo do passo 3)
5. **Redirect URL (já configurada):**
   ```
   https://nzsyuhewavijzszlgshx.supabase.co/auth/v1/callback
   ```
6. Clique em "Save"

---

## ✅ TESTE FINAL

### **Verificar se tudo está funcionando:**

1. **Acesse:** https://tangerine-mermaid-d19ca7.netlify.app
2. **Clique em "Continuar com Google"**
3. **Faça login**
4. **Inicie uma análise**
5. **Grave uma resposta**
6. **Verifique se apareceu na pasta DNA do Google Drive**

---

## 🆘 TROUBLESHOOTING

### **Problema: "redirect_uri_mismatch"**
- Verifique se as URLs de redirecionamento estão corretas no Google Cloud Console
- URLs devem ser exatamente iguais (com/sem barra final)

### **Problema: "invalid_client"**
- Verifique se Client ID e Client Secret estão corretos
- Verifique se as APIs estão habilitadas

### **Problema: "insufficient_scope"**
- Verifique se o scope `https://www.googleapis.com/auth/drive` foi autorizado
- Refaça o processo do OAuth Playground

### **Problema: Arquivos não aparecem no Drive**
- Verifique se o PARENT_FOLDER_ID está correto
- Verifique se a conta que gerou o refresh token tem acesso à pasta
- Verifique os logs no console do navegador

---

## 📞 LINKS DE SUPORTE

- **Google Cloud Console:** https://console.cloud.google.com
- **OAuth Playground:** https://developers.google.com/oauthplayground
- **Google Drive:** https://drive.google.com
- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## 🎯 RESUMO DAS VARIÁVEIS

Após seguir todos os passos, você terá:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx

# Google Drive
GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN=1//04xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_PARENT_FOLDER_ID=1BeMvN-FCm751EO7JXhZi6pdpl5g7EO8q
```

**Configure essas 4 variáveis no Netlify e teste!** 🚀