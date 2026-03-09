from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    JWT_SECRET: str
    
    class Config:
        env_file = ".env"

# Instancia global de configuración
settings = Settings()