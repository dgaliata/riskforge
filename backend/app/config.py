from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "RiskForge"
    database_url: str | None = None
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    seed_on_startup: bool = True
    environment: str = "development"


settings = Settings()