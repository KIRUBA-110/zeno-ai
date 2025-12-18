/**
 * Image Generation API Client
 */
import { API_BASE_URL, getToken } from './client';

export interface ImageGenerateRequest {
    prompt: string;
}

export interface ImageGenerateResponse {
    image: string;  // base64 encoded
    prompt: string;
}

/**
 * Generate an image from a text prompt
 */
export async function generateImage(prompt: string): Promise<ImageGenerateResponse> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/image/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Image generation failed' }));
        throw new Error(error.detail || 'Image generation failed');
    }

    return response.json();
}
