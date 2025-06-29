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
  Activity
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
        '-created_date',
        10
      );
      setSessions(userSessions);

      const allResponses = await UserResponse.list('-created_date', 50);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
       
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              Bem-vindo, {user?.full_name?.split(' ')[0] || 'Usuário'}
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Acompanhe seu progresso na análise narrativa
            </p>
          </div>
         
          <Link to={createPageUrl("Analysis")}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Mic className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Nova Análise
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
              <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Link to={createPageUrl("Analysis")} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                    >
                      <Play className="w-4 h-4 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Iniciar Sessão</div>
                        <div className="text-xs text-slate-500">Nova análise narrativa</div>
                      </div>
                    </Button>
                  </Link>
                 
                  <Link to={createPageUrl("History")} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <div className="text-left">
                        <div className="font-medium">Ver Histórico</div>
                        <div className="text-xs text-slate-500">Sessões anteriores</div>
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