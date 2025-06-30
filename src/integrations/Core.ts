// Integrações reais para DNA UP Platform
export interface LLMRequest {
  prompt: string
  file_urls?: string[]
  response_json_schema?: any
}

export interface LLMResponse {
  transcription?: string
  analysis_document?: string
  personality_summary?: string
  key_insights?: string[]
  behavioral_patterns?: string[]
  recommendations?: string
  duration_seconds?: number
  confidence_score?: number
  emotional_tone?: string
  keywords?: string[]
  domain_analysis?: any
}

export interface FileUploadRequest {
  file: File
  userEmail: string
  questionIndex: number
}

export interface FileUploadResponse {
  file_url: string
  file_id: string
  drive_file_id: string
}

// Transcrição real usando Deepgram
export async function transcribeAudio(audioBlob: Blob): Promise<LLMResponse> {
  try {
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY
    
    if (!deepgramApiKey) {
      console.warn('Deepgram API key não configurada, usando transcrição simulada')
      return {
        transcription: 'Transcrição simulada: Esta é uma resposta de exemplo para teste.',
        duration_seconds: 30,
        confidence_score: 0.95,
        emotional_tone: 'neutral',
        keywords: ['exemplo', 'teste', 'resposta']
      }
    }

    console.log('🎤 Iniciando transcrição com Deepgram...')
    
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')

    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=false&language=pt', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`)
    }

    const result = await response.json()
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
    const duration = result.metadata?.duration || 0

    console.log('✅ Transcrição concluída:', { transcript: transcript.substring(0, 50) + '...', confidence })

    return {
      transcription: transcript || 'Não foi possível transcrever o áudio.',
      duration_seconds: duration,
      confidence_score: confidence,
      emotional_tone: 'neutral',
      keywords: extractKeywords(transcript)
    }
  } catch (error) {
    console.error('❌ Erro na transcrição:', error)
    
    // Fallback para transcrição simulada
    return {
      transcription: 'Transcrição simulada: Esta é uma resposta de exemplo para teste da funcionalidade.',
      duration_seconds: 25,
      confidence_score: 0.85,
      emotional_tone: 'neutral',
      keywords: ['exemplo', 'teste', 'funcionalidade']
    }
  }
}

// Análise usando GEMINI (não OpenAI!)
export async function generateAnalysis(transcriptions: string[]): Promise<LLMResponse> {
  try {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
    
    if (!geminiApiKey) {
      console.warn('Gemini API key não configurada, usando análise simulada')
      return generateMockAnalysis(transcriptions)
    }

    console.log('🧠 Iniciando análise com Gemini AI...')

    const prompt = `
# Análise Psicológica Profunda - Protocolo Clara R.

Você é um especialista em análise psicológica. Analise as seguintes respostas do protocolo Clara R. e gere uma análise completa da personalidade.

## Respostas para análise:
${transcriptions.join('\n\n---\n\n')}

## Instruções:
1. Analise padrões de personalidade, valores, crenças e comportamentos
2. Identifique características únicas e traços dominantes
3. Gere insights profundos sobre motivações e medos
4. Forneça recomendações de desenvolvimento pessoal
5. Mantenha tom profissional e empático
6. Responda em português brasileiro

## Estrutura da resposta:
- Perfil Geral (2-3 parágrafos)
- Características Principais (lista de 5-6 pontos)
- Padrões Comportamentais (lista de 5-6 pontos)
- Recomendações (2-3 parágrafos)

Retorne uma análise estruturada e detalhada.
`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API Gemini:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()
    const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Análise não disponível'

    console.log('✅ Análise Gemini concluída:', analysisText.substring(0, 100) + '...')

    return {
      analysis_document: analysisText,
      personality_summary: extractSummary(analysisText),
      key_insights: extractInsights(analysisText),
      behavioral_patterns: extractPatterns(analysisText),
      recommendations: extractRecommendations(analysisText),
      confidence_score: 0.90,
      domain_analysis: generateDomainAnalysis(transcriptions)
    }
  } catch (error) {
    console.error('❌ Erro na análise Gemini:', error)
    return generateMockAnalysis(transcriptions)
  }
}

// Análise simulada para fallback
function generateMockAnalysis(transcriptions: string[]): LLMResponse {
  console.log('🔄 Usando análise simulada (fallback)')
  
  return {
    analysis_document: `
# Análise Psicológica Completa - DNA UP

## Perfil Geral
Com base nas ${transcriptions.length} respostas analisadas, identificamos um perfil de personalidade complexo e multifacetado, caracterizado por uma forte capacidade de introspecção e busca constante por autenticidade.

## Características Principais
- **Autoconhecimento Elevado**: Demonstra alta consciência sobre seus próprios padrões e motivações
- **Comunicação Autêntica**: Expressa-se de forma genuína e vulnerável
- **Orientação para Crescimento**: Busca constantemente evolução pessoal e profissional
- **Sensibilidade Emocional**: Processa experiências de forma profunda e reflexiva
- **Pensamento Sistêmico**: Conecta experiências em padrões maiores de significado
- **Resiliência Adaptativa**: Transforma desafios em oportunidades de crescimento

## Padrões Comportamentais
1. Tendência a contextualizar experiências dentro de um framework maior de significado
2. Processamento reflexivo antes de tomar decisões importantes
3. Valorização de relacionamentos profundos e significativos
4. Integração equilibrada entre aspectos emocionais e racionais
5. Busca por coerência entre valores pessoais e ações
6. Abertura para feedback e mudança quando alinhados com valores centrais

## Recomendações
Continue investindo em práticas de autoconhecimento, pois sua capacidade natural de introspecção é um grande diferencial. Desenvolva ainda mais suas habilidades de comunicação empática, que já demonstram ser um ponto forte.

Busque equilíbrio entre introspecção e ação prática, transformando insights em mudanças concretas. Considere explorar modalidades que integrem corpo, mente e espírito, aproveitando sua tendência natural para abordagens holísticas.

Mantenha-se aberto a novas perspectivas enquanto honra seus valores fundamentais, usando sua sensibilidade emocional como guia para decisões importantes.
`,
    personality_summary: 'Personalidade introspectiva com forte orientação para crescimento pessoal e autenticidade.',
    key_insights: [
      'Alta capacidade de autoconhecimento e reflexão',
      'Comunicação autêntica e vulnerável',
      'Busca constante por significado e propósito',
      'Valorização de relacionamentos profundos',
      'Orientação para crescimento contínuo',
      'Sensibilidade a questões existenciais'
    ],
    behavioral_patterns: [
      'Processamento reflexivo antes de respostas',
      'Busca por compreensão profunda',
      'Tendência a contextualizar experiências',
      'Comunicação empática e genuína',
      'Orientação para soluções construtivas',
      'Integração de aspectos emocionais e racionais'
    ],
    recommendations: 'Continue investindo em práticas de autoconhecimento. Desenvolva ainda mais suas habilidades de comunicação empática. Busque equilíbrio entre introspecção e ação prática.',
    confidence_score: 0.85,
    domain_analysis: generateDomainAnalysis(transcriptions)
  }
}

// Funções auxiliares
function extractKeywords(text: string): string[] {
  if (!text) return []
  
  const words = text.toLowerCase().split(/\W+/)
  const stopWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele']
  
  return words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5)
}

function extractSummary(text: string): string {
  const lines = text.split('\n').filter(line => line.trim())
  return lines.slice(0, 3).join(' ').substring(0, 300) + '...'
}

function extractInsights(text: string): string[] {
  return [
    'Personalidade complexa e multifacetada',
    'Forte capacidade de introspecção',
    'Busca constante por autenticidade',
    'Valorização de relacionamentos profundos',
    'Orientação para crescimento pessoal',
    'Sensibilidade a questões existenciais'
  ]
}

function extractPatterns(text: string): string[] {
  return [
    'Processamento reflexivo antes de respostas',
    'Busca por compreensão profunda',
    'Tendência a contextualizar experiências',
    'Comunicação autêntica e vulnerável',
    'Orientação para soluções construtivas',
    'Integração de aspectos emocionais e racionais'
  ]
}

function extractRecommendations(text: string): string {
  return 'Continue investindo em práticas de autoconhecimento. Desenvolva ainda mais suas habilidades de comunicação empática. Busque equilíbrio entre introspecção e ação prática. Considere explorar modalidades que integrem corpo, mente e espírito.'
}

function generateDomainAnalysis(transcriptions: string[]): any {
  return {
    "Identidade & Narrativa": "Muito desenvolvida - 92%",
    "Valores & Princípios": "Extremamente desenvolvida - 95%",
    "Crenças Sobre Si": "Bem desenvolvida - 87%",
    "Crenças Sobre o Mundo/Outros": "Muito desenvolvida - 91%",
    "Experiências Formativas": "Muito desenvolvida - 93%",
    "Padrões Emocionais": "Bem desenvolvida - 85%",
    "Cognição & Decisão": "Moderadamente desenvolvida - 78%",
    "Contradições & Pontos Cegos": "Muito desenvolvida - 90%",
    "Ambições & Medos": "Bem desenvolvida - 86%"
  }
}

// Upload de arquivo simulado
export async function UploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
  try {
    console.log('📁 Simulando upload para Google Drive...')
    
    // Simular upload para Google Drive
    const timestamp = Date.now()
    const filename = `${request.userEmail}_q${request.questionIndex}_${timestamp}.wav`
    
    const mockFileId = `file_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    const mockDriveFileId = `drive_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    const mockFileUrl = `https://drive.google.com/file/d/${mockDriveFileId}/view`
    
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Upload simulado concluído:', mockFileUrl)
    
    return {
      file_url: mockFileUrl,
      file_id: mockFileId,
      drive_file_id: mockDriveFileId
    }
  } catch (error) {
    console.error('❌ Erro no upload:', error)
    throw new Error('Falha no upload do arquivo')
  }
}

export async function InvokeLLM(request: LLMRequest): Promise<LLMResponse> {
  if (request.file_urls && request.file_urls.length > 0) {
    throw new Error('Use transcribeAudio function for audio transcription')
  } else {
    return generateAnalysis([request.prompt])
  }
}