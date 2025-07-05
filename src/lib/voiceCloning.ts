import { supabase } from './supabase';

// Interface para configuração do AllTalkTTS
interface AllTalkTTSConfig {
  baseUrl: string;
  apiKey?: string;
}

// Interface para resposta da clonagem de voz
interface VoiceCloningResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
  taskId?: string;
}

// Interface para dados de clonagem de voz
interface VoiceCloningData {
  text: string;
  voiceSample: File | Blob;
  sessionId: string;
  userEmail: string;
}

class VoiceCloningService {
  private config: AllTalkTTSConfig;

  constructor(config: AllTalkTTSConfig) {
    this.config = config;
  }

  /**
   * Gera áudio clonado usando AllTalkTTS
   */
  async generateVoiceCloningData(data: VoiceCloningData): Promise<VoiceCloningResponse> {
    try {
      console.log('🎤 Iniciando clonagem de voz com AllTalkTTS...');
      
      // 1. Primeiro, fazer upload da amostra de voz para o AllTalkTTS
      const voiceUploadResponse = await this.uploadVoiceSample(data.voiceSample);
      
      if (!voiceUploadResponse.success) {
        throw new Error(`Erro no upload da amostra de voz: ${voiceUploadResponse.error}`);
      }

      // 2. Gerar o áudio clonado
      const clonedAudioResponse = await this.generateClonedAudio({
        text: data.text,
        voiceId: voiceUploadResponse.voiceId!,
        sessionId: data.sessionId
      });

      if (!clonedAudioResponse.success) {
        throw new Error(`Erro na geração do áudio clonado: ${clonedAudioResponse.error}`);
      }

      // 3. Fazer download do áudio gerado
      const audioBlob = await this.downloadGeneratedAudio(clonedAudioResponse.taskId!);

      // 4. Fazer upload para o Supabase Storage
      const supabaseUploadResponse = await this.uploadToSupabase(audioBlob, data.sessionId, data.userEmail);

      if (!supabaseUploadResponse.success) {
        throw new Error(`Erro no upload para Supabase: ${supabaseUploadResponse.error}`);
      }

      console.log('✅ Clonagem de voz concluída com sucesso!');
      
      return {
        success: true,
        audioUrl: supabaseUploadResponse.audioUrl
      };

    } catch (error) {
      console.error('❌ Erro na clonagem de voz:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Faz upload da amostra de voz para o AllTalkTTS
   */
  private async uploadVoiceSample(voiceSample: File | Blob): Promise<{success: boolean, voiceId?: string, error?: string}> {
    try {
      const formData = new FormData();
      formData.append('voice_sample', voiceSample, 'voice_sample.wav');

      const response = await fetch(`${this.config.baseUrl}/api/voices/upload`, {
        method: 'POST',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        voiceId: result.voice_id || result.id
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload da amostra de voz'
      };
    }
  }

  /**
   * Gera o áudio clonado usando a voz carregada
   */
  private async generateClonedAudio(params: {text: string, voiceId: string, sessionId: string}): Promise<{success: boolean, taskId?: string, error?: string}> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          text: params.text,
          voice_id: params.voiceId,
          session_id: params.sessionId,
          output_format: 'wav',
          speed: 1.0,
          pitch: 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        taskId: result.task_id || result.id
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na geração do áudio clonado'
      };
    }
  }

  /**
   * Faz download do áudio gerado
   */
  private async downloadGeneratedAudio(taskId: string): Promise<Blob> {
    try {
      // Aguardar a conclusão da geração (polling)
      let attempts = 0;
      const maxAttempts = 30; // 30 tentativas = 5 minutos
      
      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`${this.config.baseUrl}/api/tts/status/${taskId}`, {
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          }
        });

        if (statusResponse.ok) {
          const status = await statusResponse.json();
          
          if (status.status === 'completed') {
            // Download do áudio
            const audioResponse = await fetch(`${this.config.baseUrl}/api/tts/download/${taskId}`, {
              headers: {
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
              }
            });

            if (!audioResponse.ok) {
              throw new Error(`Erro no download: HTTP ${audioResponse.status}`);
            }

            return await audioResponse.blob();
          } else if (status.status === 'failed') {
            throw new Error(`Geração falhou: ${status.error || 'Erro desconhecido'}`);
          }
        }

        // Aguardar 10 segundos antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      }

      throw new Error('Timeout: Geração do áudio demorou mais que o esperado');

    } catch (error) {
      throw new Error(`Erro no download do áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Faz upload do áudio clonado para o Supabase Storage
   */
  private async uploadToSupabase(audioBlob: Blob, sessionId: string, userEmail: string): Promise<{success: boolean, audioUrl?: string, error?: string}> {
    try {
      const fileName = `cloned-voice-${sessionId}-${Date.now()}.wav`;
      const filePath = `voice-cloning/${userEmail}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dna-protocol-files')
        .upload(filePath, audioBlob, {
          contentType: 'audio/wav',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('dna-protocol-files')
        .getPublicUrl(filePath);

      return {
        success: true,
        audioUrl: urlData.publicUrl
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload para Supabase'
      };
    }
  }

  /**
   * Atualiza o banco de dados com a URL do áudio clonado
   */
  async updateSessionWithClonedAudio(sessionId: string, audioUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analysis_sessions')
        .update({ 
          cloned_voice_url: audioUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao atualizar sessão com áudio clonado:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      return false;
    }
  }
}

// Configuração padrão do AllTalkTTS
const defaultConfig: AllTalkTTSConfig = {
  baseUrl: process.env.VITE_ALLTALK_BASE_URL || 'http://localhost:7851',
  apiKey: process.env.VITE_ALLTALK_API_KEY
};

// Instância singleton do serviço
export const voiceCloningService = new VoiceCloningService(defaultConfig);

// Função principal para clonagem de voz (compatibilidade com código existente)
export async function generateVoiceCloningData(data: VoiceCloningData): Promise<VoiceCloningResponse> {
  return await voiceCloningService.generateVoiceCloningData(data);
}

// Exportar tipos para uso em outros módulos
export type { VoiceCloningData, VoiceCloningResponse, AllTalkTTSConfig };

