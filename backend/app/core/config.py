from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    PROJECT_NAME: str = "LockPay API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production-please"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    NOMBA_BASE_URL: str = "https://api.nomba.com"
    NOMBA_PARENT_ACCOUNT_ID: Optional[str] = None
    NOMBA_SUB_ACCOUNT_ID: Optional[str] = None
    NOMBA_TEST_CLIENT_ID: Optional[str] = None
    NOMBA_TEST_PRIVATE_KEY: Optional[str] = None
    NOMBA_LIVE_CLIENT_ID: Optional[str] = None
    NOMBA_LIVE_PRIVATE_KEY: Optional[str] = None
    NOMBA_WEBHOOK_SECRET: Optional[str] = None
    DATABASE_URL: str = "sqlite:///./lockpay.db"
    ENVIRONMENT: str = "test"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
