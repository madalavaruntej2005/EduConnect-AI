"""
Backend Monitor: Probes Django API endpoints, calculates latency, detects HTTP 5xx errors.
"""
import time
import requests
from ai_guardian import config

class BackendMonitor:
    def __init__(self, target_url: str = config.BACKEND_HEALTH_ENDPOINT):
        self.target_url = target_url

    def check_health(self) -> dict:
        start = time.perf_counter()
        try:
            res = requests.get(self.target_url, timeout=5)
            elapsed_ms = (time.perf_counter() - start) * 1000.0

            is_healthy = (res.status_code == 200)
            return {
                "service": "django_backend",
                "healthy": is_healthy,
                "status_code": res.status_code,
                "latency_ms": round(elapsed_ms, 2),
                "error": None if is_healthy else f"Non-200 status: {res.status_code}",
                "body": res.json() if is_healthy else res.text[:200]
            }
        except requests.exceptions.ConnectionError:
            elapsed_ms = (time.perf_counter() - start) * 1000.0
            return {
                "service": "django_backend",
                "healthy": False,
                "status_code": 0,
                "latency_ms": round(elapsed_ms, 2),
                "error": "Connection refused. Backend service may be stopped or initializing."
            }
        except requests.exceptions.Timeout:
            return {
                "service": "django_backend",
                "healthy": False,
                "status_code": 408,
                "latency_ms": 5000.0,
                "error": "Backend health check timed out after 5.0 seconds."
            }
        except Exception as e:
            return {
                "service": "django_backend",
                "healthy": False,
                "status_code": 500,
                "latency_ms": 0.0,
                "error": str(e)
            }
