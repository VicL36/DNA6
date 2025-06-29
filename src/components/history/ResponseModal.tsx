import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MessageCircle,
  FileText
} from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  created_at: string;
  status: string;
}

interface Response {
  id: string;
  question_index: number;
  question_text: string;
  transcript_text?: string;
  audio_duration?: number;
  created_at: string;
}

interface ResponseModalProps {
  session: Session | null;
  responses: Response[];
  onClose: () => void;
}

export default function ResponseModal({ session, responses, onClose }: ResponseModalProps) {
  if (!session) return null;

  const totalDuration = responses.reduce((acc, r) => acc + (r.audio_duration || 0), 0);

  return (
    <Dialog open={!!session} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glass-morphism border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-text-primary">
            <MessageCircle className="w-5 h-5 text-neon-orange" />
            Detalhes da Sessão #{session.id.slice(-6)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
         
          {/* Session Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-morphism border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <Calendar className="w-4 h-4" />
                  Data da Sessão
                </div>
                <p className="font-semibold text-text-primary">
                  {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <Clock className="w-4 h-4" />
                  Duração Total
                </div>
                <p className="font-semibold text-text-primary">
                  {Math.round(totalDuration / 60)} minutos
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <FileText className="w-4 h-4" />
                  Status
                </div>
                <Badge className={
                  session.status === 'completed'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-neon-blue/20 text-neon-blue border-neon-blue/30'
                }>
                  {session.status === 'completed' ? 'Completa' : 'Em Andamento'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Responses List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text-primary">
              Respostas da Sessão ({responses.length})
            </h3>
           
            <div className="space-y-4">
              {responses
                .sort((a, b) => a.question_index - b.question_index)
                .map((response, index) => (
                <Card key={response.id} className="glass-morphism border-l-4 border-l-neon-blue border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-6 h-6 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center text-sm font-semibold">
                        {response.question_index}
                      </span>
                      Pergunta {response.question_index}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-dark-surface/60 rounded-lg p-3">
                      <p className="text-sm font-medium text-text-secondary mb-2">Pergunta:</p>
                      <p className="text-text-primary">{response.question_text}</p>
                    </div>
                   
                    {response.transcript_text && (
                      <div className="bg-neon-blue/10 rounded-lg p-3">
                        <p className="text-sm font-medium text-neon-blue mb-2">Sua Resposta:</p>
                        <p className="text-text-primary">{response.transcript_text}</p>
                      </div>
                    )}
                   
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>⏱️ Duração: {Math.round(response.audio_duration || 0)}s</span>
                      <span>📅 {format(new Date(response.created_at), 'dd/MM HH:mm')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}