"""
EduConnect AI Guardian - Autonomous Reliability Daemon
Independent background service monitoring platform health, classifying anomalies,
executing safe recovery tools, and keeping an immutable audit trail.
"""
import sys
import time
import json
import logging
import requests
from pathlib import Path

# Add parent directory to path so ai_guardian package can be imported
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR.parent))

from ai_guardian import config
from ai_guardian.monitors.system_monitor import SystemMonitor
from ai_guardian.monitors.backend_monitor import BackendMonitor
from ai_guardian.diagnosis.rule_engine import AnomalyRuleEngine
from ai_guardian.diagnosis.ai_reasoner import AIDiagnosisEngine
from ai_guardian.safety.policy_gate import SafetyPolicyGate
from ai_guardian.recovery.tool_registry import RecoveryToolRegistry
from ai_guardian.recovery.verification import RecoveryVerifier

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [AI_GUARDIAN] [%(levelname)s] %(message)s'
)
logger = logging.getLogger("ai_guardian.daemon")

class AIGuardianDaemon:
    def __init__(self):
        self.system_monitor = SystemMonitor()
        self.backend_monitor = BackendMonitor()
        self.rule_engine = AnomalyRuleEngine()
        self.ai_reasoner = AIDiagnosisEngine()
        self.policy_gate = SafetyPolicyGate()
        self.tool_registry = RecoveryToolRegistry()
        self.verifier = RecoveryVerifier()
        self.is_running = False

    def run_single_cycle(self) -> dict:
        """Executes one complete monitoring and self-healing evaluation cycle."""
        logger.info("Executing Guardian observability cycle...")

        # 1. Probes
        sys_metrics = self.system_monitor.collect()
        backend_health = self.backend_monitor.check_health()

        # 2. Anomaly Detection
        detected_incidents = self.rule_engine.evaluate(sys_metrics, backend_health)

        cycle_summary = {
            "timestamp": time.time(),
            "system_metrics": sys_metrics,
            "backend_health": backend_health,
            "incidents_detected": len(detected_incidents),
            "actions_executed": []
        }

        # 3. Process Incidents
        for inc in detected_incidents:
            logger.warning(f"Incident Detected: [{inc['severity']}] {inc['error_summary']}")

            # AI Diagnosis
            diag_result = self.ai_reasoner.diagnose_incident(inc)
            inc["ai_diagnosis"] = diag_result["diagnosis"]

            # Safety Gate & Policy Evaluation
            action_name = inc.get("recommended_action")
            policy = self.policy_gate.evaluate_action(action_name, inc)

            if policy["can_execute"]:
                logger.info(f"Policy approved automatic recovery: {action_name}")
                recovery_result = self.tool_registry.execute(action_name)
                verification = self.verifier.verify_recovery(inc)

                action_record = {
                    "action": action_name,
                    "result": recovery_result,
                    "verification": verification
                }
                cycle_summary["actions_executed"].append(action_record)
                logger.info(f"Recovery status: {recovery_result['status']}. Verified: {verification['verified']}")
            else:
                logger.warning(f"Action requires human approval or blocked: {policy['reason']}")

            # Post incident to Backend API if backend is online
            self._post_incident_to_backend(inc)

        logger.info(f"Cycle completed. Status: {'HEALTHY' if len(detected_incidents) == 0 else 'ANOMALY_MANAGED'}")
        return cycle_summary

    def _post_incident_to_backend(self, incident: dict):
        """Attempts to register incident in Django Guardian database."""
        try:
            headers = {"Authorization": f"Token {config.GUARDIAN_SECRET_TOKEN}"}
            payload = {
                "service_name": incident.get("service_name"),
                "severity": incident.get("severity"),
                "error_summary": incident.get("error_summary"),
                "error_details": incident.get("error_details"),
                "ai_diagnosis": incident.get("ai_diagnosis", ""),
                "recommended_action": incident.get("recommended_action", ""),
                "requires_human_approval": incident.get("requires_human_approval", False)
            }
            requests.post(config.BACKEND_INCIDENT_INGEST_URL, json=payload, headers=headers, timeout=3)
        except Exception as e:
            logger.debug(f"Could not report incident to backend: {e}")

    def start(self, max_cycles: int = None):
        """Starts the autonomous daemon loop."""
        self.is_running = True
        logger.info(f"EduConnect AI Guardian daemon started. Version: {config.GUARDIAN_VERSION}")
        logger.info(f"Polling interval: {config.POLL_INTERVAL_SECONDS}s. Auto-recovery: {config.AUTO_RECOVERY_ENABLED}")

        cycle_count = 0
        try:
            while self.is_running:
                self.run_single_cycle()
                cycle_count += 1
                if max_cycles and cycle_count >= max_cycles:
                    break
                time.sleep(config.POLL_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            logger.info("Guardian daemon stopping gracefully...")
        finally:
            self.is_running = False

if __name__ == '__main__':
    daemon = AIGuardianDaemon()
    daemon.start()
