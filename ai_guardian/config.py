"""
EduConnect AI Guardian - Autonomous Reliability Engineering Configuration
"""
import os
from pathlib import Path
import dotenv

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
dotenv.load_dotenv(ROOT_DIR / '.env')

# Guardian Service Identity
GUARDIAN_VERSION = "2.4.0"
GUARDIAN_HOST = os.getenv("GUARDIAN_HOST", "127.0.0.1")
GUARDIAN_PORT = int(os.getenv("GUARDIAN_PORT", "8001"))
GUARDIAN_SECRET_TOKEN = os.getenv("GUARDIAN_SECRET_TOKEN", "guardian-dev-secret-token-12345")

# Backend & Infrastructure Probes
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
BACKEND_HEALTH_ENDPOINT = f"{BACKEND_URL}/health/"
BACKEND_API_BASE = f"{BACKEND_URL}/api/v1"
BACKEND_INCIDENT_INGEST_URL = f"{BACKEND_API_BASE}/guardian/incidents/"
BACKEND_METRIC_INGEST_URL = f"{BACKEND_API_BASE}/guardian/metrics/"

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Autonomous Loop Settings
POLL_INTERVAL_SECONDS = int(os.getenv("GUARDIAN_POLL_INTERVAL_SECONDS", "15"))
AUTO_RECOVERY_ENABLED = os.getenv("GUARDIAN_AI_AUTO_RECOVERY", "True").lower() in ("true", "1")
MAX_HOURLY_AUTO_ACTIONS = int(os.getenv("GUARDIAN_MAX_HOURLY_AUTO_ACTIONS", "10"))

# Thresholds
LATENCY_WARNING_MS = 800
LATENCY_CRITICAL_MS = 2500
CPU_WARNING_PERCENT = 85.0
MEMORY_WARNING_PERCENT = 90.0
DISK_WARNING_PERCENT = 92.0

# Alerting
ALERT_EMAIL = os.getenv("GUARDIAN_ALERT_EMAIL", "admin@educonnect.ai")

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Safety & Tool Allowlist (Forbidden to run shell commands or arbitrary SQL)
APPROVED_AUTOMATED_ACTIONS = [
    "CLEAR_APPROVED_CACHE",
    "RETRY_FAILED_TASKS",
    "REFRESH_EXPIRED_TOKENS",
    "RESTART_WORKER",
    "DISABLE_UNHEALTHY_INTEGRATION",
    "COLLECT_DIAGNOSTICS"
]

HIGH_RISK_ACTIONS_REQUIRING_HUMAN_APPROVAL = [
    "PRODUCTION_DB_MIGRATION",
    "DESTRUCTIVE_DATABASE_CLEANUP",
    "CREDENTIAL_ROTATION",
    "PRODUCTION_DEPLOY_ROLLBACK",
    "DELETE_USER_DATA"
]
