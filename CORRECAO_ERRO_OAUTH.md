# 🚨 CORREÇÃO DO ERRO OAUTH - DNA UP

## ❌ ERRO ATUAL
```
Acesso bloqueado: a solicitação desse app é inválida
Error 400: redirect_uri_mismatch
```

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ **CORRIGIR URLs NO GOOGLE CLOUD CONSOLE**

**🔗 Acesse:** https://console.cloud.google.com/apis/credentials

**📝 Passos:**
1. Encontre suas credenciais OAuth 2.0
2. Clique no nome da credencial para editar
3. **SUBSTITUA as URLs por estas EXATAS:**

**Origens JavaScript autorizadas:**
```
https://tangerine-mermaid-d19ca7.netlify.app
http://localhost:5173
```

**URIs de redirecionamento autorizados:**
```
https://tangerine-mermaid-d19ca7.netlify.app/auth/callback
http://localhost:5173/auth/callback
```

4. Clique em "Salvar"
5. **Aguarde 5-10 minutos** para as mudanças se propagarem

### 2️⃣ **VERIFICAR CONFIGURAÇÃO SUPABASE**

**🔗 Acesse:** https://supabase.com/dashboard/project/nzsyuhewavijzszlgshx/auth/settings

**📝 Verificar:**
1. **Site URL:** `https://tangerine-mermaid-d19ca7.netlify.app`
2. **Redirect URLs:** 
   ```
   https://tangerine-mermaid-d19ca7.netlify.app/**
   http://localhost:5173/**
   ```

### 3️⃣ **OBTER REFRESH TOKEN CORRETAMENTE**

**🔗 Acesse:** https://developers.google.com/oauthplayground

**📝 Configuração correta:**
1. **Clique na engrenagem (⚙️) no canto superior direito**
2. **Marque:** "Use your own OAuth credentials"
3. **OAuth Client ID:** Cole seu Client ID
4. **OAuth Client secret:** Cole seu Client Secret
5. **OAuth flow:** Server-side
6. **Access token location:** Authorization header w/ Bearer prefix

**📝 Autorização:**
1. **Step 1:** Selecione `https://www.googleapis.com/auth/drive`
2. **Clique:** "Authorize APIs"
3. **Faça login** com a conta Google que será o admin
4. **Autorize** todas as permissões
5. **Step 2:** Clique "Exchange authorization code for tokens"
6. **COPIE:** O "Refresh token" que aparecerá

### 4️⃣ **TESTAR CONFIGURAÇÃO**

**🔗 Teste simples:** https://developers.google.com/oauthplayground

1. Com o refresh token obtido, clique em "Step 3"
2. **Request URI:** `https://www.googleapis.com/drive/v3/files`
3. **HTTP Method:** GET
4. Clique "Send the request"
5. Se retornar uma lista de arquivos = ✅ Funcionando!

---

## 🔧 CONFIGURAÇÃO FINAL NO NETLIFY

**🔗 Acesse:** https://app.netlify.com/sites/tangerine-mermaid-d19ca7/settings/env

**Adicione estas variáveis:**
```env
GOOGLE_CLIENT_SECRET=GOCSPX-[sua_chave_secreta]
GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN=1//04[seu_refresh_token]
GOOGLE_DRIVE_PARENT_FOLDER_ID=[id_da_pasta_dna]
VITE_GOOGLE_CLIENT_ID=[seu_client_id].apps.googleusercontent.com
```

**Após adicionar, clique em "Deploy" para aplicar as mudanças.**

---

## 🎯 TESTE FINAL

1. **Aguarde 10 minutos** após todas as configurações
2. **Acesse:** https://tangerine-mermaid-d19ca7.netlify.app
3. **Teste o login com Google**
4. **Grave uma resposta de teste**
5. **Verifique se aparece na pasta DNA do Google Drive**

---

## ⚠️ DICAS IMPORTANTES

- **Sempre use HTTPS** em produção
- **URLs devem ser EXATAMENTE iguais** (cuidado com barras finais)
- **Aguarde propagação** das mudanças (5-10 minutos)
- **Use a mesma conta Google** para gerar o refresh token e acessar o Drive
- **Teste primeiro no OAuth Playground** antes de usar na aplicação

Se ainda tiver problemas, me envie screenshots dos erros específicos! 🚀