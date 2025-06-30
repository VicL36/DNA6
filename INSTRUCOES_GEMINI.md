# 🧠 CONFIGURAÇÃO GEMINI API - DNA UP

## ✅ GEMINI vs OpenAI

O **DNA UP** usa **GEMINI** (Google AI) para análise psicológica, não OpenAI!

### Por que Gemini?
- ✅ **Gratuito** até 60 requests/minuto
- ✅ **Multilíngue** nativo (português)
- ✅ **Contexto longo** (até 32k tokens)
- ✅ **Análise profunda** de texto
- ✅ **Sem necessidade de cartão** para começar

---

## 🔧 COMO CONFIGURAR GEMINI

### PASSO 1: Obter API Key

1. **Acesse**: https://makersuite.google.com/app/apikey
2. **Faça login** com conta Google
3. **Clique**: "Create API Key"
4. **Selecione**: Projeto existente ou crie novo
5. **Copie** a chave gerada

### PASSO 2: Adicionar no .env

```env
VITE_GEMINI_API_KEY=SUA_CHAVE_GEMINI_AQUI
```

### PASSO 3: Testar

```bash
npm run dev
```

---

## 🎯 FUNCIONALIDADES GEMINI NO DNA UP

### 1. **Análise Psicológica Completa**
- Processa 108 respostas do protocolo Clara R.
- Identifica padrões de personalidade
- Gera insights profundos

### 2. **Relatório Estruturado**
- Perfil geral da personalidade
- Características principais
- Padrões comportamentais
- Recomendações personalizadas

### 3. **Análise por Domínios**
- 9 domínios psicológicos
- Pontuação de desenvolvimento
- Insights específicos por área

---

## 🔗 LINKS IMPORTANTES

### Gemini AI
- **API Keys**: https://makersuite.google.com/app/apikey
- **Documentação**: https://ai.google.dev/docs
- **Playground**: https://makersuite.google.com/app/prompts/new_chat
- **Pricing**: https://ai.google.dev/pricing

### Alternativas (se necessário)
- **OpenAI**: https://platform.openai.com (pago)
- **Anthropic**: https://console.anthropic.com (pago)
- **Cohere**: https://dashboard.cohere.ai (freemium)

---

## 🚨 TROUBLESHOOTING

### Erro: "API key not valid"
- Verificar se copiou a chave completa
- Regenerar nova chave se necessário
- Verificar se projeto está ativo

### Erro: "Quota exceeded"
- Gemini tem limite de 60 requests/minuto
- Aguardar 1 minuto e tentar novamente
- Considerar upgrade se necessário

### Erro: "Safety settings"
- Gemini tem filtros de segurança
- Ajustar prompt se muito sensível
- Usar linguagem mais neutra

---

## 📊 EXEMPLO DE ANÁLISE GEMINI

```
# Análise Psicológica - DNA UP

## Perfil Geral
Personalidade introspectiva com forte orientação para 
crescimento pessoal e autenticidade...

## Características Principais
- Autoconhecimento elevado
- Comunicação autêntica
- Orientação para crescimento
- Sensibilidade emocional

## Recomendações
Continue investindo em práticas de autoconhecimento...
```

---

## ✅ CHECKLIST GEMINI

- [ ] Conta Google criada
- [ ] API key obtida em makersuite.google.com
- [ ] Chave adicionada no .env
- [ ] Teste de conexão realizado
- [ ] Análise funcionando
- [ ] Relatórios sendo gerados

---

**🧠 Gemini AI + DNA UP = Análise Psicológica Poderosa!**