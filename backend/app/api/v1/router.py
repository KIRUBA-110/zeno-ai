"""
API v1 Router - Combines all endpoint routers
"""
from fastapi import APIRouter
from app.api.v1 import chat, conversations, image, voice

api_router = APIRouter()

# Include sub-routers
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(image.router, prefix="/image", tags=["Image Generation"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice"])

