import { supabase } from './supabase';

// Interface para dados de clonagem de voz
interface VoiceCloningData {
  text: string;
  voiceSample: File | Blob;
  sessionId: string;
  userEmail: string;
}

// Interface para resposta da geração do arquivo de clonagem
interface VoiceCloningFileResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

class VoiceCloningService {

  /**
   * Gera um arquivo de dados para o AllTalkTTS clonar a voz localmente.
   * Este arquivo conterá o texto a ser sintetizado e a amostra de voz.
   * O usuário precisará usar este arquivo com a ferramenta AllTalkTTS localmente.
   */
  async generateVoiceCloningFile(data: VoiceCloningData): Promise<VoiceCloningFileResponse> {
    try {
      console.log('🎤 Gerando arquivo para clonagem de voz local com AllTalkTTS...');

      const timestamp = Date.now();
      const fileName = `voice-cloning-data-${data.sessionId}-${timestamp}.json`;
      const filePath = `voice-cloning-requests/${data.userEmail.replace(/[@.]/g, '_')}/${fileName}`;

      // Criar um objeto com os dados necessários para o AllTalkTTS
      const cloningRequest = {
        text_to_synthesize: data.text,
        session_id: data.sessionId,
        user_email: data.userEmail,
        // A amostra de voz será salva separadamente ou o usuário a fornecerá
        // Aqui, estamos apenas indicando que a amostra de voz é necessária
        voice_sample_name: `voice_sample_${data.sessionId}.wav` // Nome sugerido para a amostra
      };

      // Converter o objeto para JSON
      const jsonContent = JSON.stringify(cloningRequest, null, 2);
      const jsonBlob = new Blob([jsonContent], { type: 'application/json' });

      // Fazer upload do arquivo JSON para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('dna-protocol-files')
        .upload(filePath, jsonBlob, {
          contentType: 'application/json',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Opcional: Salvar a amostra de voz também, se o usuário quiser que o app gerencie isso
      // Para o cenário de clonagem local, o usuário geralmente já tem a amostra.
      // Mas se o app precisar fazer o upload da amostra para o Supabase para o usuário baixar,
      // a lógica seria similar ao upload do JSON.
      const voiceSampleFileName = `voice_sample_${data.sessionId}.wav`;
      const voiceSampleFilePath = `voice-cloning-samples/${data.userEmail.replace(/[@.]/g, '_')}/${voiceSampleFileName}`;

      const { error: sampleUploadError } = await supabase.storage
        .from('dna-protocol-files')
        .upload(voiceSampleFilePath, data.voiceSample, {
          contentType: 'audio/wav',
          upsert: false
        });

      if (sampleUploadError) {
        console.warn('⚠️ Erro ao fazer upload da amostra de voz para Supabase (opcional):', sampleUploadError);
      }

      console.log('✅ Arquivo de requisição de clonagem de voz gerado e enviado para Supabase!');
      
      return {
        success: true,
        filePath: filePath
      };

    } catch (error) {
      console.error('❌ Erro na geração do arquivo de clonagem de voz:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Instância singleton do serviço
export const voiceCloningService = new VoiceCloningService();

// Função principal para clonagem de voz (compatibilidade com código existente)
export async function generateVoiceCloningFile(data: VoiceCloningData): Promise<VoiceCloningFileResponse> {
  return await voiceCloningService.generateVoiceCloningFile(data);
}

// Exportar tipos para uso em outros módulos
export type { VoiceCloningData, VoiceCloningFileResponse };


