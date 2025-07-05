import { supabase } from "../lib/supabase";
import Replicate from "replicate";

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

  static async generateVoiceCloningData(responses: any[], userEmail: string): Promise<VoiceCloningData[]> {
    console.log("🎤 Gerando dados para clonagem de voz com Replicate...")
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const clonedVoices: VoiceCloningData[] = [];

    for (const response of responses) {
      if (response.transcript_text && response.audio_url) {
        try {
          const output: any = await replicate.run(
            "minimax/voice-cloning:b2a6803a0168676a179612330777095687705645595568430679234674720950", // Exemplo de modelo, verificar o correto
            {
              input: {
                text: response.transcript_text,
                audio: response.audio_url,
              },
            }
          );
          
          const audioBlob = await fetch(output.audio).then(res => res.blob());
          const audioFileName = `cloned_voice_${response.question_index}_${Date.now()}.wav`;
          const audioPath = `users/${userEmail.replace(/[@.]/g, '_')}/cloned_voices/${audioFileName}`;

          const { data, error } = await supabase.storage
            .from('dna-protocol-files')
            .upload(audioPath, audioBlob, { contentType: 'audio/wav' });

          if (error) {
            console.error("❌ Erro ao fazer upload do áudio clonado para o Supabase:", error);
            throw error;
          }

          const publicUrl = supabase.storage.from('dna-protocol-files').getPublicUrl(audioPath).data.publicUrl;

          clonedVoices.push({
            audio_file_url: publicUrl,
            transcript: response.transcript_text,
            duration: response.audio_duration || 0,
            quality_score: 0.9, // Exemplo de score
            emotional_markers: response.emotional_tone ? [response.emotional_tone] : []
          });

        } catch (error) {
          console.error("❌ Erro ao gerar ou fazer upload da voz clonada:", error);
        }
      }
    }
    return clonedVoices;
  }
}


