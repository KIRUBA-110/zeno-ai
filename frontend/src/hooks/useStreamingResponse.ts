/**
 * useStreamingResponse Hook - React hook for consuming SSE streams
 * 
 * Features:
 * - Optimistic UI updates (user message appears immediately)
 * - Real-time token appending during stream
 * - Auto-creates conversation if none exists
 * - Saves messages to database
 * - Image generation with /imagine command
 */
'use client';

import { useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { streamChat } from '@/lib/api/stream';
import { generateImage } from '@/lib/api/image';
import { Message } from '@/types/chat';

export function useStreamingResponse() {
    const abortControllerRef = useRef<AbortController | null>(null);

    const {
        messages,
        addMessage,
        appendToLastMessage,
        setLastMessageImage,
        updateLastMessage,
        setIsStreaming,
        currentConversationId,
        createConversation,
        saveMessage,
    } = useChatStore();

    /**
     * Send a message and stream the AI response
     */
    const sendMessage = useCallback(async (content: string) => {
        // Ensure we have a conversation
        let convId = currentConversationId;
        if (!convId) {
            try {
                convId = await createConversation();
            } catch (error) {
                console.error('Failed to create conversation:', error);
            }
        }

        // Check if this is an image generation command
        const isImageCommand = content.trim().toLowerCase().startsWith('/imagine');

        if (isImageCommand) {
            // Extract prompt (remove /imagine prefix)
            const prompt = content.replace(/^\/imagine\s*/i, '').trim();

            if (!prompt) {
                addMessage({
                    role: 'assistant',
                    content: '⚠️ Please provide a prompt after /imagine. Example: `/imagine a cute robot playing guitar`',
                    createdAt: new Date()
                });
                return;
            }

            // Add user message
            const userMsg: Message = { role: 'user', content, createdAt: new Date() };
            addMessage(userMsg);
            saveMessage(userMsg);

            // Add placeholder assistant message
            addMessage({
                role: 'assistant',
                content: '🎨 Generating image...',
                createdAt: new Date()
            });

            setIsStreaming(true);

            try {
                const result = await generateImage(prompt);
                const assistantMsg: Message = {
                    role: 'assistant',
                    content: `✨ Here's your image for: "${prompt}"`,
                    image: result.image,
                    createdAt: new Date()
                };
                updateLastMessage(assistantMsg.content);
                setLastMessageImage(result.image);
                saveMessage(assistantMsg);
            } catch (error) {
                console.error('Image generation error:', error);
                updateLastMessage('⚠️ Failed to generate image. Please check your Hugging Face API key and try again.');
            } finally {
                setIsStreaming(false);
            }

            return;
        }

        // Regular chat flow
        const userMessage: Message = {
            role: 'user',
            content,
            createdAt: new Date()
        };
        addMessage(userMessage);
        saveMessage(userMessage);

        // Add empty assistant message (will be populated by stream)
        const assistantMessage: Message = {
            role: 'assistant',
            content: '',
            createdAt: new Date()
        };
        addMessage(assistantMessage);

        // Set streaming state
        setIsStreaming(true);

        // Create abort controller for cancel functionality
        abortControllerRef.current = new AbortController();

        try {
            // Get updated messages including the new user message
            const currentMessages = useChatStore.getState().messages;

            // Consume the stream
            let fullResponse = '';
            for await (const chunk of streamChat({
                messages: currentMessages.slice(0, -1), // Exclude empty assistant message
                signal: abortControllerRef.current.signal,
                conversationId: convId?.toString() || null,
            })) {
                if (chunk.error) {
                    throw new Error(chunk.error);
                }

                if (chunk.done) {
                    break;
                }

                // Append token to the last message (real-time update)
                appendToLastMessage(chunk.content);
                fullResponse += chunk.content;
            }

            // Save the complete assistant message
            if (fullResponse) {
                saveMessage({
                    role: 'assistant',
                    content: fullResponse,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            // Ignore abort errors (user cancelled)
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Stream aborted by user');
            } else {
                console.error('Stream error:', error);
                appendToLastMessage('\n\n⚠️ An error occurred. Please try again.');
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [addMessage, appendToLastMessage, setLastMessageImage, updateLastMessage, setIsStreaming, currentConversationId, createConversation, saveMessage]);

    /**
     * Stop the current stream
     */
    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    return {
        sendMessage,
        stopGeneration,
        messages,
        isStreaming: useChatStore((s) => s.isStreaming)
    };
}
