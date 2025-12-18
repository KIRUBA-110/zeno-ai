"""
Voice Service - Speech-to-Text using Groq Whisper API
"""
import httpx
from app.config import settings


class VoiceService:
    """Service for speech-to-text using Groq's Whisper API (distil-whisper-large-v3-en)"""
    
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.api_url = "https://api.groq.com/openai/v1/audio/transcriptions"
        self.model = "whisper-large-v3"  # Current Groq Whisper model
    
    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        """
        Transcribe audio to text using Groq Whisper API.
        
        Args:
            audio_bytes: Raw audio bytes (supports webm, mp3, wav, m4a, etc.)
            filename: Original filename with extension (used for format detection)
            
        Returns:
            Transcribed text string
        """
        if not self.api_key:
            raise ValueError("Groq API key not configured. Add GROQ_API_KEY to your .env file.")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }
        
        # Prepare multipart form data
        files = {
            "file": (filename, audio_bytes, "audio/webm"),
        }
        data = {
            "model": self.model,
            "response_format": "text",
            "language": "en",  # Optimize for English
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.api_url,
                headers=headers,
                files=files,
                data=data
            )
            
            if response.status_code != 200:
                error_msg = response.text
                raise Exception(f"Transcription failed: {error_msg}")
            
            # Response is plain text
            return response.text.strip()


# Singleton instance
_voice_service: VoiceService | None = None


def get_voice_service() -> VoiceService:
    """Get or create voice service singleton"""
    global _voice_service
    if _voice_service is None:
        _voice_service = VoiceService()
    return _voice_service
