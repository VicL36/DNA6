import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Square,
  Play,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export default function AudioRecorder({ onRecordingComplete, isProcessing, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmitRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
           
            {/* Recording Status */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">Gravando...</span>
                  </div>
                  <p className="text-2xl font-mono mt-2 text-red-700">
                    {formatTime(recordingTime)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Recording Button */}
            <div className="flex justify-center">
              {!isRecording && !audioBlob && (
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={disabled}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </Button>
              )}

              {isRecording && (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Square className="w-8 h-8 text-white" />
                </Button>
              )}
            </div>

            {/* Recording Instructions */}
            {!isRecording && !audioBlob && !isProcessing && (
              <div className="text-slate-600">
                <p className="text-lg font-medium mb-2">
                  Clique no microfone para começar a gravar
                </p>
                <p className="text-sm">
                  Responda à pergunta de forma natural e espontânea
                </p>
              </div>
            )}

            {/* Recorded Audio Actions */}
            <AnimatePresence>
              {audioBlob && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-emerald-700 font-medium">
                      Gravação concluída ({formatTime(recordingTime)})
                    </p>
                  </div>
                 
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAudioBlob(null);
                        setRecordingTime(0);
                      }}
                    >
                      Gravar Novamente
                    </Button>
                    <Button
                      onClick={handleSubmitRecording}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      Enviar Resposta
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing State */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-center gap-3 text-blue-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-medium">Processando sua resposta...</span>
                  </div>
                  <p className="text-sm text-blue-500 mt-2">
                    Gerando transcrição e análise
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}