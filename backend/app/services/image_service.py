"""
Image Generation Service - Hugging Face Integration
"""
import base64
import httpx
from app.config import settings


class ImageService:
    """Service for image generation using Hugging Face Inference API"""
    
    def __init__(self):
        self.api_key = settings.huggingface_api_key
        self.model = "stabilityai/stable-diffusion-xl-base-1.0"
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{self.model}"
    
    async def generate_image(self, prompt: str) -> str:
        """
        Generate an image from a text prompt.
        
        Args:
            prompt: Text description of the image to generate
            
        Returns:
            Base64 encoded image string
        """
        if not self.api_key:
            raise ValueError("Hugging Face API key not configured. Add HUGGINGFACE_API_KEY to your .env file.")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "guidance_scale": 7.5,
                "num_inference_steps": 30
            }
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                self.api_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                error_msg = response.text
                raise Exception(f"Image generation failed: {error_msg}")
            
            # Response is raw image bytes
            image_bytes = response.content
            
            # Convert to base64
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            return base64_image


# Singleton instance
_image_service: ImageService | None = None


def get_image_service() -> ImageService:
    """Get or create image service singleton"""
    global _image_service
    if _image_service is None:
        _image_service = ImageService()
    return _image_service
