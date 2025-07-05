import { supabase } from './supabase';
import { generateVoiceCloningData } from './voiceCloning';
import { generateReportPDF, generateTranscriptionPDF } from './pdfGenerator';
import { FineTuningDatasetGenerator } from '../integrations/FineTuningDatasetGenerator';

// Interface para dados completos da sessão
interface SessionData {
  sessionId: string;
  userEmail: string;
  userName?: string;
  responses: any[];
  analysisData: any;
  createdAt: string;
  completedAt?: string;
}

// Interface para resposta de processamento completo
interface ProcessingResponse {
  success: boolean;
  results?: {
    reportPdfUrl?: string;
    transcriptionPdfUrl?: string;
    clonedVoiceRequestFilePaths?: string[];
    fineTuningDataset?: any[];
  };
  errors?: string[];
}

class SupabaseIntegrationService {
  
  /**
   * Processa uma sessão completa: gera PDFs, clona vozes e cria dataset
   */
  async processCompleteSession(sessionId: string): Promise<ProcessingResponse> {
    try {
      console.log(`🔄 Iniciando processamento completo da sessão: ${sessionId}`);
      
      const errors: string[] = [];
      const results: any = {};
      
      // 1. Buscar dados da sessão
      const sessionData = await this.getSessionData(sessionId);
      if (!sessionData) {
        throw new Error('Sessão não encontrada');
      }
      
      // 2. Gerar relatório em PDF
      try {
        console.log('📄 Gerando relatório PDF...');
        const reportResult = await generateReportPDF(sessionData);
        if (reportResult.success) {
          results.reportPdfUrl = reportResult.pdfUrl;
          console.log('✅ Relatório PDF gerado com sucesso');
        } else {
          errors.push(`Erro no relatório PDF: ${reportResult.error}`);
        }
      } catch (error) {
        errors.push(`Erro no relatório PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
      
      // 3. Gerar transcrição em PDF
      try {
        console.log('📝 Gerando transcrição PDF...');
        const transcriptionResult = await generateTranscriptionPDF({
          sessionId: sessionData.sessionId,
          userEmail: sessionData.userEmail,
          responses: sessionData.responses,
          createdAt: sessionData.createdAt
        });
        if (transcriptionResult.success) {
          results.transcriptionPdfUrl = transcriptionResult.pdfUrl;
          console.log('✅ Transcrição PDF gerada com sucesso');
        } else {
          errors.push(`Erro na transcrição PDF: ${transcriptionResult.error}`);
        }
      } catch (error) {
        errors.push(`Erro na transcrição PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
      
      // 4. Gerar arquivos de requisição para clonagem de vozes
      try {
        console.log("🎤 Iniciando geração de arquivos de requisição para clonagem de vozes...");
        const cloningRequestFiles = await FineTuningDatasetGenerator.generateVoiceCloningData(
          sessionData.responses,
          sessionData.userEmail,
          sessionData.sessionId
        );
        
        if (cloningRequestFiles.length > 0) {
          results.clonedVoiceRequestFilePaths = cloningRequestFiles.map(req => req.request_file_path);
          console.log(`✅ ${cloningRequestFiles.length} arquivos de requisição de clonagem de voz gerados com sucesso`);
        } else {
          errors.push("Nenhum arquivo de requisição de clonagem de voz foi gerado");
        }
      } catch (error) {
        errors.push(`Erro na geração de arquivos de requisição de clonagem de vozes: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
      
      // 5. Gerar dataset de fine-tuning
      try {
        console.log('🤖 Gerando dataset de fine-tuning...');
        const dataset = FineTuningDatasetGenerator.generateDataset(
          sessionData.userEmail,
          sessionData.responses,
          sessionData.analysisData
        );
        
        // Salvar dataset no Supabase Storage
        const datasetBlob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
        const datasetPath = `datasets/${sessionData.userEmail.replace(/[@.]/g, '_')}/dataset-${sessionId}-${Date.now()}.json`;
        
        const { error: uploadError } = await supabase.storage
          .from('dna-protocol-files')
          .upload(datasetPath, datasetBlob, {
            contentType: 'application/json',
            upsert: false
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('dna-protocol-files')
          .getPublicUrl(datasetPath);
        
        results.fineTuningDataset = dataset;
        results.datasetUrl = urlData.publicUrl;
        
        // Atualizar sessão com URL do dataset
        await this.updateSessionWithDataset(sessionId, urlData.publicUrl);
        
        console.log('✅ Dataset de fine-tuning gerado com sucesso');
      } catch (error) {
        errors.push(`Erro no dataset: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
      
      // 6. Atualizar status da sessão
      await this.updateSessionStatus(sessionId, 'completed');
      
      console.log(`🎉 Processamento da sessão ${sessionId} concluído`);
      console.log(`✅ Sucessos: ${Object.keys(results).length}`);
      console.log(`❌ Erros: ${errors.length}`);
      
      return {
        success: errors.length === 0,
        results,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      console.error('❌ Erro no processamento completo:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido no processamento']
      };
    }
  }
  
  /**
   * Busca dados completos da sessão
   */
  private async getSessionData(sessionId: string): Promise<SessionData | null> {
    try {
      // Buscar dados da sessão
      const { data: session, error: sessionError } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError || !session) {
        console.error('Erro ao buscar sessão:', sessionError);
        return null;
      }
      
      // Buscar respostas da sessão
      const { data: responses, error: responsesError } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_index', { ascending: true });
      
      if (responsesError) {
        console.error('Erro ao buscar respostas:', responsesError);
        return null;
      }
      
      return {
        sessionId: session.id,
        userEmail: session.user_email,
        userName: session.user_name,
        responses: responses || [],
        analysisData: {
          final_synthesis: session.final_synthesis,
          progress_percentage: session.progress_percentage,
          total_questions: session.total_questions
        },
        createdAt: session.created_at,
        completedAt: session.updated_at
      };
      
    } catch (error) {
      console.error('Erro ao buscar dados da sessão:', error);
      return null;
    }
  }
  
  /**
   * Atualiza o status da sessão
   */
  private async updateSessionStatus(sessionId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analysis_sessions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Erro ao atualizar status da sessão:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  }
  
  /**
   * Atualiza a sessão com URL do dataset
   */
  private async updateSessionWithDataset(sessionId: string, datasetUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analysis_sessions')
        .update({ 
          dataset_url: datasetUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Erro ao atualizar sessão com dataset:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dataset:', error);
      return false;
    }
  }
  
  /**
   * Lista todas as sessões de um usuário
   */
  async getUserSessions(userEmail: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar sessões do usuário:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      return [];
    }
  }
  
  /**
   * Busca arquivos de uma sessão no Storage
   */
  async getSessionFiles(sessionId: string, userEmail: string): Promise<{
    reports: string[];
    transcriptions: string[];
    voiceClones: string[];
    datasets: string[];
  }> {
    try {
      const userFolder = userEmail.replace(/[@.]/g, '_');
      
      // Buscar arquivos por tipo
      const [reports, transcriptions, voiceClones, datasets] = await Promise.all([
        this.listFilesInFolder(`reports/${userFolder}`),
        this.listFilesInFolder(`transcriptions/${userFolder}`),
        this.listFilesInFolder(`voice-cloning/${userFolder}`),
        this.listFilesInFolder(`datasets/${userFolder}`)
      ]);
      
      // Filtrar por sessionId
      const sessionFilter = (files: any[]) => 
        files.filter(file => file.name.includes(sessionId));
      
      return {
        reports: sessionFilter(reports),
        transcriptions: sessionFilter(transcriptions),
        voiceClones: sessionFilter(voiceClones),
        datasets: sessionFilter(datasets)
      };
      
    } catch (error) {
      console.error('Erro ao buscar arquivos da sessão:', error);
      return {
        reports: [],
        transcriptions: [],
        voiceClones: [],
        datasets: []
      };
    }
  }
  
  /**
   * Lista arquivos em uma pasta do Storage
   */
  private async listFilesInFolder(folderPath: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from('dna-protocol-files')
        .list(folderPath);
      
      if (error) {
        console.error(`Erro ao listar arquivos em ${folderPath}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }
  
  /**
   * Remove simulados (dados de teste) do banco
   */
  async removeSimulatedData(): Promise<boolean> {
    try {
      console.log('🧹 Removendo dados simulados...');
      
      // Identificar sessões de teste (podem ter emails específicos ou padrões)
      const testPatterns = ['test@', 'demo@', 'simulado@', 'exemplo@'];
      
      for (const pattern of testPatterns) {
        // Remover respostas de teste
        const { error: responsesError } = await supabase
          .from('user_responses')
          .delete()
          .like('session_id', `%${pattern}%`);
        
        if (responsesError) {
          console.error(`Erro ao remover respostas de teste (${pattern}):`, responsesError);
        }
        
        // Remover sessões de teste
        const { error: sessionsError } = await supabase
          .from('analysis_sessions')
          .delete()
          .like('user_email', `${pattern}%`);
        
        if (sessionsError) {
          console.error(`Erro ao remover sessões de teste (${pattern}):`, sessionsError);
        }
      }
      
      console.log('✅ Dados simulados removidos');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao remover dados simulados:', error);
      return false;
    }
  }
}

// Instância singleton do serviço
export const supabaseIntegrationService = new SupabaseIntegrationService();

// Funções principais para compatibilidade
export async function processCompleteSession(sessionId: string): Promise<ProcessingResponse> {
  return await supabaseIntegrationService.processCompleteSession(sessionId);
}

export async function getUserSessions(userEmail: string): Promise<any[]> {
  return await supabaseIntegrationService.getUserSessions(userEmail);
}

export async function getSessionFiles(sessionId: string, userEmail: string) {
  return await supabaseIntegrationService.getSessionFiles(sessionId, userEmail);
}

export async function removeSimulatedData(): Promise<boolean> {
  return await supabaseIntegrationService.removeSimulatedData();
}

// Exportar tipos para uso em outros módulos
export type { SessionData, ProcessingResponse };

