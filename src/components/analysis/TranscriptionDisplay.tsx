import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TranscriptionDisplayProps {
  transcript: string;
  isProcessing: boolean;
}

export default function TranscriptionDisplay({ transcript, isProcessing }: TranscriptionDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Processando...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 text-emerald-600" />
                Transcrição da sua resposta
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-slate-50 rounded-lg p-4 min-h-[100px]">
            {isProcessing ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-slate-500">
                  Convertendo áudio em texto...
                </div>
              </div>
            ) : (
              <p className="text-slate-700 text-lg leading-relaxed">
                {transcript}
              </p>
            )}
          </div>
         
          {!isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-slate-500">
                Avançando para a próxima pergunta em alguns segundos...
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}