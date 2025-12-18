/**
 * Conversations API Client
 */
import { API_BASE_URL } from './client';

export interface Conversation {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ConversationWithMessages extends Conversation {
    messages: Array<{
        id: number;
        role: 'user' | 'assistant';
        content: string;
        image?: string;
        created_at: string;
    }>;
}

export const conversationsApi = {
    /**
     * List all conversations
     */
    list: async (): Promise<Conversation[]> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/conversations`);
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    },

    /**
     * Create a new conversation
     */
    create: async (title?: string): Promise<Conversation> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title || 'New Chat' }),
        });
        if (!response.ok) throw new Error('Failed to create conversation');
        return response.json();
    },

    /**
     * Get a conversation with all messages
     */
    get: async (id: number): Promise<ConversationWithMessages> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch conversation');
        return response.json();
    },

    /**
     * Delete a conversation
     */
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
    },

    /**
     * Add a message to a conversation
     */
    addMessage: async (
        conversationId: number,
        message: { role: string; content: string; image?: string }
    ): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });
        if (!response.ok) throw new Error('Failed to add message');
    },
};
