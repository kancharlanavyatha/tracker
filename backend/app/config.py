from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+psycopg2://cycleapp:cycleapp@localhost:5432/menstrual_health"
    )
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    artifacts_dir: Path = Field(default=_BACKEND_ROOT / "artifacts")
    scheduler_enabled: bool = True


settings = Settings()