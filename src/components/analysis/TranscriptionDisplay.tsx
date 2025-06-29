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
      <Card className="glass-morphism border-0 shadow-glass">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-neon-blue" />
                <span className="text-neon-blue text-glow-blue">Processando...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 text-neon-orange" />
                <span className="text-neon-orange text-glow-orange">Transcrição da sua resposta</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="metallic-surface rounded-lg p-4 min-h-[100px]">
            {isProcessing ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-text-secondary">
                  Convertendo áudio em texto...
                </div>
              </div>
            ) : (
              <p className="text-text-primary text-lg leading-relaxed">
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
              <p className="text-sm text-text-secondary">
                Avançando para a próxima pergunta em alguns segundos...
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}