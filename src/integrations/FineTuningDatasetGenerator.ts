import { supabase } from "../lib/supabase";
import { generateVoiceCloningFile as cloneVoice, VoiceCloningFileResponse as VoiceCloneData } from "../lib/voiceCloning";

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
  request_file_path: string;
  transcript: string;
  duration: number;
  quality_score: number;
  emotional_markers: string[];
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
    console.log("🎤 Gerando arquivos de requisição para clonagem de voz local com AllTalkTTS...")

    const cloningRequests: VoiceCloningData[] = [];

    for (const response of responses) {
      if (response.transcript_text && response.audio_file_url) {
        try {
          // Criar um blob de áudio simulado para a amostra de voz (o usuário fornecerá o real)
          const audioBlob = new Blob(["fake audio data"], { type: "audio/wav" });
          
          // Gerar o arquivo de requisição para o AllTalkTTS
          const requestFileResult = await cloneVoice({
            text: response.transcript_text,
            voiceSample: audioBlob, // Amostra de voz simulada, o usuário usará a real
            sessionId: sessionId,
            userEmail: userEmail
          });

          if (requestFileResult.success && requestFileResult.filePath) {
            cloningRequests.push({
              request_file_path: requestFileResult.filePath,
              transcript: response.transcript_text,
              duration: response.audio_duration || 0,
              quality_score: 0.9, // Score padrão, pois a clonagem é local
              emotional_markers: response.emotional_tone ? [response.emotional_tone] : []
            });

            console.log(`✅ Arquivo de requisição gerado com sucesso para resposta ${response.question_index}`);
          } else {
            console.error(`❌ Erro ao gerar arquivo de requisição: ${requestFileResult.error}`);
          }

        } catch (error) {
          console.error("❌ Erro ao gerar arquivo de requisição para clonagem de voz:", error);
        }
      }
    }
    
    console.log(`🎤 Geração de arquivos de requisição concluída: ${cloningRequests.length} arquivos gerados`);
    return cloningRequests;
  }
}


