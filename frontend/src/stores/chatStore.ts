/**
 * Chat Store - Zustand state management for chat
 * Handles messages, streaming state, conversations, and optimistic updates
 */
import { create } from 'zustand';
import { Message } from '@/types/chat';
import { conversationsApi, Conversation } from '@/lib/api/conversations';

interface ChatState {
    // State
    messages: Message[];
    isStreaming: boolean;
    currentConversationId: number | null;
    conversations: Conversation[];
    isLoadingConversations: boolean;

    // Actions
    addMessage: (message: Message) => void;
    appendToLastMessage: (content: string) => void;
    setLastMessageImage: (image: string) => void;
    setIsStreaming: (isStreaming: boolean) => void;
    setConversationId: (id: number | null) => void;
    clearMessages: () => void;
    updateLastMessage: (content: string) => void;

    // Conversation actions
    loadConversations: () => Promise<void>;
    loadConversation: (id: number) => Promise<void>;
    createConversation: () => Promise<number>;
    deleteConversation: (id: number) => Promise<void>;
    saveMessage: (message: Message) => Promise<void>;
    setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    messages: [],
    isStreaming: false,
    currentConversationId: null,
    conversations: [],
    isLoadingConversations: false,

    // Add a new message (used for both user and assistant messages)
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    // Set messages directly
    setMessages: (messages) => set({ messages }),

    // Append content to the last message (used during streaming)
    appendToLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content
            };
        }
        return { messages };
    }),

    // Set image on the last message (used for image generation)
    setLastMessageImage: (image) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
            messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                image
            };
        }
        return { messages };
    }),

    // Update the entire content of the last message
    updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
            messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content
            };
        }
        return { messages };
    }),

    // Set streaming state
    setIsStreaming: (isStreaming) => set({ isStreaming }),

    // Set current conversation ID
    setConversationId: (id) => set({ currentConversationId: id }),

    // Clear all messages (for new conversation)
    clearMessages: () => set({ messages: [], currentConversationId: null }),

    // Load all conversations
    loadConversations: async () => {
        set({ isLoadingConversations: true });
        try {
            const conversations = await conversationsApi.list();
            set({ conversations, isLoadingConversations: false });
        } catch (error) {
            console.error('Failed to load conversations:', error);
            set({ isLoadingConversations: false });
        }
    },

    // Load a specific conversation with messages
    loadConversation: async (id: number) => {
        try {
            const conversation = await conversationsApi.get(id);
            const messages: Message[] = conversation.messages.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
                image: m.image,
            }));
            set({
                currentConversationId: id,
                messages
            });
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    },

    // Create a new conversation and return its ID
    createConversation: async () => {
        try {
            const conversation = await conversationsApi.create();
            await get().loadConversations(); // Refresh list
            set({ currentConversationId: conversation.id, messages: [] });
            return conversation.id;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            throw error;
        }
    },

    // Delete a conversation
    deleteConversation: async (id: number) => {
        try {
            await conversationsApi.delete(id);
            const state = get();
            // If we deleted the current conversation, clear it
            if (state.currentConversationId === id) {
                set({ currentConversationId: null, messages: [] });
            }
            await get().loadConversations(); // Refresh list
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    },

    // Save a message to the current conversation
    saveMessage: async (message: Message) => {
        const conversationId = get().currentConversationId;
        if (!conversationId) return;

        try {
            await conversationsApi.addMessage(conversationId, {
                role: message.role,
                content: message.content,
                image: message.image,
            });
            // Refresh conversations to update title
            await get().loadConversations();
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    },
}));
