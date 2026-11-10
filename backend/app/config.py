from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_DB_PATH = (_BACKEND_ROOT / "menstrual_health.db").resolve().as_posix()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = f"sqlite:///{_DB_PATH}"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    artifacts_dir: Path = Field(default=_BACKEND_ROOT / "artifacts")
    scheduler_enabled: bool = True
    secret_key: str = "menstrual-health-secret-jwt-key-2026-secure"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    storage_dir: Path = Field(default=_BACKEND_ROOT / "storage")


settings = Settings()
