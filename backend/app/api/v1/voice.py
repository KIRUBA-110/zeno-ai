"""
Voice API Endpoints - Speech-to-Text transcription
"""
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.voice_service import get_voice_service

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe (webm, mp3, wav, m4a)")
):
    """
    Transcribe uploaded audio file to text using Groq Whisper API.
    
    Supports: webm, mp3, wav, m4a, ogg, flac
    Max file size: ~25MB
    
    Returns:
        {"text": "transcribed text"}
    """
    # Validate file type
    allowed_types = ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", 
                     "audio/x-wav", "audio/m4a", "audio/ogg", "audio/flac",
                     "video/webm"]  # video/webm for Chrome MediaRecorder
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format: {file.content_type}. Use webm, mp3, wav, or m4a."
        )
    
    # Read audio bytes
    audio_bytes = await file.read()
    
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")
    
    # Check file size (25MB limit for Groq)
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file too large. Max 25MB.")
    
    try:
        voice_service = get_voice_service()
        transcribed_text = await voice_service.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=file.filename or "audio.webm"
        )
        
        return {"text": transcribed_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
