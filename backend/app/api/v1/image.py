"""
Image Generation Endpoint
"""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.image import ImageGenerateRequest, ImageGenerateResponse
from app.services.image_service import ImageService, get_image_service

router = APIRouter()


@router.post("/generate", response_model=ImageGenerateResponse)
async def generate_image(
    request: ImageGenerateRequest,
    image_service: ImageService = Depends(get_image_service)
):
    """
    Generate an image from a text prompt using Hugging Face.
    
    The image is returned as a base64-encoded string.
    """
    try:
        base64_image = await image_service.generate_image(request.prompt)
        
        return ImageGenerateResponse(
            image=base64_image,
            prompt=request.prompt
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
