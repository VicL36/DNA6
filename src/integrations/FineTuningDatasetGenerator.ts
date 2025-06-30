// Gerador de Dataset para Fine-tuning TinyLlama - DNA UP Platform
export interface FineTuningExample {
  instruction: string
  input: string
  output: string
  metadata?: {
    question_index: number
    domain: string
    user_email: string
    timestamp: string
    audio_duration?: number
    emotional_tone?: string
    keywords?: string[]
  }
}

export interface VoiceCloningData {
  audio_file_url: string
  transcript: string
  duration: number
  quality_score: number
  emotional_markers: string[]
}

export class FineTuningDatasetGenerator {
  
  // Gerar dataset completo para fine-tuning
  static generateDataset(
    userEmail: string,
    responses: any[],
    analysisData: any
  ): FineTuningExample[] {
    console.log('🤖 Gerando dataset de fine-tuning para TinyLlama...')
    
    const dataset: FineTuningExample[] = []
    
    // 1. Exemplos baseados nas respostas do usuário
    responses.forEach((response, index) => {
      // Exemplo de análise de resposta
      dataset.push({
        instruction: "Analise a seguinte resposta de uma entrevista psicológica e identifique padrões de personalidade.",
        input: `Pergunta: ${response.question_text}\nResposta: ${response.transcript_text}`,
        output: this.generateResponseAnalysis(response, analysisData),
        metadata: {
          question_index: response.question_index,
          domain: response.question_domain,
          user_email: userEmail,
          timestamp: response.created_at,
          audio_duration: response.audio_duration,
          emotional_tone: response.emotional_tone,
          keywords: response.analysis_keywords
        }
      })

      // Exemplo de geração de insights
      dataset.push({
        instruction: "Com base na resposta, gere insights psicológicos profundos sobre a personalidade.",
        input: `Domínio: ${response.question_domain}\nResposta: ${response.transcript_text}`,
        output: this.generateInsights(response, analysisData),
        metadata: {
          question_index: response.question_index,
          domain: response.question_domain,
          user_email: userEmail,
          timestamp: response.created_at
        }
      })

      // Exemplo de recomendações personalizadas
      dataset.push({
        instruction: "Baseado no perfil psicológico, sugira recomendações de desenvolvimento pessoal.",
        input: `Perfil: ${this.extractPersonalityProfile(response, analysisData)}\nContexto: ${response.question_domain}`,
        output: this.generatePersonalizedRecommendations(response, analysisData),
        metadata: {
          question_index: response.question_index,
          domain: response.question_domain,
          user_email: userEmail,
          timestamp: response.created_at
        }
      })
    })

    // 2. Exemplos de análise por domínio
    const domains = [...new Set(responses.map(r => r.question_domain))]
    domains.forEach(domain => {
      const domainResponses = responses.filter(r => r.question_domain === domain)
      
      dataset.push({
        instruction: `Analise todas as respostas do domínio "${domain}" e crie um perfil específico para esta área.`,
        input: domainResponses.map(r => `P${r.question_index}: ${r.transcript_text}`).join('\n\n'),
        output: this.generateDomainAnalysis(domain, domainResponses, analysisData),
        metadata: {
          question_index: 0,
          domain: domain,
          user_email: userEmail,
          timestamp: new Date().toISOString()
        }
      })
    })

    // 3. Exemplos de síntese geral
    dataset.push({
      instruction: "Crie uma síntese psicológica completa baseada em todas as respostas da entrevista.",
      input: `Total de respostas: ${responses.length}\nDomínios analisados: ${domains.join(', ')}\nPerfil geral: ${analysisData.personality_summary}`,
      output: analysisData.analysis_document || this.generateCompleteSynthesis(responses, analysisData),
      metadata: {
        question_index: 999,
        domain: "SÍNTESE_GERAL",
        user_email: userEmail,
        timestamp: new Date().toISOString()
      }
    })

    // 4. Exemplos de predição comportamental
    dataset.push({
      instruction: "Baseado no perfil psicológico, prediga possíveis comportamentos e reações em diferentes situações.",
      input: `Perfil: ${analysisData.personality_summary}\nPadrões: ${analysisData.behavioral_patterns?.join(', ')}`,
      output: this.generateBehavioralPredictions(analysisData),
      metadata: {
        question_index: 998,
        domain: "PREDIÇÃO_COMPORTAMENTAL",
        user_email: userEmail,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`✅ Dataset gerado com ${dataset.length} exemplos para fine-tuning`)
    return dataset
  }

  // Gerar dados para clonagem de voz (preparação para próxima etapa)
  static generateVoiceCloningData(responses: any[]): VoiceCloningData[] {
    console.log('🎤 Preparando dados para clonagem de voz...')
    
    return responses
      .filter(r => r.audio_file_url && r.transcript_text && r.audio_duration > 5)
      .map(response => ({
        audio_file_url: response.audio_file_url,
        transcript: response.transcript_text,
        duration: response.audio_duration,
        quality_score: this.calculateAudioQuality(response),
        emotional_markers: this.extractEmotionalMarkers(response)
      }))
      .sort((a, b) => b.quality_score - a.quality_score) // Melhor qualidade primeiro
  }

  // Métodos auxiliares privados
  private static generateResponseAnalysis(response: any, analysisData: any): string {
    return `Esta resposta revela aspectos importantes da personalidade no domínio "${response.question_domain}". 
    
Padrões identificados:
- Estilo de comunicação: ${this.analyzeCommStyle(response.transcript_text)}
- Profundidade emocional: ${response.emotional_tone || 'Neutra'}
- Palavras-chave: ${response.analysis_keywords?.join(', ') || 'Não identificadas'}

Insights psicológicos:
${this.generatePsychologicalInsights(response, analysisData)}

Esta resposta contribui para o perfil geral de ${analysisData.personality_summary || 'personalidade em desenvolvimento'}.`
  }

  private static generateInsights(response: any, analysisData: any): string {
    const insights = [
      `A resposta no domínio "${response.question_domain}" sugere ${this.inferPersonalityTrait(response)}`,
      `O padrão de linguagem indica ${this.analyzeLanguagePattern(response.transcript_text)}`,
      `A duração da resposta (${response.audio_duration}s) reflete ${this.interpretResponseLength(response.audio_duration)}`
    ]
    
    return insights.join('\n\n')
  }

  private static generatePersonalizedRecommendations(response: any, analysisData: any): string {
    return `Baseado na análise do domínio "${response.question_domain}", recomendo:

1. **Desenvolvimento pessoal**: ${this.generatePersonalDevelopmentTip(response)}
2. **Área de foco**: ${this.identifyFocusArea(response, analysisData)}
3. **Estratégia específica**: ${this.suggestSpecificStrategy(response)}

Estas recomendações são personalizadas para o perfil identificado de ${analysisData.personality_summary || 'personalidade única'}.`
  }

  private static generateDomainAnalysis(domain: string, responses: any[], analysisData: any): string {
    return `Análise completa do domínio "${domain}":

**Padrões identificados:**
${responses.map((r, i) => `- Pergunta ${r.question_index}: ${this.extractPattern(r.transcript_text)}`).join('\n')}

**Síntese do domínio:**
${this.synthesizeDomain(domain, responses)}

**Pontuação do domínio:** ${this.calculateDomainScore(responses)}

**Recomendações específicas:**
${this.generateDomainRecommendations(domain, responses)}`
  }

  private static generateCompleteSynthesis(responses: any[], analysisData: any): string {
    return `Síntese psicológica completa baseada em ${responses.length} respostas:

**Perfil dominante:** ${analysisData.personality_summary || 'Personalidade multifacetada'}

**Características principais:**
${analysisData.key_insights?.map((insight, i) => `${i + 1}. ${insight}`).join('\n') || 'Análise em desenvolvimento'}

**Padrões comportamentais:**
${analysisData.behavioral_patterns?.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n') || 'Padrões em identificação'}

**Recomendações gerais:**
${analysisData.recommendations || 'Recomendações personalizadas em desenvolvimento'}

Esta análise representa um mapeamento profundo da personalidade através do protocolo Clara R.`
  }

  private static generateBehavioralPredictions(analysisData: any): string {
    return `Predições comportamentais baseadas no perfil psicológico:

**Em situações de stress:**
- Provável reação: ${this.predictStressResponse(analysisData)}
- Estratégias de enfrentamento: ${this.predictCopingStrategies(analysisData)}

**Em relacionamentos:**
- Estilo de comunicação: ${this.predictCommStyle(analysisData)}
- Necessidades emocionais: ${this.predictEmotionalNeeds(analysisData)}

**No trabalho:**
- Ambiente ideal: ${this.predictWorkEnvironment(analysisData)}
- Motivadores principais: ${this.predictMotivators(analysisData)}

**Em decisões importantes:**
- Processo decisório: ${this.predictDecisionProcess(analysisData)}
- Fatores influenciadores: ${this.predictInfluencingFactors(analysisData)}`
  }

  // Métodos de análise auxiliares
  private static analyzeCommStyle(text: string): string {
    const wordCount = text.split(' ').length
    if (wordCount > 50) return "Comunicação elaborada e detalhada"
    if (wordCount > 20) return "Comunicação equilibrada"
    return "Comunicação concisa e direta"
  }

  private static analyzeLanguagePattern(text: string): string {
    const hasEmotionalWords = /\b(sinto|emoção|coração|alma|amor|medo|alegria)\b/i.test(text)
    const hasAnalyticalWords = /\b(analiso|penso|considero|avalio|lógica|razão)\b/i.test(text)
    
    if (hasEmotionalWords && hasAnalyticalWords) return "Integração equilibrada entre emoção e razão"
    if (hasEmotionalWords) return "Predominância do processamento emocional"
    if (hasAnalyticalWords) return "Predominância do processamento analítico"
    return "Estilo de processamento neutro"
  }

  private static interpretResponseLength(duration: number): string {
    if (duration > 60) return "Tendência à reflexão profunda e elaboração detalhada"
    if (duration > 30) return "Processamento equilibrado com boa elaboração"
    return "Processamento direto e objetivo"
  }

  private static calculateAudioQuality(response: any): number {
    let score = 0.5 // Base score
    
    // Duração ideal (15-45 segundos)
    if (response.audio_duration >= 15 && response.audio_duration <= 45) score += 0.3
    
    // Presença de transcrição
    if (response.transcript_text && response.transcript_text.length > 20) score += 0.2
    
    return Math.min(score, 1.0)
  }

  private static extractEmotionalMarkers(response: any): string[] {
    const text = response.transcript_text || ''
    const markers = []
    
    if (/\b(feliz|alegria|contente)\b/i.test(text)) markers.push('alegria')
    if (/\b(triste|tristeza|melancolia)\b/i.test(text)) markers.push('tristeza')
    if (/\b(medo|receio|ansiedade)\b/i.test(text)) markers.push('ansiedade')
    if (/\b(raiva|irritação|frustração)\b/i.test(text)) markers.push('irritação')
    
    return markers
  }

  // Métodos de predição (simplificados para o exemplo)
  private static predictStressResponse(analysisData: any): string {
    return "Tendência a buscar soluções práticas com suporte emocional"
  }

  private static predictCopingStrategies(analysisData: any): string {
    return "Combinação de reflexão interna e busca por apoio social"
  }

  private static predictCommStyle(analysisData: any): string {
    return "Comunicação empática com foco na compreensão mútua"
  }

  private static predictEmotionalNeeds(analysisData: any): string {
    return "Necessidade de validação emocional e conexão autêntica"
  }

  private static predictWorkEnvironment(analysisData: any): string {
    return "Ambiente colaborativo com autonomia para criatividade"
  }

  private static predictMotivators(analysisData: any): string {
    return "Propósito, crescimento pessoal e impacto positivo"
  }

  private static predictDecisionProcess(analysisData: any): string {
    return "Análise cuidadosa com consideração de impactos emocionais"
  }

  private static predictInfluencingFactors(analysisData: any): string {
    return "Valores pessoais, bem-estar dos outros e consequências a longo prazo"
  }

  // Métodos auxiliares adicionais
  private static inferPersonalityTrait(response: any): string {
    return "uma personalidade reflexiva e consciente"
  }

  private static generatePersonalDevelopmentTip(response: any): string {
    return "Continue desenvolvendo sua capacidade de autoconhecimento através de práticas reflexivas"
  }

  private static identifyFocusArea(response: any, analysisData: any): string {
    return response.question_domain
  }

  private static suggestSpecificStrategy(response: any): string {
    return "Pratique mindfulness e journaling para aprofundar insights"
  }

  private static extractPattern(text: string): string {
    return "Padrão de comunicação autêntica e reflexiva"
  }

  private static synthesizeDomain(domain: string, responses: any[]): string {
    return `O domínio "${domain}" revela aspectos importantes da personalidade através de ${responses.length} respostas analisadas.`
  }

  private static calculateDomainScore(responses: any[]): string {
    return "85% - Muito desenvolvido"
  }

  private static generateDomainRecommendations(domain: string, responses: any[]): string {
    return `Continue explorando e desenvolvendo aspectos relacionados a ${domain}`
  }

  private static generatePsychologicalInsights(response: any, analysisData: any): string {
    return "Demonstra capacidade de introspecção e comunicação autêntica"
  }
}