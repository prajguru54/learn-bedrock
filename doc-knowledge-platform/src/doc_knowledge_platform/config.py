"""Environment-driven settings shared by scripts and the service."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings, read from environment variables or a local `.env` file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    aws_default_region: str = "ap-southeast-2"
    rerank_region: str = "us-west-2"
    rerank_model_id: str = "amazon.rerank-v1:0"
    embedding_model_id: str = "amazon.titan-embed-text-v2:0"
    generation_model_id: str = "apac.amazon.nova-lite-v1:0"
    rewrite_model_id: str = "apac.amazon.nova-lite-v1:0"
    embedding_dimensions: int = 1024


@lru_cache
def get_settings() -> Settings:
    """Return the cached settings object."""
    return Settings()
