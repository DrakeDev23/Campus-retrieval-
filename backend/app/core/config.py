from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Campus Lost-and-Found Retrieval System"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database configuration placeholder
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/campus_retrieval"

    # Future integration placeholders di pana real credentials
    CLERK_SECRET_KEY: str = ""
    CLERK_JWKS_URL: str = ""
    INITIAL_ADMIN_EMAIL: str = "admin@campus.edu"
    AWS_S3_BUCKET: str = "campus-lost-and-found"
    AWS_REGION: str = "us-east-1"
    RESEND_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
