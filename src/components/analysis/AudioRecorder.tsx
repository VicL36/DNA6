import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Square,
  Loader2,
  Play,
  Pause,
  Keyboard,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onTextResponse: (text: string) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export default function AudioRecorder({ onRecordingComplete, onTextResponse, isProcessing, disabled }: AudioRecorderProps) {
  const [responseMode, setResponseMode] = useState<'audio' | 'text'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textResponse, setTextResponse] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Erro ao acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSubmitRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime);
      
      // Clean up
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setIsPlaying(false);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    }
  };

  const handleSubmitText = () => {
    if (textResponse.trim()) {
      onTextResponse(textResponse.trim());
      
      // Clean up
      setTextResponse('');
    }
  };

  const handleDiscardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
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
      <Card className="glass-morphism border-0 shadow-glass">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
           
            {/* Response Mode Toggle */}
            {!isProcessing && !audioBlob && !isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-6"
              >
                <div className="metallic-elevated rounded-lg p-1 flex">
                  <Button
                    variant={responseMode === 'audio' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setResponseMode('audio')}
                    className={`flex items-center gap-2 ${
                      responseMode === 'audio' 
                        ? 'btn-neon-blue shadow-neon-blue' 
                        : 'text-text-secondary hover:text-neon-blue'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Áudio
                  </Button>
                  <Button
                    variant={responseMode === 'text' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setResponseMode('text')}
                    className={`flex items-center gap-2 ${
                      responseMode === 'text' 
                        ? 'btn-neon-orange shadow-neon-orange' 
                        : 'text-text-secondary hover:text-neon-orange'
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                    Texto
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Audio Recording Mode */}
            {responseMode === 'audio' && (
              <>
                {/* Recording Status */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="metallic-elevated rounded-lg p-4 neon-border-orange"
                    >
                      <div className="flex items-center justify-center gap-2 text-neon-orange">
                        <div className="w-3 h-3 bg-neon-orange rounded-full animate-pulse-orange" />
                        <span className="font-medium text-glow-orange">Gravando...</span>
                      </div>
                      <p className="text-2xl font-mono mt-2 text-neon-orange text-glow-orange">
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
                      className="w-24 h-24 rounded-full btn-neon-blue shadow-neon-blue hover:shadow-neon-blue-lg transition-all duration-300 group"
                    >
                      <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      size="lg"
                      onClick={stopRecording}
                      className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 shadow-neon-orange hover:shadow-neon-orange-lg transition-all duration-300"
                    >
                      <Square className="w-8 h-8 text-white" />
                    </Button>
                  )}
                </div>

                {/* Recording Instructions */}
                {!isRecording && !audioBlob && !isProcessing && (
                  <div className="text-text-secondary">
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
                      <div className="metallic-elevated rounded-lg p-4 neon-border-blue">
                        <p className="text-neon-blue font-medium text-glow-blue mb-3">
                          Gravação concluída ({formatTime(recordingTime)})
                        </p>
                        
                        {/* Audio playback */}
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={playRecording}
                            className="bg-transparent border-white/20 text-text-secondary hover:border-neon-blue hover:text-neon-blue"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlaying ? 'Pausar' : 'Reproduzir'}
                          </Button>
                        </div>
                      </div>
                     
                      <div className="flex gap-4 justify-center">
                        <Button
                          variant="outline"
                          onClick={handleDiscardRecording}
                          className="bg-transparent border-white/20 text-text-secondary hover:border-red-400 hover:text-red-400"
                        >
                          Gravar Novamente
                        </Button>
                        <Button
                          onClick={handleSubmitRecording}
                          className="btn-neon-orange shadow-neon-orange hover:shadow-neon-orange-lg"
                        >
                          Enviar Resposta
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Text Response Mode */}
            {responseMode === 'text' && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="metallic-elevated rounded-lg p-4 neon-border-orange">
                  <p className="text-neon-orange font-medium text-glow-orange mb-4">
                    Digite sua resposta
                  </p>
                  
                  <textarea
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder="Escreva sua resposta aqui..."
                    disabled={disabled}
                    className="w-full h-32 p-4 bg-dark-surface/50 border border-white/10 rounded-lg text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-colors"
                    maxLength={2000}
                  />
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-text-muted">
                      {textResponse.length}/2000 caracteres
                    </span>
                    <Button
                      onClick={handleSubmitText}
                      disabled={!textResponse.trim() || disabled}
                      className="btn-neon-orange shadow-neon-orange hover:shadow-neon-orange-lg flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar Resposta
                    </Button>
                  </div>
                </div>
                
                <div className="text-text-secondary text-sm">
                  <p>
                    Responda à pergunta de forma detalhada e reflexiva
                  </p>
                </div>
              </motion.div>
            )}

            {/* Processing State */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="metallic-elevated rounded-lg p-6 neon-border-blue"
                >
                  <div className="flex items-center justify-center gap-3 text-neon-blue">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-medium text-glow-blue">Processando sua resposta...</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {responseMode === 'audio' ? 'Gerando transcrição e análise' : 'Analisando resposta'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden audio element for playback */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

