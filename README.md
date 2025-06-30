# DNA UP - Deep Narrative Analysis Platform

## 🧬 Sobre o Projeto

O **DNA UP** é uma plataforma inovadora de análise psicológica profunda baseada no protocolo Clara R., que utiliza 108 perguntas estratégicas distribuídas em 9 domínios fundamentais da personalidade humana.

## 🚀 Funcionalidades

- ✅ **Autenticação Segura**: Login via Google OAuth ou email/senha
- ✅ **108 Perguntas Estratégicas**: Baseadas no protocolo Clara R.
- ✅ **Gravação de Áudio**: Respostas em áudio com transcrição automática
- ✅ **Análise por IA**: Processamento psicológico avançado
- ✅ **Relatórios Detalhados**: Análise completa da personalidade
- ✅ **Dashboard Interativo**: Acompanhamento de progresso
- ✅ **Histórico Completo**: Todas as sessões e respostas

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Vite** como build tool

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security (RLS)**
- **Triggers automáticos**

### Integrações
- **Deepgram API** - Transcrição de voz
- **OpenAI API** - Análise psicológica
- **Google OAuth** - Autenticação
- **Google Drive API** - Armazenamento

## 📋 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://jesvvdegtmbbuiuqwkdd.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# APIs
VITE_OPENAI_API_KEY=sk-proj-sua_chave_openai
VITE_DEEPGRAM_API_KEY=sua_chave_deepgram

# Google
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
VITE_GOOGLE_DRIVE_API_KEY=sua_google_drive_api_key

# App
VITE_APP_NAME=DNA UP
VITE_APP_ENV=development
```

### 2. Banco de Dados

Execute a migração no Supabase SQL Editor:

```sql
-- Copie e execute o conteúdo de supabase/migrations/create_complete_schema.sql
```

### 3. Configuração do Google OAuth

1. Vá para [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione existente
3. Habilite Google OAuth API
4. Configure URLs autorizadas:
   - `http://localhost:5173/auth/callback` (desenvolvimento)
   - `https://seu-dominio.com/auth/callback` (produção)

### 4. Configuração do Supabase

1. Vá para **Authentication > Providers**
2. Habilite **Google**
3. Configure Client ID e Client Secret
4. Adicione URLs de redirect

## 🔗 Links Importantes

### Supabase Dashboard
- **URL**: https://supabase.com/dashboard/project/jesvvdegtmbbuiuqwkdd
- **Database**: https://supabase.com/dashboard/project/jesvvdegtmbbuiuqwkdd/editor
- **Auth**: https://supabase.com/dashboard/project/jesvvdegtmbbuiuqwkdd/auth/users
- **Storage**: https://supabase.com/dashboard/project/jesvvdegtmbbuiuqwkdd/storage/buckets

### APIs Externas
- **Deepgram**: https://console.deepgram.com
- **OpenAI**: https://platform.openai.com
- **Google Cloud**: https://console.cloud.google.com

## 🏃‍♂️ Executar o Projeto

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📊 Estrutura do Banco

### Tabelas Principais

1. **users** - Perfis de usuários
2. **analysis_sessions** - Sessões de análise
3. **user_responses** - Respostas gravadas

### Segurança

- **RLS habilitado** em todas as tabelas
- **Políticas granulares** de acesso
- **Triggers automáticos** para estatísticas

## 🎯 Protocolo Clara R.

### 9 Domínios de Análise

1. **Identidade & Narrativa** (12 perguntas)
2. **Valores & Princípios** (12 perguntas)
3. **Crenças Sobre Si** (12 perguntas)
4. **Crenças Sobre o Mundo/Outros** (12 perguntas)
5. **Experiências Formativas** (12 perguntas)
6. **Padrões Emocionais** (12 perguntas)
7. **Cognição & Decisão** (12 perguntas)
8. **Contradições & Pontos Cegos** (12 perguntas)
9. **Ambições & Medos** (12 perguntas)

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de API Key**: Verifique se todas as chaves estão configuradas no `.env`
2. **Erro de CORS**: Configure URLs corretas no Google Cloud Console
3. **Erro de RLS**: Verifique se as políticas estão ativas no Supabase
4. **Erro de Transcrição**: Verifique a chave do Deepgram

### Logs Úteis

```bash
# Ver logs do Supabase
console.log('Supabase connection:', supabase)

# Ver logs de autenticação
console.log('Auth state:', session)

# Ver logs de API
console.log('API response:', response)
```

## 📞 Suporte

Para suporte técnico ou dúvidas:

1. Verifique a documentação das APIs
2. Consulte os logs do navegador
3. Teste as conexões individualmente
4. Verifique as configurações de ambiente

---

**DNA UP** - Transformando narrativas em insights profundos 🧬✨