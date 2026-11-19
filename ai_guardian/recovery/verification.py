"""
Recovery Verification: Performs post-recovery validation to ensure the anomaly has cleared.
"""
import time
from ai_guardian.monitors.backend_monitor import BackendMonitor

class RecoveryVerifier:
    def __init__(self):
        self.backend_monitor = BackendMonitor()

    def verify_recovery(self, incident: dict) -> dict:
        """Wait briefly and run check to verify state returned to normal."""
        time.sleep(1.0)
        health = self.backend_monitor.check_health()

        is_verified = health.get("healthy", False) and health.get("latency_ms", 9999) < 1500

        return {
            "verified": is_verified,
            "post_recovery_health": health,
            "verification_message": "Service recovered and verified within operating latency parameters." if is_verified else "Service latency or availability remains abnormal after recovery attempt."
        }
