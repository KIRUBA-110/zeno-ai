/**
 * Chat Types - TypeScript interfaces for chat domain
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
    id?: string;
    role: MessageRole;
    content: string;
    image?: string;  // base64 encoded image
    createdAt?: Date;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface StreamChunk {
    content: string;
    done: boolean;
    error?: string;
}

export interface ChatRequest {
    messages: Array<{
        role: MessageRole;
        content: string;
    }>;
    model?: string;
    conversationId?: string | null;
}
