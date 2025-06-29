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
      const currentUser = await User.me();
      setUser(currentUser);
     
      const userSessions = await AnalysisSession.filter(
        { user_email: currentUser.email },
        '-created_date'
      );
      setSessions(userSessions);

      const allResponses = await UserResponse.list('-created_date');
      setResponses(allResponses);
    } catch (error) {
      console.error("Error loading history:", error);
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
                    <SessionCard
                      key={session.id}
                      session={session}
                      responses={getSessionResponses(session.id)}
                      onSelect={setSelectedSession}
                      index={index}
                    />
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