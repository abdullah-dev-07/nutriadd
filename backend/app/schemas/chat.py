from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    # The latest user question.
    message: str = Field(min_length=1, max_length=4000)
    # Prior turns (most recent last), so the bot has conversation memory. Capped
    # server-side to keep prompts bounded.
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    # Optional context about where the user is on the site (e.g. "Product page:
    # Magtein" or "Blog: Magnesium guide"), sent by the widget so answers are
    # page-aware.
    page_context: str | None = Field(default=None, max_length=500)


class ChatResponse(BaseModel):
    reply: str
