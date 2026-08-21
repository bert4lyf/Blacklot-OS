import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env files in multiple standard locations
root_dir = Path(__file__).resolve().parent.parent
backend_dir = Path(__file__).resolve().parent

possible_env_paths = [
    root_dir / ".env",
    root_dir / ".env.local",
    backend_dir / ".env",
    backend_dir / ".env.local",
    root_dir / ".env.example",
    backend_dir / ".env.example",
]

for p in possible_env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p, override=False)

class Settings:
    PROJECT_NAME: str = "Backlot - Media & Entertainment Agentic AI"
    VERSION: str = "1.0.0"
    
    # Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    
    # ClickHouse Configuration
    raw_host: str = os.getenv("CLICKHOUSE_HOST", "localhost").strip()
    # Strip protocols if present
    if raw_host.startswith("http://"):
        raw_host = raw_host.replace("http://", "")
    elif raw_host.startswith("https://"):
        raw_host = raw_host.replace("https://", "")
    
    # Extract port if embedded in hostname (e.g. host.com:8443)
    raw_port: str = os.getenv("CLICKHOUSE_PORT", "8443").strip()
    if ":" in raw_host:
        parts = raw_host.split(":")
        CLICKHOUSE_HOST: str = parts[0]
        CLICKHOUSE_PORT: int = int(parts[1]) if parts[1].isdigit() else int(raw_port)
    else:
        CLICKHOUSE_HOST: str = raw_host
        CLICKHOUSE_PORT: int = int(raw_port) if raw_port.isdigit() else 8443

    CLICKHOUSE_USER: str = os.getenv("CLICKHOUSE_USER", "default").strip()
    CLICKHOUSE_PASSWORD: str = os.getenv("CLICKHOUSE_PASSWORD", "").strip()
    CLICKHOUSE_DATABASE: str = os.getenv("CLICKHOUSE_DATABASE", "default").strip()
    
    # Automatically enable secure SSL for ClickHouse Cloud or port 8443
    secure_env: str = os.getenv("CLICKHOUSE_SECURE", "True").lower()
    CLICKHOUSE_SECURE: bool = (
        secure_env in ("true", "1", "yes") or 
        CLICKHOUSE_PORT == 8443 or 
        "clickhouse.cloud" in CLICKHOUSE_HOST
    )

    # Server Configuration
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0").strip()
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))

settings = Settings()
