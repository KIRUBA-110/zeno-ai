/**
 * VoiceButton - Microphone button for voice input (Gemini-style)
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';

interface VoiceButtonProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export function VoiceButton({ onTranscript, disabled = false }: VoiceButtonProps) {
    const {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording,
        error
    } = useVoice({
        onTranscript,
        onError: (err) => console.error('Voice error:', err)
    });

    const handleClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="relative">
            {/* Pulsing background when recording */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0.2, 0.5],
                        }}
                        exit={{ scale: 1, opacity: 0 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            filter: "blur(8px)",
                        }}
                    />
                )}
            </AnimatePresence>

            <motion.button
                onClick={handleClick}
                disabled={disabled || isTranscribing}
                className={`
                    relative p-2 rounded-full transition-all duration-200
                    ${isRecording
                        ? 'bg-red-500 text-white'
                        : 'hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                    }
                    ${(disabled || isTranscribing) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                whileHover={{ scale: !disabled ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                title={isRecording ? "Stop recording" : "Start voice input"}
            >
                {isTranscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                    <MicOff className="w-5 h-5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}
            </motion.button>

            {/* Error tooltip */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                   px-3 py-1 bg-red-500 text-white text-xs rounded-lg whitespace-nowrap z-50"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
