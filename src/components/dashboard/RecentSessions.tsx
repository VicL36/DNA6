import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Play,
  CheckCircle,
  Pause,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  id: string;
  created_at: string;
  status: string;
  current_question: number;
  total_questions: number;
}

interface RecentSessionsProps {
  sessions: Session[];
  isLoading: boolean;
  onSessionSelect: (session: Session) => void;
}

export default function RecentSessions({ sessions, isLoading, onSessionSelect }: RecentSessionsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'active':
        return <Play className="w-4 h-4 text-neon-blue" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-neon-orange" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'active':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'paused':
        return 'bg-neon-orange/20 text-neon-orange border-neon-orange/30';
      default:
        return 'bg-text-muted/20 text-text-muted border-text-muted/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-morphism border-0 shadow-glass">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-neon-blue" />
            <span className="text-glow-blue">Sessões Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full bg-dark-surface" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2 bg-dark-surface" />
                      <Skeleton className="h-3 w-20 bg-dark-surface" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 bg-dark-surface" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-secondary mb-2">
                Nenhuma sessão encontrada
              </h3>
              <p className="text-text-muted">
                Inicie sua primeira análise para começar a ver o histórico.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-dark-elevated transition-all duration-200 cursor-pointer card-hover"
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-neon-orange to-neon-blue rounded-full flex items-center justify-center">
                      {getStatusIcon(session.status)}
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
                    <Badge className={`${getStatusColor(session.status)} border`}>
                      {session.status === 'completed' ? 'Completa' :
                       session.status === 'active' ? 'Ativa' :
                       session.status === 'paused' ? 'Pausada' : 'Pendente'}
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      {session.current_question}/{session.total_questions}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}