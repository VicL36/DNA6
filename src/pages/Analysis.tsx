import React, { useState, useEffect } from "react";
import { AnalysisSession, UserResponse } from "@/entities/all";
import { User } from "@/entities/User";
import { 
  transcribeAudio, 
  generateAnalysis, 
  UploadFile, 
  saveTranscriptionToDrive,
  generateFinalReportToDrive 
} from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DNA_ANALYSIS_QUESTIONS } from "@/data/questions";
import { ArrowLeft, CheckCircle, Loader2, FileText, Brain, Rocket, UploadCloud as CloudUpload, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AudioRecorder from "@/components/analysis/AudioRecorder";
import QuestionDisplay from "@/components/analysis/QuestionDisplay";
import TranscriptionDisplay from "@/components/analysis/TranscriptionDisplay";

export default function Analysis() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      console.log('🔄 Inicializando sessão de análise...')
      const currentUser = await User.me();
      setUser(currentUser);
     
      // Verificar se existe sessão ativa
      const activeSessions = await AnalysisSession.filter(
        { user_email: currentUser.email, status: 'active' },
        '-created_at',
        1
      );

      if (activeSessions.length > 0) {
        // Continuar sessão existente
        const session = activeSessions[0];
        console.log('✅ Continuando sessão existente:', session.id)
        setCurrentSession(session);
        setCurrentQuestionIndex(session.current_question - 1);
      } else {
        // Criar nova sessão
        console.log('🆕 Criando nova sessão...')
        const session = await AnalysisSession.create({
          user_email: currentUser.email,
          status: "active",
          current_question: 1,
          total_questions: DNA_ANALYSIS_QUESTIONS.length,
          progress_percentage: 0
        });
        console.log('✅ Nova sessão criada:', session.id)
        setCurrentSession(session);
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar sessão:", error);
    }
  };

  const handleAudioEnded = () => {
    console.log('🔊 Áudio da pergunta terminou')
    setAudioEnded(true);
  };

  const handleRecordingComplete = async (audioBlob, duration) => {
    if (!currentSession) {
      console.error('❌ Nenhuma sessão ativa')
      return;
    }
   
    console.log('🎤 Processando gravação...', { 
      duration, 
      sessionId: currentSession.id,
      questionIndex: currentQuestionIndex + 1
    })
    
    setIsProcessing(true);
    setUploadStatus("Preparando upload...");
   
    try {
      const currentQuestion = DNA_ANALYSIS_QUESTIONS[currentQuestionIndex];
      
      // 1. Upload do arquivo de áudio para Google Drive
      setUploadStatus("📤 Enviando áudio para Google Drive...");
      console.log('📤 Fazendo upload do áudio para Google Drive...')
      
      const audioFile = new File([audioBlob], `${user.email}_q${currentQuestionIndex + 1}_${Date.now()}.wav`, {
        type: 'audio/wav'
      });
     
      const uploadResult = await UploadFile({ 
        file: audioFile,
        userEmail: user.email,
        questionIndex: currentQuestionIndex + 1,
        questionText: currentQuestion.text
      });
      
      console.log('✅ Áudio enviado para Google Drive:', uploadResult.file_url)
      setUploadStatus("✅ Áudio salvo no Google Drive");

      // 2. Gerar transcrição
      setUploadStatus("🎤 Gerando transcrição...");
      console.log('🎤 Gerando transcrição...')
      const transcriptionResult = await transcribeAudio(audioBlob);
      console.log('✅ Transcrição gerada:', transcriptionResult.transcription?.substring(0, 50) + '...')

      // 3. Salvar transcrição no Google Drive
      setUploadStatus("📝 Salvando transcrição no Google Drive...");
      console.log('📝 Salvando transcrição no Google Drive...')
      const transcriptionUpload = await saveTranscriptionToDrive(
        transcriptionResult.transcription || '',
        user.email,
        currentQuestionIndex + 1,
        currentQuestion.text
      );
      console.log('✅ Transcrição salva no Google Drive:', transcriptionUpload.fileUrl)

      // 4. Salvar resposta no banco de dados
      setUploadStatus("💾 Salvando no banco de dados...");
      console.log('💾 Salvando resposta no banco...')
      await UserResponse.create({
        session_id: currentSession.id,
        question_index: currentQuestionIndex + 1,
        question_text: currentQuestion.text,
        question_domain: currentQuestion.domain,
        transcript_text: transcriptionResult.transcription || "Transcrição em processamento...",
        audio_duration: duration,
        audio_file_url: uploadResult.file_url,
        drive_file_id: uploadResult.drive_file_id,
        analysis_keywords: transcriptionResult.keywords || [],
        sentiment_score: transcriptionResult.confidence_score || 0,
        emotional_tone: transcriptionResult.emotional_tone || null
      });

      setTranscript(transcriptionResult.transcription || "Transcrição em processamento...");
      setUploadStatus("✅ Tudo salvo com sucesso!");

      setTimeout(() => {
        handleNextQuestion();
      }, 3000);
     
    } catch (error) {
      console.error("❌ Erro ao processar gravação:", error);
      setTranscript("Erro ao processar a gravação. Tente novamente.");
      setUploadStatus("❌ Erro no processamento");
    }
   
    setIsProcessing(false);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < DNA_ANALYSIS_QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const progressPercentage = Math.round(((nextIndex + 1) / DNA_ANALYSIS_QUESTIONS.length) * 100);
      
      console.log('➡️ Avançando para próxima pergunta:', nextIndex + 1)
      
      setCurrentQuestionIndex(nextIndex);
      setTranscript("");
      setAudioEnded(false);
      setUploadStatus("");
     
      await AnalysisSession.update(currentSession.id, {
        current_question: nextIndex + 1,
        progress_percentage: progressPercentage
      });
    } else {
      // Completar sessão e gerar análise
      console.log('🏁 Sessão completa, gerando análise final...')
      await completeSessionAndGenerateAnalysis();
    }
  };

  const completeSessionAndGenerateAnalysis = async () => {
    setIsGeneratingReport(true);
   
    try {
      console.log('📊 Buscando todas as respostas da sessão...')
      // Buscar todas as respostas da sessão
      const responses = await UserResponse.filter({ session_id: currentSession.id });
     
      // Compilar todas as transcrições
      const transcriptions = responses
        .sort((a, b) => a.question_index - b.question_index)
        .map(r => `PERGUNTA ${r.question_index}: ${r.question_text}\n\nRESPOSTA: ${r.transcript_text}`)

      console.log('🧠 Gerando análise psicológica completa...')
      // Gerar análise psicológica completa
      const analysisResult = await generateAnalysis(transcriptions);

      console.log('📄 Gerando relatório final no Google Drive...')
      // Gerar relatório final no Google Drive
      const reportUpload = await generateFinalReportToDrive(
        user.email,
        analysisResult,
        responses
      );

      console.log('💾 Atualizando sessão como completa...')
      // Atualizar sessão com análise final
      await AnalysisSession.update(currentSession.id, {
        status: "completed",
        progress_percentage: 100,
        final_synthesis: analysisResult.analysis_document || "Análise completa gerada com sucesso.",
        pdf_file_url: reportUpload.fileUrl
      });

      setSessionCompleted(true);
     
    } catch (error) {
      console.error("❌ Erro ao gerar análise:", error);
    }
   
    setIsGeneratingReport(false);
  };

  const progress = ((currentQuestionIndex + 1) / DNA_ANALYSIS_QUESTIONS.length) * 100;
  const currentDomain = DNA_ANALYSIS_QUESTIONS[currentQuestionIndex]?.domain;

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-dark-bg neural-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card className="glass-morphism shadow-glass border-0">
            <CardContent className="p-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-orange to-neon-blue rounded-full animate-pulse-orange"></div>
                <div className="absolute inset-2 bg-dark-surface rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-neon-orange animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-neon-blue rounded-full flex items-center justify-center animate-float">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4 text-glow-orange">
                Gerando Análise Completa
              </h2>
              <p className="text-text-secondary mb-6">
                Processando suas 108 respostas para criar seu perfil psicológico detalhado...
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neon-blue">
                  <HardDrive className="w-4 h-4" />
                  <span>Salvando no Google Drive</span>
                </div>
                <div className="text-sm text-text-muted">
                  Este processo pode levar alguns minutos
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="min-h-screen bg-dark-bg neural-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card className="glass-morphism shadow-glass border-0">
            <CardContent className="p-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-neon-blue rounded-full animate-pulse-blue"></div>
                <div className="absolute inset-2 bg-dark-surface rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-neon-orange rounded-full flex items-center justify-center animate-float">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4 text-glow-blue">
                Análise DNA UP Concluída!
              </h2>
              <p className="text-text-secondary mb-6">
                Suas 108 respostas foram processadas e sua análise psicológica completa foi gerada com sucesso.
              </p>
              <div className="space-y-3">
                <div className="metallic-elevated rounded-lg p-4 neon-border-orange">
                  <div className="flex items-center gap-2 text-neon-orange">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium text-glow-orange">Análise Completa Gerada</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Relatório detalhado salvo no Google Drive
                  </p>
                </div>
                <div className="metallic-elevated rounded-lg p-4 neon-border-blue">
                  <div className="flex items-center gap-2 text-neon-blue">
                    <CloudUpload className="w-5 h-5" />
                    <span className="font-medium text-glow-blue">Arquivos Salvos</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Áudios e transcrições no Google Drive
                  </p>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="w-full btn-neon-blue shadow-neon-blue hover:shadow-neon-blue-lg"
                >
                  Finalizar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg neural-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
       
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="gap-2 bg-transparent border-white/20 text-text-secondary hover:border-neon-orange hover:text-neon-orange"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
         
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary text-glow-orange">Análise DNA UP Completa</h1>
            <p className="text-text-secondary">
              Pergunta {currentQuestionIndex + 1} de {DNA_ANALYSIS_QUESTIONS.length}
            </p>
            <p className="text-sm text-neon-blue font-medium text-glow-blue">
              {currentDomain}
            </p>
          </div>
         
          <div className="w-20" />
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="progress-neon h-4 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-orange to-neon-blue transition-all duration-500 shadow-neon-orange"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>{Math.round(progress)}% concluído</span>
            <span>{DNA_ANALYSIS_QUESTIONS.length - currentQuestionIndex - 1} perguntas restantes</span>
          </div>
        </motion.div>

        {/* Upload Status */}
        <AnimatePresence>
          {uploadStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Card className="glass-morphism border-0 shadow-glass border-neon-blue/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-neon-blue">
                    <CloudUpload className="w-5 h-5" />
                    <span className="text-sm font-medium">{uploadStatus}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="space-y-8">
         
          {/* Question Display */}
          <QuestionDisplay
            question={DNA_ANALYSIS_QUESTIONS[currentQuestionIndex].text}
            audioUrl={DNA_ANALYSIS_QUESTIONS[currentQuestionIndex].audioUrl}
            questionNumber={currentQuestionIndex + 1}
            domain={currentDomain}
            onAudioEnded={handleAudioEnded}
          />

          {/* Audio Recorder - Only show after audio ends */}
          <AnimatePresence>
            {audioEnded && (
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
                disabled={isProcessing}
              />
            )}
          </AnimatePresence>

          {/* Transcription Display */}
          <AnimatePresence>
            {transcript && (
              <TranscriptionDisplay
                transcript={transcript}
                isProcessing={isProcessing}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}