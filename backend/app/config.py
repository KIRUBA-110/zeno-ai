"""
Application Configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App
    app_name: str = "Zeno API"
    debug: bool = False
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Database (Supabase PostgreSQL)
    database_url: str = ""
    
    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""
    
    # AI Providers
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    groq_api_key: str = ""  # Groq API (fast inference)
    huggingface_api_key: str = ""  # Hugging Face API (image generation)
    
    # Default AI Model
    default_model: str = "llama-3.3-70b-versatile"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore unknown env vars


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
