// Serviço REAL de Supabase Storage - DNA UP Platform
import { supabase } from '@/lib/supabase'

export interface SupabaseStorageConfig {
  bucketName: string
  baseUrl: string
}

export interface StorageUploadResponse {
  fileId: string
  fileName: string
  fileUrl: string
  publicUrl: string
  downloadUrl: string
}

export class SupabaseStorageService {
  private config: SupabaseStorageConfig

  constructor() {
    this.config = {
      bucketName: 'dna-protocol-files', // Bucket principal para todos os arquivos
      baseUrl: import.meta.env.VITE_SUPABASE_URL || ''
    }

    console.log('🔧 Configurando Supabase Storage Service...')
    console.log('🪣 Bucket Name:', this.config.bucketName)
    console.log('🔗 Base URL:', this.config.baseUrl?.substring(0, 30) + '...')
  }

  // Criar pasta para o usuário (estrutura de pastas no Storage)
  private getUserFolderPath(userEmail: string): string {
    const sanitizedEmail = userEmail.replace('@', '_').replace(/\./g, '_')
    return `users/${sanitizedEmail}`
  }

  // Upload de arquivo de áudio
  async uploadAudioFile(
    file: File, 
    userEmail: string, 
    questionIndex: number,
    questionText: string
  ): Promise<StorageUploadResponse> {
    try {
      console.log('🎵 Iniciando upload de áudio para Supabase Storage...')
      console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'bytes')

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `Q${questionIndex.toString().padStart(3, '0')}_AUDIO_${timestamp}.wav`
      const filePath = `${userFolderPath}/audio/${fileName}`

      console.log('📤 Fazendo upload do áudio para:', filePath)

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'audio/wav'
        })

      if (error) {
        console.error('❌ Erro no upload do áudio:', error)
        throw new Error(`Erro no upload do áudio: ${error.message}`)
      }

      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(this.config.bucketName)
        .getPublicUrl(filePath)

      console.log('✅ Áudio enviado com sucesso para Supabase Storage!')
      console.log('📁 Path:', data.path)
      console.log('🔗 URL:', publicUrlData.publicUrl)

      return {
        fileId: data.path,
        fileName: fileName,
        fileUrl: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        downloadUrl: publicUrlData.publicUrl
      }

    } catch (error) {
      console.error('❌ Erro no upload do áudio:', error)
      throw new Error(`Falha no upload do áudio: ${error.message}`)
    }
  }

  // Upload de transcrição
  async uploadTranscription(
    transcription: string,
    userEmail: string,
    questionIndex: number,
    questionText: string
  ): Promise<StorageUploadResponse> {
    try {
      console.log('📝 Enviando transcrição para Supabase Storage...')

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `Q${questionIndex.toString().padStart(3, '0')}_TRANSCRICAO_${timestamp}.txt`
      const filePath = `${userFolderPath}/transcriptions/${fileName}`
      
      const content = `DNA UP - Análise Narrativa Profunda
Data: ${new Date().toLocaleString('pt-BR')}
Usuário: ${userEmail}
Pergunta ${questionIndex}: ${questionText}

TRANSCRIÇÃO:
${transcription}

---
Gerado automaticamente pelo DNA UP Platform
`

      const blob = new Blob([content], { type: 'text/plain; charset=utf-8' })

      console.log('📤 Fazendo upload da transcrição para:', filePath)

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'text/plain'
        })

      if (error) {
        console.error('❌ Erro no upload da transcrição:', error)
        throw new Error(`Erro no upload da transcrição: ${error.message}`)
      }

      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(this.config.bucketName)
        .getPublicUrl(filePath)

      console.log('✅ Transcrição enviada com sucesso para Supabase Storage!')
      console.log('📁 Path:', data.path)

      return {
        fileId: data.path,
        fileName: fileName,
        fileUrl: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        downloadUrl: publicUrlData.publicUrl
      }

    } catch (error) {
      console.error('❌ Erro ao enviar transcrição:', error)
      throw new Error(`Falha no upload da transcrição: ${error.message}`)
    }
  }

  // Upload do dataset de fine-tuning
  async uploadFineTuningDataset(
    dataset: any,
    userEmail: string
  ): Promise<StorageUploadResponse> {
    try {
      console.log('🤖 Enviando dataset de fine-tuning para Supabase Storage...')

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_UP_FINE_TUNING_DATASET_${timestamp}.jsonl`
      const filePath = `${userFolderPath}/datasets/${fileName}`
      
      // Converter dataset para formato JSONL (cada linha é um JSON)
      const jsonlContent = dataset.map(item => JSON.stringify(item)).join('\n')

      const blob = new Blob([jsonlContent], { type: 'application/jsonl' })

      console.log('📤 Fazendo upload do dataset para:', filePath)

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/jsonl'
        })

      if (error) {
        console.error('❌ Erro no upload do dataset:', error)
        throw new Error(`Erro no upload do dataset: ${error.message}`)
      }

      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(this.config.bucketName)
        .getPublicUrl(filePath)

      console.log('✅ Dataset de fine-tuning enviado com sucesso!')
      console.log('📁 Path:', data.path)

      return {
        fileId: data.path,
        fileName: fileName,
        fileUrl: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        downloadUrl: publicUrlData.publicUrl
      }

    } catch (error) {
      console.error('❌ Erro ao enviar dataset:', error)
      throw new Error(`Falha no upload do dataset: ${error.message}`)
    }
  }

  // Upload do relatório final
  async uploadFinalReport(
    userEmail: string,
    analysisData: any,
    responses: any[]
  ): Promise<StorageUploadResponse> {
    try {
      console.log('📊 Gerando relatório final completo...')

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_UP_RELATORIO_COMPLETO_${timestamp}.txt`
      const filePath = `${userFolderPath}/reports/${fileName}`
      
      const content = `
# DNA UP - RELATÓRIO DE ANÁLISE PSICOLÓGICA COMPLETA

**Data:** ${new Date().toLocaleString('pt-BR')}
**Usuário:** ${userEmail}
**Total de Respostas:** ${responses.length}
**Protocolo:** Clara R. - 108 Perguntas Estratégicas

---

## ANÁLISE PSICOLÓGICA

${analysisData.analysis_document || 'Análise em processamento...'}

---

## RESUMO EXECUTIVO

${analysisData.personality_summary || 'Resumo em processamento...'}

---

## INSIGHTS PRINCIPAIS

${analysisData.key_insights?.map((insight, i) => `${i + 1}. ${insight}`).join('\n') || 'Insights em processamento...'}

---

## PADRÕES COMPORTAMENTAIS

${analysisData.behavioral_patterns?.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n') || 'Padrões em processamento...'}

---

## RECOMENDAÇÕES

${analysisData.recommendations || 'Recomendações em processamento...'}

---

## ANÁLISE POR DOMÍNIO

${Object.entries(analysisData.domain_analysis || {}).map(([domain, score]) => `**${domain}:** ${score}`).join('\n')}

---

## RESPOSTAS DETALHADAS

${responses.map((response, i) => `
### PERGUNTA ${response.question_index}
**Domínio:** ${response.question_domain}
**Pergunta:** ${response.question_text}
**Resposta:** ${response.transcript_text || 'Transcrição não disponível'}
**Duração:** ${Math.round(response.audio_duration || 0)}s
**Data:** ${new Date(response.created_at).toLocaleString('pt-BR')}

---
`).join('\n')}

---

**Relatório gerado automaticamente pelo DNA UP Platform**
**Deep Narrative Analysis - Protocolo Clara R.**
**© 2024 DNA UP - Todos os direitos reservados**
`

      const blob = new Blob([content], { type: 'text/plain; charset=utf-8' })

      console.log('📤 Fazendo upload do relatório final para:', filePath)

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'text/plain'
        })

      if (error) {
        console.error('❌ Erro no upload do relatório:', error)
        throw new Error(`Erro no upload do relatório: ${error.message}`)
      }

      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(this.config.bucketName)
        .getPublicUrl(filePath)

      console.log('✅ Relatório final enviado com sucesso!')
      console.log('📁 Path:', data.path)

      return {
        fileId: data.path,
        fileName: fileName,
        fileUrl: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        downloadUrl: publicUrlData.publicUrl
      }

    } catch (error) {
      console.error('❌ Erro ao gerar relatório final:', error)
      throw new Error(`Falha ao gerar relatório: ${error.message}`)
    }
  }

  // Verificar se está configurado
  isConfigured(): boolean {
    return !!(
      this.config.bucketName &&
      this.config.baseUrl
    )
  }

  // Info de configuração
  getConfigInfo() {
    return {
      hasBucketName: !!this.config.bucketName,
      hasBaseUrl: !!this.config.baseUrl,
      isConfigured: this.isConfigured()
    }
  }

  // Listar arquivos de um usuário
  async listUserFiles(userEmail: string, folder?: string): Promise<any[]> {
    try {
      const userFolderPath = this.getUserFolderPath(userEmail)
      const searchPath = folder ? `${userFolderPath}/${folder}` : userFolderPath

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .list(searchPath)

      if (error) {
        console.error('❌ Erro ao listar arquivos:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error)
      return []
    }
  }

  // Deletar arquivo
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.config.bucketName)
        .remove([filePath])

      if (error) {
        console.error('❌ Erro ao deletar arquivo:', error)
        return false
      }

      console.log('✅ Arquivo deletado com sucesso:', filePath)
      return true
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error)
      return false
    }
  }

  // Obter URL de download de um arquivo
  async getDownloadUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(this.config.bucketName)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('❌ Erro ao obter URL de download:', error)
      return null
    }
  }
}

// Instância singleton
export const supabaseStorageService = new SupabaseStorageService()

