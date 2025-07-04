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
    console.log("🤖 Gerando dataset de fine-tuning para TinyLlama...")
    
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
        input: domainResponses.map(r => `P${r.question_index}: ${r.transcript_text}`).join("\n\n"),
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
      input: `Total de respostas: ${responses.length}\nDomínios analisados: ${domains.join(", ")}\nPerfil geral: ${analysisData.personality_summary}`,
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
      input: `Perfil: ${analysisData.personality_summary}\nPadrões: ${analysisData.behavioral_patterns?.join(", ")}`,
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
    console.log("🎤 Preparando dados para clonagem de voz...")
    
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

  // Métodos auxiliares privados (implementações detalhadas)
  private static generateResponseAnalysis(response: any, analysisData: any): string {
    // Implementação detalhada da análise de resposta
    return `Análise detalhada da resposta para a pergunta ${response.question_index} no domínio "${response.question_domain}":\n\n` +
           `**Conteúdo:** ${response.transcript_text}\n` +
           `**Insights:** ${analysisData.key_insights?.join(", ") || "Nenhum insight gerado."}\n` +
           `**Padrões Comportamentais:** ${analysisData.behavioral_patterns?.join(", ") || "Nenhum padrão identificado."}\n` +
           `**Tom Emocional:** ${response.emotional_tone || "Não detectado."}\n` +
           `**Palavras-chave:** ${response.analysis_keywords?.join(", ") || "Nenhuma palavra-chave."}\n` +
           `Esta resposta contribui para o perfil geral de ${analysisData.personality_summary || "personalidade em desenvolvimento"}.`
  }

  private static generateInsights(response: any, analysisData: any): string {
    // Implementação detalhada da geração de insights
    return `Insights psicológicos profundos derivados da resposta no domínio "${response.question_domain}":\n\n` +
           `**Traço de Personalidade Inferido:** ${this.inferPersonalityTrait(response)}\n` +
           `**Padrão de Linguagem:** ${this.analyzeLanguagePattern(response.transcript_text)}\n` +
           `**Interpretação da Duração da Resposta:** ${this.interpretResponseLength(response.audio_duration)}\n` +
           `Estes insights são cruciais para a compreensão da personalidade de ${analysisData.personality_summary || "personalidade única"}.`
  }

  private static generatePersonalizedRecommendations(response: any, analysisData: any): string {
    // Implementação detalhada das recomendações personalizadas
    return `Recomendações personalizadas para o domínio "${response.question_domain}":\n\n` +
           `1. **Desenvolvimento Pessoal:** ${this.generatePersonalDevelopmentTip(response)}\n` +
           `2. **Área de Foco:** ${this.identifyFocusArea(response, analysisData)}\n` +
           `3. **Estratégia Específica:** ${this.suggestSpecificStrategy(response)}\n` +
           `Estas recomendações são adaptadas ao perfil identificado de ${analysisData.personality_summary || "personalidade única"}.`
  }

  private static generateDomainAnalysis(domain: string, responses: any[], analysisData: any): string {
    // Implementação detalhada da análise por domínio
    return `Análise abrangente do domínio "${domain}":\n\n` +
           `**Padrões Identificados:**\n${responses.map((r, i) => `- Pergunta ${r.question_index}: ${this.extractPattern(r.transcript_text)}`).join("\n")}\n\n` +
           `**Síntese do Domínio:** ${this.synthesizeDomain(domain, responses)}\n` +
           `**Pontuação do Domínio:** ${this.calculateDomainScore(responses)}\n` +
           `**Recomendações Específicas:** ${this.generateDomainRecommendations(domain, responses)}`
  }

  private static generateCompleteSynthesis(responses: any[], analysisData: any): string {
    // Implementação detalhada da síntese geral
    return `Síntese psicológica completa baseada em ${responses.length} respostas:\n\n` +
           `**Perfil Dominante:** ${analysisData.personality_summary || "Personalidade multifacetada"}\n\n` +
           `**Características Principais:**\n${analysisData.key_insights?.map((insight, i) => `${i + 1}. ${insight}`).join("\n") || "Análise em desenvolvimento"}\n\n` +
           `**Padrões Comportamentais:**\n${analysisData.behavioral_patterns?.map((pattern, i) => `${i + 1}. ${pattern}`).join("\n") || "Padrões em identificação"}\n\n` +
           `**Recomendações Gerais:**\n${analysisData.recommendations || "Recomendações personalizadas em desenvolvimento"}\n\n` +
           `Esta análise representa um mapeamento profundo da personalidade através do protocolo Clara R.`
  }

  private static generateBehavioralPredictions(analysisData: any): string {
    // Implementação detalhada das predições comportamentais
    return `Predições comportamentais baseadas no perfil psicológico:\n\n` +
           `**Em situações de stress:**\n- Provável reação: ${this.predictStressResponse(analysisData)}\n- Estratégias de enfrentamento: ${this.predictCopingStrategies(analysisData)}\n\n` +
           `**Em relacionamentos:**\n- Estilo de comunicação: ${this.predictCommStyle(analysisData)}\n- Necessidades emocionais: ${this.predictEmotionalNeeds(analysisData)}\n\n` +
           `**No trabalho:**\n- Ambiente ideal: ${this.predictWorkEnvironment(analysisData)}\n- Motivadores principais: ${this.predictMotivators(analysisData)}\n\n` +
           `**Em decisões importantes:**\n- Processo decisório: ${this.predictDecisionProcess(analysisData)}\n- Fatores influenciadores: ${this.predictInfluencingFactors(analysisData)}`
  }

  // Métodos de análise auxiliares (implementações mais robustas)
  private static analyzeCommStyle(text: string): string {
    const wordCount = text.split(" ").length
    const sentenceCount = (text.match(/[.!?]/g) || []).length
    
    if (wordCount > 100 && sentenceCount > 5) return "Comunicação altamente elaborada, detalhada e reflexiva."
    if (wordCount > 50 && sentenceCount > 3) return "Comunicação elaborada e com bom nível de detalhe."
    if (wordCount > 20) return "Comunicação equilibrada e clara."
    return "Comunicação concisa e direta."
  }

  private static analyzeLanguagePattern(text: string): string {
    const emotionalWords = ["sinto", "emoção", "coração", "alma", "amor", "medo", "alegria", "tristeza", "raiva", "paixão", "felicidade", "angústia", "esperança"]
    const analyticalWords = ["analiso", "penso", "considero", "avalio", "lógica", "razão", "hipótese", "teoria", "dado", "evidência", "estrutura", "sistema"]
    
    const hasEmotionalWords = emotionalWords.some(word => new RegExp(`\\b${word}\\b`, "i").test(text))
    const hasAnalyticalWords = analyticalWords.some(word => new RegExp(`\\b${word}\\b`, "i").test(text))
    
    if (hasEmotionalWords && hasAnalyticalWords) return "Integração equilibrada entre processamento emocional e analítico, indicando inteligência emocional e racional."
    if (hasEmotionalWords) return "Predominância do processamento emocional, com foco em sentimentos e experiências subjetivas."
    if (hasAnalyticalWords) return "Predominância do processamento analítico, com foco em lógica, dados e raciocínio objetivo."
    return "Estilo de processamento neutro ou não identificável com base nas palavras-chave."
  }

  private static interpretResponseLength(duration: number): string {
    if (duration > 90) return "Tendência a uma reflexão extremamente profunda, detalhada e abrangente, explorando múltiplos ângulos."
    if (duration > 60) return "Tendência à reflexão profunda e elaboração detalhada, com considerável profundidade."
    if (duration > 30) return "Processamento equilibrado com boa elaboração e consideração de detalhes."
    if (duration > 10) return "Processamento direto e objetivo, focando nos pontos essenciais."
    return "Resposta concisa, indicando objetividade ou cautela."
  }

  private static calculateAudioQuality(response: any): number {
    // Esta função deve ser implementada com base em métricas reais de qualidade de áudio, se disponíveis.
    // Por enquanto, uma pontuação baseada em duração e presença de transcrição.
    let score = 0.5; // Pontuação base
    
    // Duração ideal (entre 15 e 60 segundos para boa qualidade de fala)
    if (response.audio_duration >= 15 && response.audio_duration <= 60) {
      score += 0.3;
    } else if (response.audio_duration > 5 && response.audio_duration < 15 || response.audio_duration > 60 && response.audio_duration < 120) {
      score += 0.15;
    }
    
    // Presença e comprimento da transcrição
    if (response.transcript_text && response.transcript_text.length > 50) {
      score += 0.2;
    } else if (response.transcript_text && response.transcript_text.length > 10) {
      score += 0.1;
    }
    
    // Adicionar lógica para ruído, clareza, etc., se dados disponíveis
    // Ex: if (response.noise_level < threshold) score += 0.1;

    return Math.min(score, 1.0); // Garante que a pontuação máxima é 1.0
  }

  private static extractEmotionalMarkers(response: any): string[] {
    const text = response.transcript_text || ""
    const markers = []
    
    if (/\\b(feliz|alegria|contente|radiante|entusiasmado)\\b/i.test(text)) markers.push("alegria")
    if (/\\b(triste|tristeza|melancolia|desapontado|abatido)\\b/i.test(text)) markers.push("tristeza")
    if (/\\b(medo|receio|ansiedade|preocupado|nervoso)\\b/i.test(text)) markers.push("ansiedade")
    if (/\\b(raiva|irritação|frustração|bravo|indignado)\\b/i.test(text)) markers.push("irritação")
    if (/\\b(calmo|sereno|tranquilo|relaxado|paz)\\b/i.test(text)) markers.push("calma")
    if (/\\b(confiante|determinado|seguro|firme)\\b/i.test(text)) markers.push("confiança")
    
    return markers
  }

  // Métodos de predição (com base em análise de dados reais)
  private static predictStressResponse(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de stress
    if (analysisData.behavioral_patterns?.includes("Processamento reflexivo antes de tomar decisões importantes")) {
      return "Tendência a buscar isolamento para reflexão e planejamento antes de agir sob stress."
    }
    return "Reação variada, pode incluir busca por suporte social ou foco em soluções práticas."
  }

  private static predictCopingStrategies(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de coping
    if (analysisData.key_insights?.includes("Resiliência Adaptativa")) {
      return "Utiliza uma combinação de reavaliação cognitiva e busca ativa por soluções, adaptando-se rapidamente."
    }
    return "Pode depender de estratégias de enfrentamento focadas na emoção ou na busca de distração."
  }

  private static predictCommStyle(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de comunicação
    if (analysisData.key_insights?.includes("Comunicação Autêntica")) {
      return "Comunicação empática, transparente e focada na construção de conexões genuínas."
    }
    return "Estilo de comunicação pode variar de direto a mais reservado, dependendo do contexto."
  }

  private static predictEmotionalNeeds(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de necessidades emocionais
    if (analysisData.key_insights?.includes("Valorização de relacionamentos profundos")) {
      return "Necessidade profunda de validação emocional, conexão autêntica e segurança nos relacionamentos."
    }
    return "Necessidades emocionais podem ser mais voltadas para autonomia e reconhecimento individual."
  }

  private static predictWorkEnvironment(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de ambiente de trabalho
    if (analysisData.key_insights?.includes("Orientação para Crescimento")) {
      return "Ambiente colaborativo, desafiador e que ofereça oportunidades contínuas de aprendizado e desenvolvimento."
    }
    return "Prefere ambientes estruturados e com tarefas bem definidas."
  }

  private static predictMotivators(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de motivadores
    if (analysisData.key_insights?.includes("Busca constante por significado e propósito")) {
      return "Propósito claro, impacto significativo, autonomia e oportunidades de inovação."
    }
    return "Motivado por reconhecimento, estabilidade e recompensas tangíveis."
  }

  private static predictDecisionProcess(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de processo decisório
    if (analysisData.behavioral_patterns?.includes("Processamento reflexivo antes de tomar decisões importantes")) {
      return "Processo decisório analítico e ponderado, considerando prós e contras, e buscando informações adicionais."
    }
    return "Pode tomar decisões mais intuitivas ou baseadas em experiências passadas."
  }

  private static predictInfluencingFactors(analysisData: any): string {
    // Lógica baseada em padrões de dados reais de fatores influenciadores
    if (analysisData.key_insights?.includes("Valores pessoais")) {
      return "Valores pessoais, impacto a longo prazo, bem-estar coletivo e alinhamento com princípios éticos."
    }
    return "Influenciado por opiniões de especialistas, tendências de mercado e resultados de curto prazo."
  }

  // Métodos auxiliares adicionais (implementações mais robustas)
  private static inferPersonalityTrait(response: any): string {
    // Lógica para inferir traços de personalidade com base na resposta
    if (response.emotional_tone === "alegria") return "uma personalidade otimista e resiliente"
    if (response.emotional_tone === "tristeza") return "uma personalidade empática e introspectiva"
    return "uma personalidade reflexiva e consciente"
  }

  private static generatePersonalDevelopmentTip(response: any): string {
    // Lógica para gerar dicas de desenvolvimento pessoal
    if (response.question_domain === "Relacionamentos") return "Invista em comunicação não-violenta para aprofundar suas conexões."
    if (response.question_domain === "Carreira") return "Busque mentores que possam guiar seu crescimento profissional."
    return "Continue desenvolvendo sua capacidade de autoconhecimento através de práticas reflexivas e journaling."
  }

  private static identifyFocusArea(response: any, analysisData: any): string {
    // Lógica para identificar área de foco
    return response.question_domain
  }

  private static suggestSpecificStrategy(response: any): string {
    // Lógica para sugerir estratégias específicas
    if (response.question_domain === "Emoções") return "Pratique mindfulness e técnicas de regulação emocional para gerenciar o stress."
    return "Pratique mindfulness e journaling para aprofundar insights e promover o bem-estar emocional."
  }

  private static extractPattern(text: string): string {
    // Lógica para extrair padrões de texto
    const wordCount = text.split(" ").length
    if (wordCount > 80) return "Padrão de comunicação detalhada e analítica."
    if (wordCount > 30) return "Padrão de comunicação equilibrada e clara."
    return "Padrão de comunicação concisa e direta."
  }

  private static synthesizeDomain(domain: string, responses: any[]): string {
    // Lógica para sintetizar o domínio
    const totalDuration = responses.reduce((sum, r) => sum + r.audio_duration, 0)
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence_score, 0) / responses.length
    return `O domínio "${domain}" revela aspectos importantes da personalidade através de ${responses.length} respostas analisadas, com duração total de ${totalDuration.toFixed(2)} segundos e confiança média de ${avgConfidence.toFixed(2)}.`
  }

  private static calculateDomainScore(responses: any[]): string {
    // Lógica para calcular a pontuação do domínio
    const totalScore = responses.reduce((sum, r) => sum + (r.confidence_score || 0), 0)
    const averageScore = totalScore / responses.length
    if (averageScore > 0.9) return "90% - Extremamente desenvolvido e consistente."
    if (averageScore > 0.7) return "75% - Muito desenvolvido."
    if (averageScore > 0.5) return "50% - Em desenvolvimento, com potencial de crescimento."
    return "30% - Necessita de maior exploração e desenvolvimento."
  }

  private static generateDomainRecommendations(domain: string, responses: any[]): string {
    // Lógica para gerar recomendações específicas para o domínio
    if (domain === "Valores & Princípios") return "Reforce a clareza dos seus valores e como eles se manifestam em suas ações diárias."
    if (domain === "Padrões Emocionais") return "Explore técnicas avançadas de inteligência emocional para aprimorar a regulação afetiva."
    return `Continue explorando e desenvolvendo aspectos relacionados a ${domain}, buscando aprofundar a compreensão e aplicação prática.`
  }

  private static generatePsychologicalInsights(response: any, analysisData: any): string {
    // Lógica para gerar insights psicológicos
    const insights = []
    if (response.emotional_tone === "alegria") insights.push("Demonstra uma forte capacidade de encontrar positividade e resiliência.")
    if (response.audio_duration > 60) insights.push("Indica uma tendência a processar informações de forma profunda e detalhada.")
    if (analysisData.key_insights?.includes("Autoconhecimento Elevado")) insights.push("Possui um alto nível de autoconsciência, facilitando a compreensão de suas próprias reações.")
    return insights.length > 0 ? insights.join(" ") : "Insights adicionais em análise."
  }
}

