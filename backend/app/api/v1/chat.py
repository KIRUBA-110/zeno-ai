"""
Chat Endpoints - Streaming SSE for real-time AI responses
With automatic [GEN_IMG] detection and image generation
"""
import json
import re
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest
from app.services.ai_service import AIService, get_ai_service
from app.services.image_service import get_image_service

router = APIRouter()


def parse_gen_img(response: str) -> tuple[str, str | None]:
    """
    Parse [GEN_IMG] from response and extract image prompt.
    Returns (cleaned_text, image_prompt_or_none)
    """
    pattern = r'\[GEN_IMG\]\s*(.+?)(?:\.|$)'
    match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
    
    if match:
        image_prompt = match.group(1).strip()
        # Remove the [GEN_IMG] tag from text
        cleaned_text = re.sub(r'\[GEN_IMG\]\s*.+?(?:\.|$)', '', response, flags=re.IGNORECASE | re.DOTALL).strip()
        return cleaned_text, image_prompt
    
    return response, None


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Stream chat completion via Server-Sent Events (SSE).
    
    Automatically detects [GEN_IMG] in response and generates images.
    
    Response format:
    - Text chunks: `data: {"content": "token", "done": false}`
    - Image result: `data: {"content": "", "done": true, "image": "base64..."}`
    - Final: `data: {"content": "", "done": true}`
    """
    async def generate():
        try:
            messages = [msg.model_dump() for msg in request.messages]
            full_response = ""
            
            # Stream the text response
            async for chunk in ai_service.stream_completion(
                messages=messages,
                model=request.model
            ):
                full_response += chunk
                data = json.dumps({"content": chunk, "done": False})
                yield f"data: {data}\n\n"
            
            # Check for [GEN_IMG] in the response
            cleaned_text, image_prompt = parse_gen_img(full_response)
            
            if image_prompt:
                # Notify client we're generating image
                yield f"data: {json.dumps({'content': ' 🎨 generating...', 'done': False})}\n\n"
                
                try:
                    image_service = get_image_service()
                    base64_image = await image_service.generate_image(image_prompt)
                    
                    # Send image data in final message
                    yield f"data: {json.dumps({'content': '', 'done': True, 'image': base64_image, 'imagePrompt': image_prompt})}\n\n"
                except Exception as img_error:
                    yield f"data: {json.dumps({'content': f' (image gen failed: {str(img_error)})', 'done': False})}\n\n"
                    yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            else:
                # No image, just signal completion
                yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
        except Exception as e:
            error_data = json.dumps({"error": str(e), "done": True})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.post("")
async def chat(
    request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Non-streaming chat completion with auto image generation.
    """
    messages = [msg.model_dump() for msg in request.messages]
    
    full_response = ""
    async for chunk in ai_service.stream_completion(
        messages=messages,
        model=request.model
    ):
        full_response += chunk
    
    # Parse for image generation
    cleaned_text, image_prompt = parse_gen_img(full_response)
    
    result = {
        "message": {
            "role": "assistant",
            "content": cleaned_text
        },
        "conversation_id": request.conversation_id
    }
    
    if image_prompt:
        try:
            image_service = get_image_service()
            result["image"] = await image_service.generate_image(image_prompt)
            result["imagePrompt"] = image_prompt
        except Exception:
            pass  # Image gen failed, just return text
    
    return result

