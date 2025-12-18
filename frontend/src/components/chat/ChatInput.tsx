/**
 * ChatInput - Gemini-style floating input with Tools menu
 * 
 * Features:
 * - Pill-shaped floating design
 * - Glass morphism background
 * - Voice input button
 * - Tools dropdown with image generation
 * - Send button that lights up when active
 */
'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Wrench, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { generateImage } from '@/lib/api/image';
import { useChatStore } from '@/stores/chatStore';

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop: () => void;
    isStreaming: boolean;
    disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled = false }: ChatInputProps) {
    const [value, setValue] = useState('');
    const [showTools, setShowTools] = useState(false);
    const [showImageGen, setShowImageGen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);

    const { addMessage, setLastMessageImage, saveMessage, currentConversationId, createConversation } = useChatStore();

    // Auto-expand textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [value]);

    // Close tools dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
                setShowTools(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = () => {
        if (value.trim() && !disabled) {
            onSend(value.trim());
            setValue('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isStreaming) {
                onStop();
            } else {
                handleSubmit();
            }
        }
    };

    const handleImageGenerate = async () => {
        if (!imagePrompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setShowImageGen(false);

        // Ensure conversation exists
        let convId = currentConversationId;
        if (!convId) {
            try {
                convId = await createConversation();
            } catch (error) {
                console.error('Failed to create conversation:', error);
            }
        }

        // Add user prompt message
        const userMsg = { role: 'user' as const, content: `🎨 Generate image: ${imagePrompt}`, createdAt: new Date() };
        addMessage(userMsg);
        saveMessage(userMsg);

        // Add placeholder assistant message
        addMessage({ role: 'assistant', content: '🎨 Generating image...', createdAt: new Date() });

        try {
            const result = await generateImage(imagePrompt);

            // Update message with image
            const store = useChatStore.getState();
            store.updateLastMessage(`✨ Here's your image for: "${imagePrompt}"`);
            setLastMessageImage(result.image);

            // Save assistant message with image
            saveMessage({
                role: 'assistant',
                content: `✨ Here's your image for: "${imagePrompt}"`,
                image: result.image,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Image generation error:', error);
            const store = useChatStore.getState();
            store.updateLastMessage('⚠️ Failed to generate image. Check your Hugging Face API key.');
        } finally {
            setIsGenerating(false);
            setImagePrompt('');
        }
    };

    const hasContent = value.trim().length > 0;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
            {/* Image Generation Modal */}
            <AnimatePresence>
                {showImageGen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mb-4 p-4 bg-zinc-800/90 backdrop-blur-xl rounded-2xl border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-zinc-200">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="font-medium">HF Image Gen</span>
                            </div>
                            <button
                                onClick={() => setShowImageGen(false)}
                                className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleImageGenerate()}
                                placeholder="Describe the image you want to create..."
                                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-2 
                                         text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                                onClick={handleImageGenerate}
                                disabled={!imagePrompt.trim() || isGenerating}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 
                                         disabled:cursor-not-allowed rounded-xl text-white font-medium 
                                         transition-colors flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate'
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                            Using Hugging Face Stable Diffusion
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Input Container */}
            <motion.div
                layout
                className={`
                    relative flex items-end 
                    bg-zinc-800/80 backdrop-blur-xl 
                    border border-white/10 rounded-[28px] 
                    p-2 shadow-2xl transition-all duration-300
                    focus-within:ring-2 focus-within:ring-white/10 focus-within:bg-zinc-800
                `}
            >
                {/* Left Actions - Tools */}
                <div className="flex items-center pb-2 pl-2 gap-1 relative" ref={toolsRef}>
                    <button
                        onClick={() => setShowTools(!showTools)}
                        className={`p-2 rounded-full transition-colors ${showTools ? 'bg-zinc-700 text-zinc-200' : 'hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                            }`}
                        title="Tools"
                    >
                        <Wrench className="w-5 h-5" />
                    </button>

                    {/* Tools Dropdown */}
                    <AnimatePresence>
                        {showTools && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full left-0 mb-2 min-w-[180px] 
                                         bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => {
                                        setShowTools(false);
                                        setShowImageGen(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 
                                             text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                >
                                    <ImageIcon className="w-4 h-4 text-purple-400" />
                                    <span>HF Image Gen</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Text Input */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    disabled={disabled || isGenerating}
                    className={`
                        flex-1 max-h-[200px] bg-transparent border-0 
                        focus:ring-0 focus:outline-none
                        text-zinc-100 placeholder:text-zinc-500 
                        py-3 px-2 resize-none overflow-y-auto leading-6
                        scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent
                        ${(disabled || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    style={{ minHeight: '44px' }}
                />

                {/* Right Actions */}
                <div className="flex items-center pb-2 pr-2 gap-1">
                    {/* Voice Button */}
                    <VoiceButton
                        onTranscript={(text) => setValue(prev => prev ? `${prev} ${text}` : text)}
                        disabled={disabled || isStreaming || isGenerating}
                    />

                    {/* Send / Stop Button */}
                    <motion.button
                        onClick={() => {
                            if (isStreaming) {
                                onStop();
                            } else {
                                handleSubmit();
                            }
                        }}
                        disabled={!isStreaming && (!hasContent || disabled || isGenerating)}
                        className={`
                            p-2 rounded-full transition-all duration-200
                            ${isStreaming
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : hasContent
                                    ? 'bg-white text-black hover:scale-105'
                                    : 'bg-zinc-700/30 text-zinc-500 cursor-not-allowed'
                            }
                        `}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isStreaming ? (
                            <Square className="w-5 h-5 fill-current" />
                        ) : (
                            <Send className={`w-5 h-5 ${hasContent ? 'ml-0.5' : ''}`} />
                        )}
                    </motion.button>
                </div>

                {/* Streaming/Generating indicator */}
                <AnimatePresence>
                    {(isStreaming || isGenerating) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 
                                       text-sm text-zinc-400 flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            {isGenerating ? 'Generating image...' : 'AI is thinking...'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Disclaimer */}
            <div className="text-center mt-3">
                <p className="text-[11px] text-zinc-500">
                    AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}
