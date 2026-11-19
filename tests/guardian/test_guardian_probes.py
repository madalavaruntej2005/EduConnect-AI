import os
import sys
import unittest
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from ai_guardian.monitors.system_monitor import SystemMonitor
from ai_guardian.diagnosis.rule_engine import AnomalyRuleEngine
from ai_guardian.safety.policy_gate import SafetyPolicyGate
from ai_guardian.recovery.tool_registry import RecoveryToolRegistry

class AIGuardianTestCase(unittest.TestCase):
    def setUp(self):
        self.sys_monitor = SystemMonitor()
        self.rule_engine = AnomalyRuleEngine()
        self.policy_gate = SafetyPolicyGate()
        self.tool_registry = RecoveryToolRegistry()

    def test_system_monitor_metrics(self):
        metrics = self.sys_monitor.collect()
        self.assertIn('cpu_percent', metrics)
        self.assertIn('memory_percent', metrics)
        self.assertIn('memory_used_mb', metrics)
        self.assertGreater(metrics['memory_total_mb'], 0)

    def test_rule_engine_critical_anomaly_detection(self):
        # Synthetic failed backend probe
        fake_health = {"healthy": False, "status_code": 500, "error": "Internal Server Error"}
        fake_sys = {"memory_percent": 45.0, "cpu_percent": 20.0}

        incidents = self.rule_engine.evaluate(fake_sys, fake_health)
        self.assertEqual(len(incidents), 1)
        self.assertEqual(incidents[0]['severity'], 'CRITICAL')
        self.assertEqual(incidents[0]['recommended_action'], 'RESTART_WORKER')

    def test_safety_policy_allowlist_and_human_approval(self):
        # Safe tool in allowlist
        safe_eval = self.policy_gate.evaluate_action('CLEAR_APPROVED_CACHE', {})
        self.assertTrue(safe_eval['can_execute'])
        self.assertLess(safe_eval['risk_score'], 50)

        # Destructive high-risk action must be BLOCKED for human approval
        risky_eval = self.policy_gate.evaluate_action('PRODUCTION_DB_MIGRATION', {})
        self.assertFalse(risky_eval['can_execute'])
        self.assertTrue(risky_eval['requires_human_approval'])
        self.assertGreaterEqual(risky_eval['risk_score'], 90)

    def test_tool_registry_execution(self):
        res = self.tool_registry.execute('CLEAR_APPROVED_CACHE')
        self.assertEqual(res['status'], 'SUCCESS')
        self.assertIn('Memory freed', res['message'])

if __name__ == '__main__':
    unittest.main()
