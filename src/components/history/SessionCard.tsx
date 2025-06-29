import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Session {
  id: string;
  created_date: string;
  status: string;
  current_question: number;
  total_questions: number;
}

interface Response {
  audio_duration?: number;
}

interface SessionCardProps {
  session: Session;
  responses: Response[];
  onSelect: (session: Session) => void;
  index: number;
}

export default function SessionCard({ session, responses, onSelect, index }: SessionCardProps) {
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
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'active':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'paused':
        return 'bg-neon-orange/20 text-neon-orange border-neon-orange/30';
      default:
        return 'bg-text-muted/20 text-text-muted border-text-muted/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completa';
      case 'active':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      default:
        return 'Pendente';
    }
  };

  const totalDuration = responses.reduce((acc, r) => acc + (r.audio_duration || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass-morphism border-0 shadow-glass card-hover">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
           
            {/* Session Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-orange to-neon-blue rounded-xl flex items-center justify-center">
                {getStatusIcon(session.status)}
              </div>
             
              <div className="space-y-1">
                <h3 className="font-semibold text-text-primary">
                  Sessão #{session.id.slice(-6)}
                </h3>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(session.created_date), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.round(totalDuration / 60)}min
                  </div>
                </div>
              </div>
            </div>

            {/* Session Stats & Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge className={`${getStatusColor(session.status)} border mb-2`}>
                  {getStatusText(session.status)}
                </Badge>
                <div className="text-sm text-text-secondary">
                  {session.current_question}/{session.total_questions} perguntas
                </div>
              </div>
             
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(session)}
                className="gap-2 bg-transparent border-white/20 text-text-secondary hover:border-neon-blue hover:text-neon-blue"
              >
                <Eye className="w-4 h-4" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}