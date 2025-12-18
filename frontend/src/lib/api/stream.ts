/**
 * SSE Stream Consumer - Consumes Server-Sent Events from FastAPI backend
 * 
 * This is the critical data flow for real-time AI responses:
 * 1. POST request to /api/v1/chat/stream
 * 2. Read response body as stream
 * 3. Parse SSE format (data: {...}\n\n)
 * 4. Yield parsed chunks to React component
 */
import { API_BASE_URL, getToken } from './client';
import { StreamChunk, Message } from '@/types/chat';

export interface StreamChatParams {
    messages: Message[];
    model?: string;
    conversationId?: string | null;
    signal?: AbortSignal;
}

/**
 * Stream chat completion from the backend.
 * Uses async generator for real-time token streaming.
 */
export async function* streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk> {
    const { messages, model = 'llama-3.3-70b-versatile', conversationId, signal } = params;

    // Prepare request body (matching Pydantic ChatRequest)
    const body = {
        messages: messages.map(m => ({
            role: m.role,
            content: m.content
        })),
        model,
        conversation_id: conversationId
    };

    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Decode chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Split by SSE delimiter
            const lines = buffer.split('\n\n');

            // Keep incomplete line in buffer
            buffer = lines.pop() || '';

            // Parse and yield complete SSE events
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.slice(6); // Remove "data: " prefix
                        const data: StreamChunk = JSON.parse(jsonStr);
                        yield data;

                        // Stop if done
                        if (data.done) {
                            return;
                        }
                    } catch (e) {
                        console.error('Failed to parse SSE data:', e);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}
