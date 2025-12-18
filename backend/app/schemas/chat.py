"""
Pydantic Schemas for Chat API
These schemas define the API contracts between frontend and backend.
TypeScript types are auto-generated from these via OpenAPI.
"""
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class MessageSchema(BaseModel):
    """Single message in a conversation"""
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime | None = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Hello, how are you?",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class ChatRequest(BaseModel):
    """Request body for chat completion"""
    messages: list[MessageSchema] = Field(..., min_length=1)
    model: str = Field(default="gpt-4-turbo", description="AI model to use")
    conversation_id: str | None = Field(default=None, description="Existing conversation ID")
    
    class Config:
        json_schema_extra = {
            "example": {
                "messages": [{"role": "user", "content": "Hello!"}],
                "model": "gpt-4-turbo",
                "conversation_id": None
            }
        }


class StreamChunk(BaseModel):
    """Single chunk from streaming response"""
    content: str
    done: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Hello",
                "done": False
            }
        }


class ChatResponse(BaseModel):
    """Non-streaming chat response"""
    message: MessageSchema
    conversation_id: str
    usage: dict | None = None
