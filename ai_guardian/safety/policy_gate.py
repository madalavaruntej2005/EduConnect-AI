"""
Policy Gate: Validates safety, enforces allowlists, scores risks, and halts high-risk actions
requiring human operator sign-off.
"""
import time
from ai_guardian import config

class SafetyPolicyGate:
    def __init__(self):
        self.action_history = []  # timestamps of recent auto actions

    def evaluate_action(self, action_name: str, incident: dict) -> dict:
        """
        Returns:
            can_execute: bool
            requires_human_approval: bool
            risk_score: int (1-100)
            reason: str
        """
        now = time.time()
        # Clean history older than 1 hour
        self.action_history = [t for t in self.action_history if now - t < 3600]

        # Check hourly rate limit
        if len(self.action_history) >= config.MAX_HOURLY_AUTO_ACTIONS:
            return {
                "can_execute": False,
                "requires_human_approval": True,
                "risk_score": 90,
                "reason": "Hourly automated action rate limit exceeded (10 actions/hour cooldown enforced)."
            }

        # Check if action is in high-risk list
        if action_name in config.HIGH_RISK_ACTIONS_REQUIRING_HUMAN_APPROVAL:
            return {
                "can_execute": False,
                "requires_human_approval": True,
                "risk_score": 95,
                "reason": f"Action '{action_name}' is classified as High Risk and strictly requires human operator approval."
            }

        # Check if action is in safe allowlist
        if action_name in config.APPROVED_AUTOMATED_ACTIONS:
            self.action_history.append(now)
            return {
                "can_execute": config.AUTO_RECOVERY_ENABLED,
                "requires_human_approval": not config.AUTO_RECOVERY_ENABLED,
                "risk_score": 25,
                "reason": f"Action '{action_name}' is in the pre-approved non-destructive tool registry."
            }

        # Unknown action: block immediately
        return {
            "can_execute": False,
            "requires_human_approval": True,
            "risk_score": 100,
            "reason": f"Action '{action_name}' is unrecognized and not in the approved safety registry."
        }
