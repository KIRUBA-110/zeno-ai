/**
 * ChatMessage - Gemini-style message bubbles
 * 
 * Features:
 * - AI: Sparkle gradient avatar, left-aligned
 * - User: Rounded bubble, right-aligned
 * - Action buttons (copy, regenerate, thumbs)
 * - Text-to-speech for AI messages
 */
'use client';

import { motion } from 'framer-motion';
import { Sparkles, User, Copy, RefreshCw, ThumbsUp, ThumbsDown, Volume2, VolumeX } from 'lucide-react';
import { Message } from '@/types/chat';
import { useVoice } from '@/hooks/useVoice';

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const { speak, stopSpeaking, isSpeaking } = useVoice();

    const handleSpeak = () => {
        if (isSpeaking) {
            stopSpeaking();
        } else if (message.content) {
            speak(message.content);
        }
    };

    const handleCopy = () => {
        if (message.content) {
            navigator.clipboard.writeText(message.content);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
                {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
                        <User className="w-4 h-4 text-zinc-300" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 
                                  flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`
                    text-sm leading-relaxed
                    ${isUser
                        ? 'bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm'
                        : 'text-zinc-300'
                    }
                `}>
                    {/* Message content */}
                    <div className="whitespace-pre-wrap break-words">
                        {message.content || (
                            isStreaming && (
                                <span className="inline-flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                                </span>
                            )
                        )}
                    </div>

                    {/* Streaming cursor */}
                    {isStreaming && message.content && (
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-0.5 h-4 bg-blue-400 ml-1 align-middle"
                        />
                    )}
                </div>

                {/* Generated Image */}
                {message.image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3"
                    >
                        <img
                            src={`data:image/png;base64,${message.image}`}
                            alt={message.content || "Generated image"}
                            className="rounded-xl max-w-full border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer"
                            onClick={() => {
                                const win = window.open();
                                if (win) {
                                    win.document.write(`<img src="data:image/png;base64,${message.image}" />`);
                                }
                            }}
                        />
                    </motion.div>
                )}

                {/* AI Actions */}
                {!isUser && message.content && !isStreaming && (
                    <div className="flex items-center gap-1 mt-2 ml-1">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Copy"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Regenerate"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleSpeak}
                            className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors
                                ${isSpeaking ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title={isSpeaking ? "Stop speaking" : "Read aloud"}
                        >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <div className="w-px h-4 bg-zinc-700 mx-1" />
                        <button
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Good response"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Bad response"
                        >
                            <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
