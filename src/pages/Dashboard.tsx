import React, { useState, useEffect } from "react";
import { AnalysisSession, UserResponse } from "@/entities/all";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Brain,
  Mic,
  Clock,
  TrendingUp,
  Play,
  BarChart3,
  Activity,
  Rocket,
  Zap,
  PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentSessions from "../components/dashboard/RecentSessions";
import AnalyticsChart from "../components/dashboard/AnalyticsChart";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
     
      const userSessions = await AnalysisSession.filter(
        { user_email: currentUser.email },
        '-created_at',
        10
      );
      setSessions(userSessions);

      // Verificar se há sessão ativa
      const activeSessions = userSessions.filter(s => s.status === 'active');
      if (activeSessions.length > 0) {
        setActiveSession(activeSessions[0]);
      }

      const allResponses = await UserResponse.list('-created_at', 50);
      setResponses(allResponses);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const stats = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    totalResponses: responses.length,
    avgResponseTime: responses.length > 0
      ? Math.round(responses.reduce((acc, r) => acc + (r.audio_duration || 0), 0) / responses.length)
      : 0
  };

  const getSessionProgress = (session) => {
    if (!session) return 0;
    return Math.round((session.current_question / session.total_questions) * 100);
  };

  return (
    <div className="min-h-screen bg-dark-bg neural-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
       
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Bem-vindo, <span className="text-glow-orange">{user?.full_name?.split(' ')[0] || 'Usuário'}</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Acompanhe seu progresso na análise narrativa profunda
            </p>
          </div>
         
          <div className="flex gap-4">
            {/* Continue de onde parou - só aparece se há sessão ativa */}
            {activeSession && (
              <Link to={createPageUrl("Analysis")}>
                <Button
                  size="lg"
                  className="btn-neon-orange shadow-neon-orange hover:shadow-neon-orange-lg transition-all duration-300 group"
                >
                  <PlayCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Continue de onde parou
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {getSessionProgress(activeSession)}%
                  </span>
                </Button>
              </Link>
            )}
            
            <Link to={createPageUrl("Analysis")}>
              <Button
                size="lg"
                className="btn-neon-blue shadow-neon-blue hover:shadow-neon-blue-lg transition-all duration-300 group"
              >
                <Mic className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                {activeSession ? 'Nova Análise' : 'Iniciar Análise'}
                <Zap className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Continue de onde parou - Card destacado */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-morphism border-0 shadow-glass card-hover bg-gradient-to-r from-neon-orange/10 to-neon-blue/10 border-neon-orange/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-neon-orange to-neon-blue rounded-xl flex items-center justify-center animate-pulse-orange">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-primary text-glow-orange">
                        Continue sua Análise DNA
                      </h3>
                      <p className="text-text-secondary">
                        Você parou na pergunta {activeSession.current_question} de {activeSession.total_questions}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-32 h-2 bg-dark-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-neon-orange to-neon-blue transition-all duration-500"
                            style={{ width: `${getSessionProgress(activeSession)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neon-orange">
                          {getSessionProgress(activeSession)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={createPageUrl("Analysis")}>
                    <Button className="btn-neon-orange shadow-neon-orange hover:shadow-neon-orange-lg">
                      Continuar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <StatsGrid stats={stats} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
         
          {/* Recent Sessions */}
          <div className="lg:col-span-2">
            <RecentSessions
              sessions={sessions}
              isLoading={isLoading}
              onSessionSelect={(session) => console.log('Selected session:', session)}
            />
          </div>

          {/* Analytics & Quick Actions */}
          <div className="space-y-6">
           
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-morphism border-0 shadow-glass card-hover">
                <CardHeader className="bg-gradient-to-r from-neon-orange to-neon-blue text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Link to={createPageUrl("Analysis")} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 bg-transparent border-white/20 text-text-secondary hover:border-neon-blue hover:text-neon-blue hover:bg-dark-elevated transition-all duration-300"
                    >
                      <Play className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">Iniciar Sessão</div>
                        <div className="text-xs text-text-muted">Nova análise narrativa</div>
                      </div>
                    </Button>
                  </Link>
                 
                  <Link to={createPageUrl("History")} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 bg-transparent border-white/20 text-text-secondary hover:border-neon-orange hover:text-neon-orange hover:bg-dark-elevated transition-all duration-300"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">Ver Histórico</div>
                        <div className="text-xs text-text-muted">Sessões anteriores</div>
                      </div>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analytics Chart */}
            <AnalyticsChart responses={responses} isLoading={isLoading} />
           
          </div>
        </div>
      </div>
    </div>
  );
}