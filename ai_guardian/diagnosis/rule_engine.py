"""
Rule Engine: Fast deterministic detection of infrastructure anomalies.
"""
from ai_guardian import config

class AnomalyRuleEngine:
    def evaluate(self, system_metrics: dict, backend_health: dict) -> list:
        incidents = []

        # Rule 1: Backend service down
        if not backend_health.get("healthy"):
            incidents.append({
                "service_name": "django_backend",
                "severity": "CRITICAL",
                "error_summary": f"Django backend unavailable: {backend_health.get('error')}",
                "error_details": f"Health check returned status {backend_health.get('status_code')}. Target: {config.BACKEND_HEALTH_ENDPOINT}",
                "recommended_action": "RESTART_WORKER",
                "requires_human_approval": False
            })

        # Rule 2: High API Latency
        elif backend_health.get("latency_ms", 0) > config.LATENCY_CRITICAL_MS:
            incidents.append({
                "service_name": "django_backend",
                "severity": "HIGH",
                "error_summary": f"Critical API latency: {backend_health.get('latency_ms')}ms",
                "error_details": f"Latency exceeded critical threshold ({config.LATENCY_CRITICAL_MS}ms).",
                "recommended_action": "CLEAR_APPROVED_CACHE",
                "requires_human_approval": False
            })
        elif backend_health.get("latency_ms", 0) > config.LATENCY_WARNING_MS:
            incidents.append({
                "service_name": "django_backend",
                "severity": "MEDIUM",
                "error_summary": f"Elevated API latency: {backend_health.get('latency_ms')}ms",
                "error_details": f"Latency exceeded warning threshold ({config.LATENCY_WARNING_MS}ms).",
                "recommended_action": "COLLECT_DIAGNOSTICS",
                "requires_human_approval": False
            })

        # Rule 3: High Memory
        if system_metrics.get("memory_percent", 0) > config.MEMORY_WARNING_PERCENT:
            incidents.append({
                "service_name": "host_infrastructure",
                "severity": "HIGH",
                "error_summary": f"High Host Memory Usage: {system_metrics.get('memory_percent')}%",
                "error_details": f"System RAM usage at {system_metrics.get('memory_used_mb')}MB / {system_metrics.get('memory_total_mb')}MB.",
                "recommended_action": "CLEAR_APPROVED_CACHE",
                "requires_human_approval": False
            })

        # Rule 4: High CPU
        if system_metrics.get("cpu_percent", 0) > config.CPU_WARNING_PERCENT:
            incidents.append({
                "service_name": "host_infrastructure",
                "severity": "MEDIUM",
                "error_summary": f"High CPU utilization: {system_metrics.get('cpu_percent')}%",
                "error_details": "CPU usage spike detected across active workers.",
                "recommended_action": "COLLECT_DIAGNOSTICS",
                "requires_human_approval": False
            })

        return incidents
