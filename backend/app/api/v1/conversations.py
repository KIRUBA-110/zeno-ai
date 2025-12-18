"""
Conversations API - CRUD for chat history
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Conversation, ChatMessage

router = APIRouter(tags=["conversations"])


# Schemas
class MessageCreate(BaseModel):
    role: str
    content: str
    image: Optional[str] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ConversationUpdate(BaseModel):
    title: str


# Endpoints

@router.get("")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    """List all conversations, most recent first"""
    result = await db.execute(
        select(Conversation).order_by(desc(Conversation.updated_at))
    )
    conversations = result.scalars().all()
    return [conv.to_dict() for conv in conversations]


@router.post("")
async def create_conversation(
    data: ConversationCreate = None,
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation"""
    title = data.title if data else "New Chat"
    conversation = Conversation(title=title)
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation.to_dict()


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    """Get a conversation with all its messages"""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        **conversation.to_dict(),
        "messages": [msg.to_dict() for msg in sorted(conversation.messages, key=lambda m: m.created_at)]
    }


@router.patch("/{conversation_id}")
async def update_conversation(
    conversation_id: int,
    data: ConversationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update conversation title"""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.title = data.title
    await db.commit()
    await db.refresh(conversation)
    return conversation.to_dict()


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a conversation and all its messages"""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.delete(conversation)
    await db.commit()
    return {"success": True}


@router.post("/{conversation_id}/messages")
async def add_message(
    conversation_id: int,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """Add a message to a conversation"""
    # Check conversation exists
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Create message
    message = ChatMessage(
        conversation_id=conversation_id,
        role=data.role,
        content=data.content,
        image=data.image
    )
    db.add(message)
    
    # Update conversation title if first user message
    if data.role == "user" and conversation.title == "New Chat":
        # Use first 50 chars of message as title
        conversation.title = data.content[:50] + ("..." if len(data.content) > 50 else "")
    
    await db.commit()
    await db.refresh(message)
    return message.to_dict()
