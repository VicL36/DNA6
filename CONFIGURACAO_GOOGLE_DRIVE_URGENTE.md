# 🚨 CONFIGURAÇÃO GOOGLE DRIVE URGENTE - DNA UP

## ✅ PROBLEMA IDENTIFICADO
Os arquivos não estão sendo enviados para o Google Drive porque **faltam as credenciais de autenticação** no Railway.

## 🔧 SOLUÇÃO URGENTE

### 1. **Adicione estas 3 variáveis no Railway Dashboard:**

```env
GOOGLE_CLIENT_SECRET=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
GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN=1//04J8fS1JSLPmxCgYIARAAGAQSNwF-L9IrunDlPllpDIs8lhC4hPQDA4vsTcd4grNSYrL6-jCA3PZWCnNkfrgI0AB-9bgMwtK-ZG4
GOOGLE_DRIVE_PARENT_FOLDER_ID=1BeMvN-FCm751EO7JXhZi6pdpl5g7EO8q
```

### 2. **Como adicionar no Railway:**
1. Acesse: https://railway.app/dashboard
2. Selecione seu projeto DNA UP
3. Vá em "Variables"
4. Adicione cada variável uma por uma
5. Clique em "Deploy"

### 3. **Resultado esperado após configurar:**

Quando alguém gravar uma resposta, os arquivos aparecerão automaticamente na sua pasta "DNA" do Google Drive organizados assim:

```
📁 DNA/
├── 📁 DNA_UP_usuario_gmail_com/
│   ├── 🎵 Q001_AUDIO_2024-12-30T10-30-00.wav
│   ├── 📝 Q001_TRANSCRICAO_2024-12-30T10-30-00.txt
│   ├── 🎵 Q002_AUDIO_2024-12-30T10-35-00.wav
│   ├── 📝 Q002_TRANSCRICAO_2024-12-30T10-35-00.txt
│   ├── 📊 DNA_UP_RELATORIO_COMPLETO_2024-12-30.txt
│   └── 🤖 DNA_UP_FINE_TUNING_DATASET_2024-12-30.jsonl
```

## 🎯 NOVIDADES IMPLEMENTADAS:

### ✅ **PRIORIDADE 1 - Upload Google Drive:**
- ✅ Upload REAL de áudios para Google Drive
- ✅ Upload REAL de transcrições para Google Drive
- ✅ Organização automática em pastas por usuário
- ✅ Nomes de arquivos estruturados e únicos

### ✅ **PRIORIDADE 2 - Dataset Fine-tuning:**
- ✅ Geração automática de dataset para TinyLlama
- ✅ Formato JSONL otimizado para fine-tuning
- ✅ Exemplos de análise psicológica
- ✅ Dados preparados para clonagem de voz
- ✅ Metadados completos para treinamento

## 🤖 **DATASET GERADO INCLUI:**
1. **Exemplos de análise de respostas** (instruction/input/output)
2. **Geração de insights psicológicos**
3. **Recomendações personalizadas**
4. **Análise por domínio**
5. **Síntese psicológica completa**
6. **Predições comportamentais**

## 🎤 **PREPARAÇÃO PARA CLONAGEM DE VOZ:**
- ✅ Seleção automática dos melhores áudios
- ✅ Metadados de qualidade de áudio
- ✅ Marcadores emocionais extraídos
- ✅ Transcrições alinhadas com áudios

## 🚀 **TESTE AGORA:**
1. Configure as 3 variáveis no Railway
2. Faça uma gravação de teste
3. Verifique se os arquivos aparecem na pasta "DNA" do Google Drive
4. Ao completar 108 perguntas, o dataset será gerado automaticamente

**Configure essas 3 variáveis no Railway e teste fazendo uma gravação!** 🚀