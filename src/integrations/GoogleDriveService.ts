// Serviço REAL de Google Drive - DNA UP Platform
export interface GoogleDriveConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  parentFolderId: string
}

export interface DriveUploadResponse {
  fileId: string
  fileName: string
  fileUrl: string
  webViewLink: string
  downloadUrl: string
}

export class GoogleDriveService {
  private config: GoogleDriveConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      refreshToken: import.meta.env.VITE_GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN || '',
      parentFolderId: import.meta.env.VITE_GOOGLE_DRIVE_PARENT_FOLDER_ID || ''
    }

    console.log('🔧 Configurando Google Drive Service...')
    console.log('📁 Parent Folder ID:', this.config.parentFolderId)
    console.log('🔑 Client ID:', this.config.clientId?.substring(0, 20) + '...')
    console.log('🔑 Has Client Secret:', !!this.config.clientSecret)
    console.log('🔑 Has Refresh Token:', !!this.config.refreshToken)
  }

  // Obter access token usando refresh token
  private async getAccessToken(): Promise<string> {
    try {
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken
      }

      console.log('🔄 Renovando access token...')

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao renovar token:', response.status, errorText)
        throw new Error(`Erro ao renovar token: ${response.status}`)
      }

      const data = await response.json()
      
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000
      
      console.log('✅ Access token renovado com sucesso')
      return this.accessToken

    } catch (error) {
      console.error('❌ Erro ao obter access token:', error)
      throw new Error('Falha na autenticação com Google Drive')
    }
  }

  // Criar pasta para o usuário
  private async createUserFolder(userEmail: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken()
      const folderName = `DNA_UP_${userEmail.replace('@', '_').replace(/\./g, '_')}`

      console.log('📁 Criando/verificando pasta do usuário:', folderName)

      // Verificar se a pasta já existe
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and parents in '${this.config.parentFolderId}' and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.files && searchData.files.length > 0) {
          console.log('✅ Pasta do usuário já existe:', searchData.files[0].id)
          return searchData.files[0].id
        }
      }

      // Criar a pasta
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.config.parentFolderId]
        })
      })

      if (!createResponse.ok) {
        throw new Error(`Erro ao criar pasta: ${createResponse.status}`)
      }

      const createData = await createResponse.json()
      console.log('✅ Pasta do usuário criada:', createData.id)
      return createData.id

    } catch (error) {
      console.error('❌ Erro ao criar pasta do usuário:', error)
      throw error
    }
  }

  // Upload de arquivo de áudio
  async uploadAudioFile(
    file: File, 
    userEmail: string, 
    questionIndex: number,
    questionText: string
  ): Promise<DriveUploadResponse> {
    try {
      console.log('🎵 Iniciando upload de áudio para Google Drive...')
      console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'bytes')

      const accessToken = await this.getAccessToken()
      const userFolderId = await this.createUserFolder(userEmail)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `Q${questionIndex.toString().padStart(3, '0')}_AUDIO_${timestamp}.wav`

      const metadata = {
        name: fileName,
        parents: [userFolderId],
        description: `DNA UP - Áudio da Pergunta ${questionIndex}: ${questionText.substring(0, 100)}...`
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', file)

      console.log('📤 Fazendo upload do áudio...')

      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        }
      )

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Erro no upload do áudio:', uploadResponse.status, errorText)
        throw new Error(`Erro no upload do áudio: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      console.log('✅ Áudio enviado com sucesso para Google Drive!')
      console.log('📁 File ID:', uploadData.id)
      console.log('🔗 Link:', uploadData.webViewLink)

      return {
        fileId: uploadData.id,
        fileName: uploadData.name,
        fileUrl: uploadData.webViewLink,
        webViewLink: uploadData.webViewLink,
        downloadUrl: uploadData.webContentLink || uploadData.webViewLink
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
  ): Promise<DriveUploadResponse> {
    try {
      console.log('📝 Enviando transcrição para Google Drive...')

      const accessToken = await this.getAccessToken()
      const userFolderId = await this.createUserFolder(userEmail)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `Q${questionIndex.toString().padStart(3, '0')}_TRANSCRICAO_${timestamp}.txt`
      
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

      const metadata = {
        name: fileName,
        parents: [userFolderId],
        description: `DNA UP - Transcrição da Pergunta ${questionIndex}`
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', blob)

      console.log('📤 Fazendo upload da transcrição...')

      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        }
      )

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Erro no upload da transcrição:', uploadResponse.status, errorText)
        throw new Error(`Erro no upload da transcrição: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      console.log('✅ Transcrição enviada com sucesso para Google Drive!')
      console.log('📁 File ID:', uploadData.id)

      return {
        fileId: uploadData.id,
        fileName: uploadData.name,
        fileUrl: uploadData.webViewLink,
        webViewLink: uploadData.webViewLink,
        downloadUrl: uploadData.webContentLink || uploadData.webViewLink
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
  ): Promise<DriveUploadResponse> {
    try {
      console.log('🤖 Enviando dataset de fine-tuning para Google Drive...')

      const accessToken = await this.getAccessToken()
      const userFolderId = await this.createUserFolder(userEmail)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_UP_FINE_TUNING_DATASET_${timestamp}.jsonl`
      
      // Converter dataset para formato JSONL (cada linha é um JSON)
      const jsonlContent = dataset.map(item => JSON.stringify(item)).join('\n')

      const blob = new Blob([jsonlContent], { type: 'application/jsonl' })

      const metadata = {
        name: fileName,
        parents: [userFolderId],
        description: `DNA UP - Dataset para Fine-tuning TinyLlama - ${dataset.length} exemplos`
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', blob)

      console.log('📤 Fazendo upload do dataset...')

      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        }
      )

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Erro no upload do dataset:', uploadResponse.status, errorText)
        throw new Error(`Erro no upload do dataset: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      console.log('✅ Dataset de fine-tuning enviado com sucesso!')
      console.log('📁 File ID:', uploadData.id)

      return {
        fileId: uploadData.id,
        fileName: uploadData.name,
        fileUrl: uploadData.webViewLink,
        webViewLink: uploadData.webViewLink,
        downloadUrl: uploadData.webContentLink || uploadData.webViewLink
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
  ): Promise<DriveUploadResponse> {
    try {
      console.log('📊 Gerando relatório final completo...')

      const accessToken = await this.getAccessToken()
      const userFolderId = await this.createUserFolder(userEmail)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_UP_RELATORIO_COMPLETO_${timestamp}.txt`
      
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

      const metadata = {
        name: fileName,
        parents: [userFolderId],
        description: `DNA UP - Relatório Completo de Análise Psicológica`
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', blob)

      console.log('📤 Fazendo upload do relatório final...')

      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        }
      )

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Erro no upload do relatório:', uploadResponse.status, errorText)
        throw new Error(`Erro no upload do relatório: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      console.log('✅ Relatório final enviado com sucesso!')
      console.log('📁 File ID:', uploadData.id)

      return {
        fileId: uploadData.id,
        fileName: uploadData.name,
        fileUrl: uploadData.webViewLink,
        webViewLink: uploadData.webViewLink,
        downloadUrl: uploadData.webContentLink || uploadData.webViewLink
      }

    } catch (error) {
      console.error('❌ Erro ao gerar relatório final:', error)
      throw new Error(`Falha ao gerar relatório: ${error.message}`)
    }
  }

  // Verificar se está configurado
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.refreshToken &&
      this.config.parentFolderId
    )
  }

  // Info de configuração
  getConfigInfo() {
    return {
      hasClientId: !!this.config.clientId,
      hasClientSecret: !!this.config.clientSecret,
      hasRefreshToken: !!this.config.refreshToken,
      hasParentFolderId: !!this.config.parentFolderId,
      isConfigured: this.isConfigured()
    }
  }
}

// Instância singleton
export const googleDriveService = new GoogleDriveService()
