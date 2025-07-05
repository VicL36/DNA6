import jsPDF from 'jspdf';
import { supabase } from './supabase';

// Interface para dados do relatório
interface ReportData {
  sessionId: string;
  userEmail: string;
  userName?: string;
  responses: any[];
  analysisData: any;
  createdAt: string;
  completedAt?: string;
}

// Interface para dados de transcrição
interface TranscriptionData {
  sessionId: string;
  userEmail: string;
  responses: any[];
  createdAt: string;
}

// Interface para resposta de geração de PDF
interface PDFGenerationResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

class PDFGeneratorService {
  
  /**
   * Gera relatório completo em PDF
   */
  async generateReport(data: ReportData): Promise<PDFGenerationResponse> {
    try {
      console.log('📄 Gerando relatório em PDF...');
      
      const pdf = new jsPDF();
      let yPosition = 20;
      
      // Configurações de fonte
      pdf.setFont('helvetica');
      
      // Cabeçalho do relatório
      yPosition = this.addReportHeader(pdf, data, yPosition);
      
      // Resumo executivo
      yPosition = this.addExecutiveSummary(pdf, data, yPosition);
      
      // Análise por domínio
      yPosition = this.addDomainAnalysis(pdf, data, yPosition);
      
      // Respostas detalhadas
      yPosition = this.addDetailedResponses(pdf, data, yPosition);
      
      // Insights e recomendações
      yPosition = this.addInsightsAndRecommendations(pdf, data, yPosition);
      
      // Rodapé
      this.addFooter(pdf);
      
      // Converter para blob
      const pdfBlob = pdf.output('blob');
      
      // Upload para Supabase
      const uploadResult = await this.uploadPDFToSupabase(
        pdfBlob, 
        `report-${data.sessionId}-${Date.now()}.pdf`,
        data.userEmail,
        'reports'
      );
      
      if (!uploadResult.success) {
        throw new Error(`Erro no upload: ${uploadResult.error}`);
      }
      
      // Atualizar sessão com URL do PDF
      await this.updateSessionWithPDF(data.sessionId, uploadResult.pdfUrl!, 'pdf_file_url');
      
      console.log('✅ Relatório PDF gerado com sucesso!');
      
      return {
        success: true,
        pdfUrl: uploadResult.pdfUrl
      };
      
    } catch (error) {
      console.error('❌ Erro na geração do relatório PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Gera transcrição completa em PDF
   */
  async generateTranscription(data: TranscriptionData): Promise<PDFGenerationResponse> {
    try {
      console.log('📝 Gerando transcrição em PDF...');
      
      const pdf = new jsPDF();
      let yPosition = 20;
      
      // Configurações de fonte
      pdf.setFont('helvetica');
      
      // Cabeçalho da transcrição
      yPosition = this.addTranscriptionHeader(pdf, data, yPosition);
      
      // Transcrições das respostas
      yPosition = this.addTranscriptionContent(pdf, data, yPosition);
      
      // Rodapé
      this.addFooter(pdf);
      
      // Converter para blob
      const pdfBlob = pdf.output('blob');
      
      // Upload para Supabase
      const uploadResult = await this.uploadPDFToSupabase(
        pdfBlob, 
        `transcription-${data.sessionId}-${Date.now()}.pdf`,
        data.userEmail,
        'transcriptions'
      );
      
      if (!uploadResult.success) {
        throw new Error(`Erro no upload: ${uploadResult.error}`);
      }
      
      // Atualizar sessão com URL do PDF
      await this.updateSessionWithPDF(data.sessionId, uploadResult.pdfUrl!, 'transcription_pdf_url');
      
      console.log('✅ Transcrição PDF gerada com sucesso!');
      
      return {
        success: true,
        pdfUrl: uploadResult.pdfUrl
      };
      
    } catch (error) {
      console.error('❌ Erro na geração da transcrição PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Adiciona cabeçalho do relatório
   */
  private addReportHeader(pdf: jsPDF, data: ReportData, yPosition: number): number {
    // Título principal
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO DE ANÁLISE PSICOLÓGICA', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Subtítulo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DNA UP Platform - Análise Comportamental', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Informações da sessão
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informações da Sessão:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`ID da Sessão: ${data.sessionId}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Usuário: ${data.userEmail}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Data de Criação: ${new Date(data.createdAt).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 6;
    if (data.completedAt) {
      pdf.text(`Data de Conclusão: ${new Date(data.completedAt).toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 6;
    }
    pdf.text(`Total de Respostas: ${data.responses.length}`, 20, yPosition);
    yPosition += 15;
    
    return yPosition;
  }
  
  /**
   * Adiciona resumo executivo
   */
  private addExecutiveSummary(pdf: jsPDF, data: ReportData, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMO EXECUTIVO', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const summary = data.analysisData?.final_synthesis || 
      'Esta análise psicológica foi conduzida através de uma entrevista estruturada com ' +
      `${data.responses.length} perguntas abrangendo diferentes domínios comportamentais. ` +
      'Os resultados fornecem insights sobre padrões de personalidade, tendências emocionais e características comportamentais.';
    
    const summaryLines = pdf.splitTextToSize(summary, 170);
    pdf.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 5 + 10;
    
    return yPosition;
  }
  
  /**
   * Adiciona análise por domínio
   */
  private addDomainAnalysis(pdf: jsPDF, data: ReportData, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANÁLISE POR DOMÍNIO', 20, yPosition);
    yPosition += 10;
    
    // Agrupar respostas por domínio
    const domainGroups = data.responses.reduce((groups: any, response: any) => {
      const domain = response.question_domain || 'Geral';
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(response);
      return groups;
    }, {});
    
    pdf.setFontSize(10);
    
    Object.entries(domainGroups).forEach(([domain, responses]: [string, any]) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${domain.toUpperCase()}:`, 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      const domainSummary = `Foram analisadas ${responses.length} respostas neste domínio. ` +
        'As respostas indicam padrões consistentes de comportamento e preferências.';
      
      const domainLines = pdf.splitTextToSize(domainSummary, 170);
      pdf.text(domainLines, 25, yPosition);
      yPosition += domainLines.length * 5 + 8;
    });
    
    return yPosition + 10;
  }
  
  /**
   * Adiciona respostas detalhadas
   */
  private addDetailedResponses(pdf: jsPDF, data: ReportData, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESPOSTAS DETALHADAS', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(9);
    
    data.responses.forEach((response: any, index: number) => {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Pergunta
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${response.question_text}`, 20, yPosition);
      yPosition += 8;
      
      // Resposta
      pdf.setFont('helvetica', 'normal');
      if (response.transcript_text) {
        const responseLines = pdf.splitTextToSize(response.transcript_text, 170);
        pdf.text(responseLines, 25, yPosition);
        yPosition += responseLines.length * 4 + 5;
      }
      
      // Metadados
      if (response.emotional_tone || response.analysis_keywords?.length > 0) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        
        if (response.emotional_tone) {
          pdf.text(`Tom emocional: ${response.emotional_tone}`, 25, yPosition);
          yPosition += 4;
        }
        
        if (response.analysis_keywords?.length > 0) {
          pdf.text(`Palavras-chave: ${response.analysis_keywords.join(', ')}`, 25, yPosition);
          yPosition += 4;
        }
        
        pdf.setFontSize(9);
      }
      
      yPosition += 8;
    });
    
    return yPosition;
  }
  
  /**
   * Adiciona insights e recomendações
   */
  private addInsightsAndRecommendations(pdf: jsPDF, data: ReportData, yPosition: number): number {
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INSIGHTS E RECOMENDAÇÕES', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const insights = 'Com base na análise das respostas, foram identificados padrões comportamentais ' +
      'que sugerem características específicas de personalidade. Recomenda-se o desenvolvimento ' +
      'de estratégias personalizadas para potencializar os pontos fortes identificados.';
    
    const insightLines = pdf.splitTextToSize(insights, 170);
    pdf.text(insightLines, 20, yPosition);
    yPosition += insightLines.length * 5 + 10;
    
    return yPosition;
  }
  
  /**
   * Adiciona cabeçalho da transcrição
   */
  private addTranscriptionHeader(pdf: jsPDF, data: TranscriptionData, yPosition: number): number {
    // Título principal
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSCRIÇÃO COMPLETA', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Subtítulo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DNA UP Platform - Registro de Respostas', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Informações da sessão
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informações da Sessão:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`ID da Sessão: ${data.sessionId}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Usuário: ${data.userEmail}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Data: ${new Date(data.createdAt).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total de Respostas: ${data.responses.length}`, 20, yPosition);
    yPosition += 15;
    
    return yPosition;
  }
  
  /**
   * Adiciona conteúdo da transcrição
   */
  private addTranscriptionContent(pdf: jsPDF, data: TranscriptionData, yPosition: number): number {
    pdf.setFontSize(10);
    
    data.responses.forEach((response: any, index: number) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Pergunta
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${response.question_text}`, 20, yPosition);
      yPosition += 8;
      
      // Resposta transcrita
      pdf.setFont('helvetica', 'normal');
      if (response.transcript_text) {
        const responseLines = pdf.splitTextToSize(response.transcript_text, 170);
        pdf.text(responseLines, 20, yPosition);
        yPosition += responseLines.length * 5 + 5;
      } else {
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Resposta não transcrita]', 20, yPosition);
        yPosition += 8;
      }
      
      // Informações adicionais
      if (response.audio_duration) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.text(`Duração do áudio: ${response.audio_duration}s`, 20, yPosition);
        yPosition += 5;
        pdf.setFontSize(10);
      }
      
      yPosition += 10;
    });
    
    return yPosition;
  }
  
  /**
   * Adiciona rodapé
   */
  private addFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`DNA UP Platform - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 290, { align: 'center' });
    }
  }
  
  /**
   * Faz upload do PDF para o Supabase Storage
   */
  private async uploadPDFToSupabase(
    pdfBlob: Blob, 
    fileName: string, 
    userEmail: string, 
    folder: string
  ): Promise<{success: boolean, pdfUrl?: string, error?: string}> {
    try {
      const filePath = `${folder}/${userEmail.replace(/[@.]/g, '_')}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('dna-protocol-files')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
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
        pdfUrl: urlData.publicUrl
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload para Supabase'
      };
    }
  }
  
  /**
   * Atualiza a sessão com a URL do PDF
   */
  private async updateSessionWithPDF(sessionId: string, pdfUrl: string, field: string): Promise<boolean> {
    try {
      const updateData: any = {
        [field]: pdfUrl,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('analysis_sessions')
        .update(updateData)
        .eq('id', sessionId);
      
      if (error) {
        console.error('Erro ao atualizar sessão com PDF:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      return false;
    }
  }
}

// Instância singleton do serviço
export const pdfGeneratorService = new PDFGeneratorService();

// Funções principais para compatibilidade
export async function generateReportPDF(data: ReportData): Promise<PDFGenerationResponse> {
  return await pdfGeneratorService.generateReport(data);
}

export async function generateTranscriptionPDF(data: TranscriptionData): Promise<PDFGenerationResponse> {
  return await pdfGeneratorService.generateTranscription(data);
}

// Exportar tipos para uso em outros módulos
export type { ReportData, TranscriptionData, PDFGenerationResponse };

