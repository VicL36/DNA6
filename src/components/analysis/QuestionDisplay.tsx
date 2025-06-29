import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Volume2, Check, Brain, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function QuestionDisplay({ question, audioUrl, questionNumber, domain, onAudioEnded }) {
  const audioRef = useRef(null);
  const [audioEnded, setAudioEnded] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioError, setAudioError] = React.useState(false);

  useEffect(() => {
    // Reset states when question changes
    setAudioEnded(false);
    setIsPlaying(false);
    setAudioError(false);

    // Auto-play audio when component mounts
    if (audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing audio:", error);
          setAudioError(true);
          // If audio fails, show question immediately
          handleAudioEnded();
        }
      };
      
      // Small delay to ensure component is mounted
      setTimeout(playAudio, 500);
    }
  }, [questionNumber]);

  const handleAudioEnded = () => {
    setAudioEnded(true);
    setIsPlaying(false);
    if (onAudioEnded) {
      onAudioEnded();
    }
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setAudioError(true);
    // If audio fails to load, show question immediately
    handleAudioEnded();
  };

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-morphism border-0 shadow-glass card-hover">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
           
            {/* Domain and Question Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-neon-orange mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider text-glow-orange">{domain}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-neon-blue">
                <MessageCircle className="w-6 h-6" />
                <span className="font-semibold text-lg text-glow-blue">Pergunta {questionNumber}</span>
              </div>
            </div>

            {/* Audio Player */}
            <div className="flex flex-col items-center justify-center">
              <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 metallic-elevated ${
                isPlaying ? 'neon-border-orange animate-pulse-orange' :
                audioEnded ? 'neon-border-blue' :
                audioError ? 'border-red-500/30' :
                'border-white/20'
              }`}>
                {audioError ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : audioEnded ? (
                  <Check className="w-5 h-5 text-neon-blue" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Volume2 className={`w-5 h-5 ${isPlaying ? 'text-neon-orange animate-pulse' : 'text-text-muted'}`} />
                    {isPlaying && (
                      <div className="audio-visualizer">
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                      </div>
                    )}
                  </div>
                )}
                <span className={`text-sm font-medium ${
                  isPlaying ? 'text-neon-orange text-glow-orange' :
                  audioEnded ? 'text-neon-blue text-glow-blue' :
                  audioError ? 'text-red-400' :
                  'text-text-secondary'
                }`}>
                  {audioError ? 'Pergunta disponível para leitura' :
                   isPlaying ? 'Reproduzindo pergunta...' :
                   audioEnded ? 'Áudio concluído' :
                   'Aguardando reprodução'}
                </span>
              </div>
             
              {/* Hidden audio element with fallback */}
              <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onPlay={handleAudioPlay}
                onPause={handleAudioPause}
                onError={handleAudioError}
                className="hidden"
                preload="auto"
              >
                <source src={audioUrl} type="audio/mpeg" />
                <source src={audioUrl.replace('.mp3', '.wav')} type="audio/wav" />
                <source src={audioUrl.replace('.mp3', '.ogg')} type="audio/ogg" />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            </div>

            {/* Question Text - Show after audio ends or if audio fails */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: (audioEnded || audioError) ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary leading-relaxed">
                {question}
              </h2>
            </motion.div>

            {(audioEnded || audioError) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-text-secondary text-lg"
              >
                Agora você pode gravar sua resposta
              </motion.p>
            )}
           
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}