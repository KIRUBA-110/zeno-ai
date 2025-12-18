/**
 * Sidebar - Collapsible navigation with real chat history
 */
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    MessageSquare,
    Settings,
    Zap,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Trash2,
    Loader2
} from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onNewChat: () => void;
}

export function Sidebar({ isOpen, onToggle, onNewChat }: SidebarProps) {
    const conversations = useChatStore((s) => s.conversations);
    const currentConversationId = useChatStore((s) => s.currentConversationId);
    const loadConversations = useChatStore((s) => s.loadConversations);
    const loadConversation = useChatStore((s) => s.loadConversation);
    const deleteConversation = useChatStore((s) => s.deleteConversation);
    const isLoadingConversations = useChatStore((s) => s.isLoadingConversations);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const handleSelectConversation = (id: number) => {
        loadConversation(id);
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        await deleteConversation(id);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onToggle}
                        className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className="fixed md:relative z-30 h-full flex flex-col bg-zinc-950 border-r border-white/5"
                initial={{ width: 256 }}
                animate={{ width: isOpen ? 256 : 72 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between">
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.button
                                    key="new-chat-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={onNewChat}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                               rounded-full bg-zinc-800/50 border border-zinc-700 
                                               text-zinc-300 hover:bg-zinc-700 hover:text-white 
                                               transition-all duration-200 group"
                                >
                                    <Plus className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                                    <span className="font-medium">New Chat</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    key="new-chat-icon"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={onNewChat}
                                    className="w-full flex justify-center p-2.5 
                                               rounded-full bg-zinc-800/50 
                                               text-zinc-400 hover:text-white hover:bg-zinc-700
                                               transition-all duration-200"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
                        {isOpen && (
                            <div className="text-xs font-semibold text-zinc-500 mb-2 px-3 uppercase tracking-wider">
                                {isLoadingConversations ? 'Loading...' : 'Recent'}
                            </div>
                        )}

                        {isLoadingConversations && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                            </div>
                        )}

                        {!isLoadingConversations && conversations.length === 0 && isOpen && (
                            <div className="text-sm text-zinc-500 px-3 py-4 text-center">
                                No conversations yet
                            </div>
                        )}

                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 group
                                    rounded-lg transition-all duration-150
                                    ${currentConversationId === conv.id
                                        ? 'bg-zinc-800 text-zinc-100'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                                    }
                                    ${!isOpen ? 'justify-center px-0' : ''}`}
                            >
                                <MessageSquare className="w-4 h-4 shrink-0" />
                                {isOpen && (
                                    <>
                                        <span className="truncate text-sm font-normal flex-1 text-left">
                                            {conv.title}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(e, conv.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all"
                                            title="Delete conversation"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-zinc-500 hover:text-red-400" />
                                        </button>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/5 space-y-1">
                        <button
                            onClick={onToggle}
                            className={`w-full flex items-center gap-3 px-3 py-2
                                text-zinc-400 hover:text-white hover:bg-zinc-800/50
                                rounded-lg transition-all duration-150
                                ${!isOpen ? 'justify-center px-0' : ''}`}
                        >
                            {isOpen ? (
                                <>
                                    <ChevronLeft className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Collapse</span>
                                </>
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            className={`w-full flex items-center gap-3 px-3 py-2
                                text-zinc-400 hover:text-amber-300 hover:bg-amber-900/20
                                rounded-lg transition-all duration-150
                                ${!isOpen ? 'justify-center px-0' : ''}`}
                        >
                            <Zap className="w-4 h-4 shrink-0" />
                            {isOpen && <span className="text-sm">Upgrade Plan</span>}
                        </button>

                        <button
                            className={`w-full flex items-center gap-3 px-3 py-2
                                text-zinc-400 hover:text-white hover:bg-zinc-800/50
                                rounded-lg transition-all duration-150
                                ${!isOpen ? 'justify-center px-0' : ''}`}
                        >
                            <Settings className="w-4 h-4 shrink-0" />
                            {isOpen && <span className="text-sm">Settings</span>}
                        </button>

                        {/* User Profile */}
                        <div className={`mt-2 flex items-center p-2 rounded-lg bg-zinc-900/50
                            ${!isOpen ? 'justify-center bg-transparent' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 
                                          flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            {isOpen && (
                                <div className="ml-3 flex-1 overflow-hidden">
                                    <div className="text-sm font-medium text-zinc-200 truncate">User</div>
                                    <div className="text-xs text-zinc-500 truncate">Free Plan</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
