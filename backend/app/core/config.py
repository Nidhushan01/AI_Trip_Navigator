from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Agentic AI Trip Navigator API"
    app_version: str = "2.0.0"
    api_v1_prefix: str = "/api/v1"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    search_results_limit: int = 5
    cors_origins: list[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "ai-trip-navigator-pntcept8w-nidhushans-projects.vercel.app",
    ]

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
