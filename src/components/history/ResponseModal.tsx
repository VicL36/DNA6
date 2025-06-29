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
  created_date: string;
  status: string;
}

interface Response {
  id: string;
  question_index: number;
  question_text: string;
  transcript_text?: string;
  audio_duration?: number;
  created_date: string;
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="w-5 h-5" />
            Detalhes da Sessão #{session.id.slice(-6)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
         
          {/* Session Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  Data da Sessão
                </div>
                <p className="font-semibold">
                  {format(new Date(session.created_date), 'dd/MM/yyyy HH:mm')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Clock className="w-4 h-4" />
                  Duração Total
                </div>
                <p className="font-semibold">
                  {Math.round(totalDuration / 60)} minutos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <FileText className="w-4 h-4" />
                  Status
                </div>
                <Badge className={
                  session.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }>
                  {session.status === 'completed' ? 'Completa' : 'Em Andamento'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Responses List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Respostas da Sessão ({responses.length})
            </h3>
           
            <div className="space-y-4">
              {responses
                .sort((a, b) => a.question_index - b.question_index)
                .map((response, index) => (
                <Card key={response.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {response.question_index}
                      </span>
                      Pergunta {response.question_index}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">Pergunta:</p>
                      <p className="text-slate-600">{response.question_text}</p>
                    </div>
                   
                    {response.transcript_text && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-700 mb-2">Sua Resposta:</p>
                        <p className="text-blue-600">{response.transcript_text}</p>
                      </div>
                    )}
                   
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>⏱️ Duração: {Math.round(response.audio_duration || 0)}s</span>
                      <span>📅 {format(new Date(response.created_date), 'dd/MM HH:mm')}</span>
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