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
  Zap
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
         
          <Link to={createPageUrl("Analysis")}>
            <Button
              size="lg"
              className="btn-neon-blue shadow-neon-blue hover:shadow-neon-blue-lg transition-all duration-300 group"
            >
              <Mic className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Nova Análise
              <Zap className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </motion.div>

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