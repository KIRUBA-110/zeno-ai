/**
 * useVoice - Custom hook for voice input/output functionality
 * 
 * Features:
 * - Audio recording using MediaRecorder API
 * - Transcription via Groq Whisper backend
 * - Text-to-speech using Web Speech Synthesis API
 */
import { useState, useRef, useCallback } from 'react';

interface UseVoiceOptions {
    onTranscript?: (text: string) => void;
    onError?: (error: string) => void;
}

interface UseVoiceReturn {
    // Recording state
    isRecording: boolean;
    isTranscribing: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => void;

    // Speech synthesis
    isSpeaking: boolean;
    speak: (text: string) => void;
    stopSpeaking: () => void;

    // Error state
    error: string | null;
}

export function useVoice({ onTranscript, onError }: UseVoiceOptions = {}): UseVoiceReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleError = useCallback((msg: string) => {
        setError(msg);
        onError?.(msg);
    }, [onError]);

    /**
     * Start recording audio from microphone
     */
    const startRecording = useCallback(async () => {
        try {
            setError(null);

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                }
            });

            // Create MediaRecorder with webm format (best compatibility)
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Create audio blob
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Send to backend for transcription
                await transcribeAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);

        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    handleError('Microphone access denied. Please allow microphone access in your browser settings.');
                } else {
                    handleError(`Failed to start recording: ${err.message}`);
                }
            }
        }
    }, [handleError]);

    /**
     * Stop recording and trigger transcription
     */
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    /**
     * Send audio to backend for transcription
     */
    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true);

        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');

            const response = await fetch('http://localhost:8000/api/v1/voice/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Transcription failed');
            }

            const data = await response.json();

            if (data.text && data.text.trim()) {
                onTranscript?.(data.text.trim());
            }

        } catch (err) {
            handleError(err instanceof Error ? err.message : 'Transcription failed');
        } finally {
            setIsTranscribing(false);
        }
    };

    /**
     * Speak text using Web Speech Synthesis
     */
    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            handleError('Speech synthesis not supported in this browser');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to get a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Enhanced')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [handleError]);

    /**
     * Stop speaking
     */
    const stopSpeaking = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording,
        isSpeaking,
        speak,
        stopSpeaking,
        error,
    };
}
