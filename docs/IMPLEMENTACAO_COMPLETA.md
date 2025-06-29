# DNA Platform - Guia Completo de Implementação

## Visão Geral

O **DNA Platform** (Deep Narrative Analysis) é uma aplicação de análise psicológica baseada no protocolo Clara R., que utiliza 108 perguntas estratégicas para mapear a personalidade humana em 9 domínios fundamentais.

## Arquitetura do Sistema

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **React Router** para navegação
- **Recharts** para gráficos

### Backend/Database
- **Supabase** como backend-as-a-service
- **PostgreSQL** para banco de dados
- **Supabase Auth** para autenticação
- **Supabase Storage** para arquivos de áudio

### Integrações
- **OpenAI API** para transcrição e análise
- **Google Drive API** para backup de arquivos
- **Supabase Edge Functions** para processamento

## Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-sua_chave_openai

# Google Drive API
VITE_GOOGLE_DRIVE_API_KEY=sua_chave_google_drive
VITE_GOOGLE_CLIENT_ID=seu_client_id_google

# Configurações de Ambiente
VITE_APP_ENV=development
VITE_APP_NAME=DNA Platform
VITE_APP_VERSION=1.0.0

# URLs de Áudio
VITE_AUDIO_BASE_URL=https://seu-projeto.supabase.co/storage/v1/object/public/dna-protocol-audio/

# Configurações de Análise
VITE_MAX_RECORDING_DURATION=300
VITE_MIN_RECORDING_DURATION=10
VITE_TOTAL_QUESTIONS=108
```

### 2. Configuração do Supabase

#### 2.1 Criando o Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização ou use uma existente
4. Clique em "New Project"
5. Preencha os dados:
   - **Name**: DNA Platform
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

#### 2.2 Configurando as Tabelas

Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  last_login TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem seus próprios dados
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Criar tabela de sessões de análise
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  current_question INTEGER DEFAULT 1,
  total_questions INTEGER DEFAULT 108,
  final_synthesis TEXT
);

-- Habilitar RLS
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários acessarem suas próprias sessões
CREATE POLICY "Users can access own sessions" ON analysis_sessions
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- Criar tabela de respostas dos usuários
CREATE TABLE user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  transcript_text TEXT,
  audio_duration NUMERIC,
  audio_file_url TEXT,
  analysis_keywords TEXT[] DEFAULT '{}',
  sentiment_score NUMERIC
);

-- Habilitar RLS
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- Política para usuários acessarem suas próprias respostas
CREATE POLICY "Users can access own responses" ON user_responses
  FOR ALL USING (
    session_id IN (
      SELECT id FROM analysis_sessions 
      WHERE user_email = auth.jwt() ->> 'email'
    )
  );

-- Criar índices para performance
CREATE INDEX idx_analysis_sessions_user_email ON analysis_sessions(user_email);
CREATE INDEX idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX idx_user_responses_session_id ON user_responses(session_id);
CREATE INDEX idx_user_responses_question_index ON user_responses(question_index);
```

#### 2.3 Configurando Storage

1. No painel do Supabase, vá para **Storage**
2. Clique em "Create bucket"
3. Nome do bucket: `dna-protocol-audio`
4. Marque como **Public bucket**
5. Clique em "Create bucket"

#### 2.4 Configurando Autenticação

1. Vá para **Authentication > Settings**
2. Em **Site URL**, adicione: `http://localhost:5173` (desenvolvimento)
3. Em **Redirect URLs**, adicione: `http://localhost:5173/**`
4. Desabilite **Enable email confirmations** para desenvolvimento
5. Configure **Email Templates** conforme necessário

### 3. Configuração da OpenAI API

#### 3.1 Obtendo a API Key
1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá para **API Keys**
4. Clique em "Create new secret key"
5. Copie a chave e adicione no arquivo `.env`

#### 3.2 Configurando Billing
1. Vá para **Billing**
2. Adicione um método de pagamento
3. Configure limites de uso conforme necessário

### 4. Configuração do Google Drive API

#### 4.1 Criando o Projeto no Google Cloud
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services > Library**
4. Procure e habilite "Google Drive API"

#### 4.2 Criando Credenciais
1. Vá para **APIs & Services > Credentials**
2. Clique em "Create Credentials" > "API Key"
3. Copie a API Key e adicione no arquivo `.env`
4. Para OAuth (se necessário):
   - Clique em "Create Credentials" > "OAuth client ID"
   - Escolha "Web application"
   - Adicione as URLs autorizadas

### 5. Instalação e Execução

#### 5.1 Instalação das Dependências
```bash
npm install
```

#### 5.2 Configuração do Ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

#### 5.3 Executando em Desenvolvimento
```bash
npm run dev
```

#### 5.4 Build para Produção
```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes de UI base
│   ├── dashboard/       # Componentes do dashboard
│   ├── analysis/        # Componentes da análise
│   ├── history/         # Componentes do histórico
│   └── Layout.tsx       # Layout principal
├── entities/            # Entidades de dados
│   ├── User.ts          # Entidade de usuário
│   ├── AnalysisSession.ts # Entidade de sessão
│   ├── UserResponse.ts  # Entidade de resposta
│   └── all.ts           # Exportações
├── integrations/        # Integrações externas
│   └── Core.ts          # APIs principais
├── lib/                 # Bibliotecas e configurações
│   ├── supabase.ts      # Cliente Supabase
│   └── utils.ts         # Utilitários
├── pages/               # Páginas da aplicação
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── Analysis.tsx     # Página de análise
│   ├── History.tsx      # Histórico de sessões
│   └── Login.tsx        # Página de login
└── utils/               # Utilitários gerais
    └── index.ts
```

## Funcionalidades Principais

### 1. Sistema de Autenticação
- Login/Cadastro com email e senha
- Autenticação via Supabase Auth
- Gerenciamento de sessão
- Perfil de usuário

### 2. Análise DNA (108 Perguntas)
- Reprodução de perguntas em áudio
- Gravação de respostas
- Transcrição automática via OpenAI
- Progresso em tempo real
- Análise psicológica completa

### 3. Dashboard
- Estatísticas de uso
- Sessões recentes
- Gráficos de atividade
- Ações rápidas

### 4. Histórico
- Lista de todas as sessões
- Detalhes de cada resposta
- Filtros e busca
- Exportação de dados

## Protocolo Clara R. - 9 Domínios

1. **Identidade e Autoconsciência** (12 perguntas)
2. **Relacionamentos e Conexões** (12 perguntas)
3. **Emoções e Processamento Interno** (12 perguntas)
4. **Valores e Sistema de Crenças** (12 perguntas)
5. **Propósito e Significado** (12 perguntas)
6. **Processo de Tomada de Decisão** (12 perguntas)
7. **Criatividade e Expressão** (12 perguntas)
8. **Crescimento e Transformação** (12 perguntas)
9. **Visão de Futuro e Legado** (12 perguntas)

## Segurança e Privacidade

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só acessam seus próprios dados
- Políticas de segurança granulares

### Proteção de Dados
- Criptografia em trânsito e em repouso
- Backup automático via Supabase
- Conformidade com LGPD/GDPR

## Monitoramento e Analytics

### Métricas Importantes
- Tempo de resposta por pergunta
- Taxa de conclusão de sessões
- Padrões de uso
- Qualidade das transcrições

### Logs e Debugging
- Logs estruturados
- Error tracking
- Performance monitoring

## Deploy e Produção

### Variáveis de Produção
```env
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://seu-projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_prod
```

### Configurações de Produção
1. Configure domínio personalizado no Supabase
2. Atualize URLs de redirect
3. Configure SSL/TLS
4. Monitore performance e custos

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Supabase
- Verifique as credenciais no `.env`
- Confirme se o projeto está ativo
- Verifique as políticas RLS

#### 2. Problemas de Áudio
- Verifique permissões do navegador
- Teste em diferentes navegadores
- Confirme configuração do Storage

#### 3. Erros de Transcrição
- Verifique API Key da OpenAI
- Confirme limites de uso
- Teste com arquivos menores

## Suporte e Documentação

### Links Úteis
- [Documentação Supabase](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Drive API](https://developers.google.com/drive/api)
- [React Documentation](https://react.dev)

### Contato
Para suporte técnico ou dúvidas sobre implementação, consulte a documentação oficial das APIs utilizadas ou entre em contato com a equipe de desenvolvimento.