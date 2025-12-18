"""
AI Service - OpenAI/Anthropic/Groq Integration with Streaming
"""
from typing import AsyncGenerator
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.config import settings

# Professional AI Assistant system prompt
SYSTEM_PROMPT = """You are a professional AI assistant. You communicate clearly, concisely, and helpfully with accurate, well-structured responses. When the user asks you to generate, create, make, or draw an image, respond with [GEN_IMG] followed by a detailed prompt for the image. For example, if they say 'draw a cat', respond: 'I would be happy to create that for you. [GEN_IMG] A cute fluffy cat with large expressive eyes sitting in a warm, cozy setting with soft lighting'. Maintain a friendly yet professional tone at all times."""


class AIService:
    """Service for AI model interactions with streaming support"""
    
    def __init__(self):
        self.openai_client: AsyncOpenAI | None = None
        self.anthropic_client: AsyncAnthropic | None = None
        self.groq_client: AsyncOpenAI | None = None  # Groq uses OpenAI-compatible API
        
        # Initialize clients based on available API keys
        if settings.openai_api_key:
            self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        
        if settings.anthropic_api_key:
            self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        
        # Groq uses OpenAI-compatible API with custom base URL
        if settings.groq_api_key:
            self.groq_client = AsyncOpenAI(
                api_key=settings.groq_api_key,
                base_url="https://api.groq.com/openai/v1"  # Groq's API endpoint
            )
    
    async def stream_completion(
        self,
        messages: list[dict],
        model: str = "llama-3.3-70b-versatile"
    ) -> AsyncGenerator[str, None]:
        """
        Stream completion tokens from the AI model.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier (llama-3.3-70b-versatile, mixtral-8x7b-32768, etc.)
        
        Yields:
            String tokens as they arrive from the API
        """
        # Groq models
        groq_models = ["llama", "mixtral", "gemma", "llama-3"]
        is_groq = any(model.startswith(prefix) or prefix in model for prefix in groq_models)
        
        if is_groq:
            async for token in self._stream_groq(messages, model):
                yield token
        elif model.startswith("claude"):
            async for token in self._stream_anthropic(messages, model):
                yield token
        else:
            async for token in self._stream_openai(messages, model):
                yield token
    
    async def _stream_groq(
        self,
        messages: list[dict],
        model: str
    ) -> AsyncGenerator[str, None]:
        """Stream from Groq API (fast inference)"""
        if not self.groq_client:
            raise ValueError("Groq API key not configured. Add GROQ_API_KEY to your .env file.")
        
        # Inject system prompt at the beginning
        groq_messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        # Add user messages (skip any existing system messages)
        for msg in messages:
            if msg["role"] != "system":
                groq_messages.append({"role": msg["role"], "content": msg["content"]})
        
        stream = await self.groq_client.chat.completions.create(
            model=model,
            messages=groq_messages,
            stream=True,
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def _stream_openai(
        self,
        messages: list[dict],
        model: str
    ) -> AsyncGenerator[str, None]:
        """Stream from OpenAI API"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")
        
        # Convert messages to OpenAI format
        openai_messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in messages
        ]
        
        stream = await self.openai_client.chat.completions.create(
            model=model,
            messages=openai_messages,
            stream=True,
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def _stream_anthropic(
        self,
        messages: list[dict],
        model: str
    ) -> AsyncGenerator[str, None]:
        """Stream from Anthropic API"""
        if not self.anthropic_client:
            raise ValueError("Anthropic API key not configured")
        
        # Separate system message from conversation
        system_msg = ""
        conversation = []
        
        for msg in messages:
            if msg["role"] == "system":
                system_msg = msg["content"]
            else:
                conversation.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        async with self.anthropic_client.messages.stream(
            model=model,
            max_tokens=4096,
            system=system_msg,
            messages=conversation,
        ) as stream:
            async for text in stream.text_stream:
                yield text


# Singleton instance
_ai_service: AIService | None = None


def get_ai_service() -> AIService:
    """Get or create AI service singleton"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
