'use client';

/**
 * Main Chat Page - Gemini-like Layout
 * 
 * Features:
 * - Collapsible sidebar
 * - Main chat area with empty state
 * - Floating input at bottom
 * - Clean, minimal aesthetic
 */

import { useState } from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { ChatInput, ChatContainer } from '@/components/chat';
import { Sidebar } from '@/components/layout/Sidebar';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { useChatStore } from '@/stores/chatStore';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { sendMessage, stopGeneration, isStreaming } = useStreamingResponse();
  const messages = useChatStore((s) => s.messages);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const handleNewChat = () => {
    clearMessages();
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 
                                      flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-zinc-200">Zeno</span>
          </div>

          {/* Spacer for centering on desktop */}
          <div className="w-10 md:hidden" />
        </header>

        {/* Chat Container */}
        <ChatContainer
          messages={messages}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Input Area */}
        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
