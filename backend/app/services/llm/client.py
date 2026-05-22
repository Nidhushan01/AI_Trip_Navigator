from langchain_openai import ChatOpenAI

from app.core.config import get_settings


def build_llm() -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        model=settings.openai_model,
        temperature=0.2,
        api_key=settings.openai_api_key or None,
    )
