"""
Image Generation Schemas
"""
from pydantic import BaseModel, Field


class ImageGenerateRequest(BaseModel):
    """Request to generate an image"""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Text prompt for image generation")


class ImageGenerateResponse(BaseModel):
    """Response containing generated image"""
    image: str = Field(..., description="Base64 encoded image data")
    prompt: str = Field(..., description="The prompt used for generation")
