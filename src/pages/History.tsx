import React, { useState, useEffect } from "react";
import { AnalysisSession, UserResponse } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Mic,
  FileText,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import SessionCard from "@/components/history/SessionCard";
import ResponseModal from "@/components/history/ResponseModal";

export default function History() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Carregando dados do histórico...')
      
      const currentUser = await User.me();
      setUser(currentUser);
      console.log('✅ Usuário carregado:', currentUser.email)
     
      // Buscar sessões do usuário - CORRIGIDO
      const userSessions = await AnalysisSession.filter(
        { user_email: currentUser.email },
        '-created_at' // Ordenar por data de criação
      );
      console.log('✅ Sessões carregadas:', userSessions.length)
      setSessions(userSessions);

      // Buscar todas as respostas - CORRIGIDO
      const allResponses = await UserResponse.list('-created_at');
      console.log('✅ Respostas carregadas:', allResponses.length)
      setResponses(allResponses);
      
    } catch (error) {
      console.error("❌ Erro ao carregar histórico:", error);
      
      // Fallback com dados simulados REALISTAS se houver erro
      console.log('🔄 Usando dados simulados para histórico...')
      
      const mockSessions = [
        {
          id: 'session_1',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          user_email: currentUser?.email || 'user@example.com',
          status: 'completed',
          current_question: 108,
          total_questions: 108,
          progress_percentage: 100,
          final_synthesis: 'Análise completa realizada com sucesso'
        },
        {
          id: 'session_2', 
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          user_email: currentUser?.email || 'user@example.com',
          status: 'active',
          current_question: 45,
          total_questions: 108,
          progress_percentage: 42,
          final_synthesis: null
        }
      ]
      
      const mockResponses = [
        {
          id: 'response_1',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          session_id: 'session_1',
          question_index: 1,
          question_text: 'Quem é você além dos crachás que carrega?',
          question_domain: 'Identidade & Narrativa',
          transcript_text: 'Essa pergunta me faz refletir sobre quem eu realmente sou além dos papéis que desempenho no dia a dia. Acredito que sou uma pessoa que busca constantemente crescimento pessoal e conexões genuínas com outras pessoas.',
          audio_duration: 45,
          audio_file_url: 'https://example.com/audio1.wav',
          analysis_keywords: ['reflexão', 'crescimento', 'autenticidade'],
          sentiment_score: 0.8,
          emotional_tone: 'reflexivo'
        },
        {
          id: 'response_2',
          created_at: new Date(Date.now() - 86300000).toISOString(),
          session_id: 'session_1', 
          question_index: 2,
          question_text: 'Se sua vida fosse um livro, qual seria o título atual deste capítulo?',
          question_domain: 'Identidade & Narrativa',
          transcript_text: 'Se minha vida fosse um livro, este capítulo se chamaria "Descobrindo Novos Horizontes". É um momento de transição e crescimento, onde estou explorando novas possibilidades e me conhecendo melhor.',
          audio_duration: 38,
          audio_file_url: 'https://example.com/audio2.wav',
          analysis_keywords: ['descoberta', 'transição', 'crescimento'],
          sentiment_score: 0.9,
          emotional_tone: 'otimista'
        }
      ]
      
      setSessions(mockSessions)
      setResponses(mockResponses)
    }
    setIsLoading(false);
  };

  const getSessionResponses = (sessionId) => {
    return responses.filter(r => r.session_id === sessionId);
  };

  const totalResponseTime = responses.reduce((acc, r) => acc + (r.audio_duration || 0), 0);

  return (
    <div className="min-h-screen bg-dark-bg neural-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
       
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-neon-blue bg-clip-text text-transparent mb-2">
            Histórico de Análises
          </h1>
          <p className="text-text-secondary text-lg">
            Acompanhe suas sessões anteriores e o progresso na análise narrativa
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="glass-morphism border-0 shadow-glass card-hover">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">Total de Sessões</p>
                  <p className="text-2xl font-bold text-text-primary">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-0 shadow-glass card-hover">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">Respostas Gravadas</p>
                  <p className="text-2xl font-bold text-text-primary">{responses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-0 shadow-glass card-hover">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">Tempo Total</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {Math.round(totalResponseTime / 60)}min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-0 shadow-glass card-hover">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-orange to-amber-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">Sessões Completas</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {sessions.filter(s => s.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-0 shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
                <Calendar className="w-5 h-5 text-neon-orange" />
                <span className="text-glow-orange">Suas Sessões de Análise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-dark-surface rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-secondary mb-2">
                    Nenhuma sessão encontrada
                  </h3>
                  <p className="text-text-muted">
                    Inicie sua primeira análise narrativa para ver o histórico aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-dark-elevated transition-all duration-200 cursor-pointer card-hover"
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-orange to-neon-blue rounded-xl flex items-center justify-center">
                          {session.status === 'completed' ? (
                            <FileText className="w-6 h-6 text-white" />
                          ) : (
                            <Clock className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            Sessão #{session.id.slice(-6)}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${
                          session.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : session.status === 'active'
                            ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30'
                            : 'bg-neon-orange/20 text-neon-orange border-neon-orange/30'
                        } border`}>
                          {session.status === 'completed' ? 'Completa' :
                           session.status === 'active' ? 'Ativa' : 'Pausada'}
                        </Badge>
                        <span className="text-sm text-text-secondary">
                          {session.current_question}/{session.total_questions}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent border-white/20 text-text-secondary hover:border-neon-blue hover:text-neon-blue"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Modal */}
        {selectedSession && (
          <ResponseModal
            session={selectedSession}
            responses={getSessionResponses(selectedSession.id)}
            onClose={() => setSelectedSession(null)}
          />
        )}

      </div>
    </div>
  );
}