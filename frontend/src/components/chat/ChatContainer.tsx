/**
 * ChatContainer - Message list with empty state
 * 
 * Features:
 * - Auto-scroll to bottom
 * - Empty state with greeting and suggestions
 * - Gemini-like aesthetic
 */
'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/types/chat';
import { useChatStore } from '@/stores/chatStore';

interface ChatContainerProps {
    messages: Message[];
    onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
    { icon: "📝", text: "Draft an email to my team" },
    { icon: "🐍", text: "Write a Python script" },
    { icon: "🎨", text: "Design ideas for a logo" },
    { icon: "✈️", text: "Plan a weekend trip" },
];

export function ChatContainer({ messages, onSuggestionClick }: ChatContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isStreaming = useChatStore((s) => s.isStreaming);

    // Auto-scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, messages[messages.length - 1]?.content]);

    // Empty state with suggestions
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    {/* AI Icon */}
                    <div className="inline-block p-4 mb-4 rounded-full bg-zinc-800/30 backdrop-blur-sm border border-white/5">
                        <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>

                    {/* Greeting */}
                    <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gradient-greeting mb-2">
                        Hello, there
                    </h1>
                    <p className="text-zinc-500 text-lg">How can I help you today?</p>
                </motion.div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {suggestions.map((s, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * i, duration: 0.3 }}
                            onClick={() => onSuggestionClick?.(s.text)}
                            className="suggestion-card p-4 text-left group flex items-center gap-4"
                        >
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">
                                {s.icon}
                            </span>
                            <span className="text-zinc-300 group-hover:text-white font-medium">
                                {s.text}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // Messages view
    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
            <div className="max-w-3xl mx-auto space-y-8">
                <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message}
                            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
