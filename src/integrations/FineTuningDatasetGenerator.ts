import { supabase } from "../lib/supabase";
import { generateVoiceCloningData as cloneVoice, VoiceCloningData as VoiceCloneData } from "../lib/voiceCloning";

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
    analysisData = analysisData || {}; // Garante que analysisData é um objeto
    
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
        input: `Perfil: ${this.inferPersonalityTrait(response)}\nContexto: ${response.question_domain}`,
        output: this.generatePersonalizedRecommendations(response, analysisData),
        metadata: {
          question_index: response.question_index,
          domain: response.question_domain,
          user_email: userEmail,
          timestamp: response.created_at
        }
      })

    })

    return dataset
  }

  // Funções de geração de conteúdo (stubs)
  private static generateResponseAnalysis(response: any, analysisData: any): string {
    return "Análise da resposta..."
  }

  private static generateInsights(response: any, analysisData: any): string {
    return "Insights..."
  }

  private static inferPersonalityTrait(response: any): string {
    return "Traço de personalidade..."
  }

  private static generatePersonalizedRecommendations(response: any, analysisData: any): string {
    return "Recomendações..."
  }

  static async generateVoiceCloningData(responses: any[], userEmail: string, sessionId: string): Promise<VoiceCloningData[]> {
    console.log("🎤 Gerando dados para clonagem de voz com AllTalkTTS...")

    const clonedVoices: VoiceCloningData[] = [];

    for (const response of responses) {
      if (response.transcript_text && response.audio_file_url) {
        try {
          // Baixar o áudio original para usar como amostra de voz
          const audioResponse = await fetch(response.audio_file_url);
          if (!audioResponse.ok) {
            console.error(`❌ Erro ao baixar áudio: ${audioResponse.status}`);
            continue;
          }
          
          const audioBlob = await audioResponse.blob();
          
          // Usar o serviço de clonagem de voz
          const cloneResult = await cloneVoice({
            text: response.transcript_text,
            voiceSample: audioBlob,
            sessionId: sessionId,
            userEmail: userEmail
          });

          if (cloneResult.success && cloneResult.audioUrl) {
            clonedVoices.push({
              audio_file_url: cloneResult.audioUrl,
              transcript: response.transcript_text,
              duration: response.audio_duration || 0,
              quality_score: 0.9, // Score baseado na qualidade do AllTalkTTS
              emotional_markers: response.emotional_tone ? [response.emotional_tone] : []
            });

            console.log(`✅ Voz clonada com sucesso para resposta ${response.question_index}`);
          } else {
            console.error(`❌ Erro na clonagem de voz: ${cloneResult.error}`);
          }

        } catch (error) {
          console.error("❌ Erro ao gerar ou fazer upload da voz clonada:", error);
        }
      }
    }
    
    console.log(`🎤 Clonagem concluída: ${clonedVoices.length} vozes geradas`);
    return clonedVoices;
  }
}


