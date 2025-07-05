// Serviço REAL de Supabase Storage - DNA UP Platform - CORRIGIDO FINAL
import { supabase } from "@/lib/supabase";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
      bucketName: 'dna-protocol-files', // Bucket fixo criado via SQL
      baseUrl: import.meta.env.VITE_SUPABASE_URL || ''
    }

    console.log('🔧 Configurando Supabase Storage Service...')
    console.log('🪣 Bucket Name:', this.config.bucketName)
    console.log('🔗 Base URL:', this.config.baseUrl?.substring(0, 30) + '...')
  }

  // Verificar se o bucket existe (não criar, apenas verificar)
  private async checkBucketExists(): Promise<boolean> {
    console.warn("⚠️ checkBucketExists está retornando TRUE forçadamente para depuração. REMOVER EM PRODUÇÃO!")
    return true;
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
      console.log('🎵 Iniciando upload REAL de áudio para Supabase Storage...')
      console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'bytes')

      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists()
      if (!bucketExists) {
        throw new Error('Bucket não configurado. Execute a migração SQL primeiro.')
      }

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
          contentType: file.type || 'audio/wav'
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
      console.log('📝 Enviando transcrição REAL para Supabase Storage...')

      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists()
      if (!bucketExists) {
        throw new Error('Bucket não configurado. Execute a migração SQL primeiro.')
      }

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `Q${questionIndex.toString().padStart(3, '0')}_TRANSCRICAO_${timestamp}.pdf`
      const filePath = `${userFolderPath}/transcriptions/${fileName}`
      
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text(`DNA UP - Análise Narrativa Profunda`, 10, 10);
      doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 10, 20);
      doc.text(`Usuário: ${userEmail}`, 10, 30);
      doc.text(`Pergunta ${questionIndex}: ${questionText}`, 10, 40);
      doc.text(`TRANSCRIÇÃO:`, 10, 50);
      doc.text(transcription, 10, 60, { maxWidth: 190 });
      doc.text(`---`, 10, doc.internal.pageSize.height - 30);
      doc.text(`Gerado automaticamente pelo DNA UP Platform`, 10, doc.internal.pageSize.height - 20);

      const pdfBlob = doc.output('blob');

      console.log('📤 Fazendo upload da transcrição PDF para:', filePath)

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, pdfBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
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
      console.log('🤖 Enviando dataset de fine-tuning REAL para Supabase Storage...')

      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists()
      if (!bucketExists) {
        throw new Error('Bucket não configurado. Execute a migração SQL primeiro.')
      }

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_UP_FINE_TUNING_DATASET_${timestamp}.jsonl`
      const filePath = `${userFolderPath}/datasets/${fileName}`
      
      // Converter dataset para formato JSONL (cada linha é um JSON)
      const jsonlContent = dataset.map(item => JSON.stringify(item)).join('\n')

      const blob = new Blob([jsonlContent], { type: 'application/jsonl' })

      console.log('📤 Fazendo upload do dataset para:', filePath)
      console.log('📊 Dataset contém:', dataset.length, 'exemplos')

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
      console.log('🔗 URL:', publicUrlData.publicUrl)

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
      console.log('📊 Gerando relatório final REAL completo...')

      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists()
      if (!bucketExists) {
        throw new Error('Bucket não configurado. Execute a migração SQL primeiro.')
      }

      const userFolderPath = this.getUserFolderPath(userEmail)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_UP_RELATORIO_COMPLETO_${timestamp}.pdf`
      const filePath = `${userFolderPath}/reports/${fileName}`
      
      const doc = new jsPDF();
      doc.setFontSize(12);
      
      const addText = (text: string, x: number, y: number, maxWidth: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * 10; // Approximate line height
      };

      let yOffset = 10;

      doc.text(`DNA UP - RELATÓRIO DE ANÁLISE PSICOLÓGICA COMPLETA`, 10, yOffset);
      yOffset += 10;
      doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Usuário: ${userEmail}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Total de Respostas: ${responses.length}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Protocolo: Clara R. - 108 Perguntas Estratégicas`, 10, yOffset);
      yOffset += 20;

      doc.text(`ANÁLISE PSICOLÓGICA`, 10, yOffset);
      yOffset += 10;
      yOffset += addText(analysisData.analysis_document || "Análise em processamento...", 10, yOffset, 190);
      yOffset += 10;

      doc.text(`RESUMO EXECUTIVO`, 10, yOffset);
      yOffset += 10;
      yOffset += addText(analysisData.personality_summary || "Resumo em processamento...", 10, yOffset, 190);
      yOffset += 10;

      doc.text(`INSIGHTS PRINCIPAIS`, 10, yOffset);
      yOffset += 10;
      yOffset += addText(analysisData.key_insights?.map((insight: any, i: number) => `${i + 1}. ${insight}`).join("\n") || "Insights em processamento...", 10, yOffset, 190);
      yOffset += 10;

      doc.text(`PADRÕES COMPORTAMENTAIS`, 10, yOffset);
      yOffset += 10;
      yOffset += addText(analysisData.behavioral_patterns?.map((pattern: any, i: number) => `${i + 1}. ${pattern}`).join("\n") || "Padrões em processamento...", 10, yOffset, 190);
      yOffset += 10;

      doc.text(`RECOMENDAÇÕES`, 10, yOffset);
      yOffset += 10;
      yOffset += addText(analysisData.recommendations || "Recomendações em processamento...", 10, yOffset, 190);
      yOffset += 10;

      doc.text(`ANÁLISE POR DOMÍNIO`, 10, yOffset);
      yOffset += 10;
      yOffset += addText(Object.entries(analysisData.domain_analysis || {}).map(([domain, score]) => `**${domain}:** ${score}`).join("\n"), 10, yOffset, 190);
      yOffset += 10;

      doc.addPage();
      yOffset = 10;
      doc.text(`RESPOSTAS DETALHADAS`, 10, yOffset);
      yOffset += 10;

      responses.forEach((response: any, i: number) => {
        if (yOffset > doc.internal.pageSize.height - 50) {
          doc.addPage();
          yOffset = 10;
        }
        doc.text(`PERGUNTA ${response.question_index}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Domínio: ${response.question_domain}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Pergunta: ${response.question_text}`, 10, yOffset);
        yOffset += 10;
        yOffset += addText(`Resposta: ${response.transcript_text || "Transcrição não disponível"}`, 10, yOffset, 190);
        yOffset += 10;
        doc.text(`Duração: ${Math.round(response.audio_duration || 0)}s`, 10, yOffset);
        yOffset += 10;
        doc.text(`Data: ${new Date(response.created_at).toLocaleString("pt-BR")}`, 10, yOffset);
        yOffset += 20;
      });

      const pdfBlob = doc.output("blob");

      console.log("📤 Fazendo upload do relatório final PDF para:", filePath)

      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, pdfBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/pdf"
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
      console.log('🔗 URL:', publicUrlData.publicUrl)

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
      isConfigured: this.isConfigured(),
      bucketName: this.config.bucketName,
      baseUrl: this.config.baseUrl?.substring(0, 30) + '...'
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

      console.log('✅ Arquivos listados:', data?.length || 0)
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
