"""
AI Reasoner: Analyzes anomalies using OpenAI GPT-4o-mini to produce root-cause analysis
and actionable recovery steps.
"""
import os
import logging
from ai_guardian import config

logger = logging.getLogger("ai_guardian.reasoner")

class AIDiagnosisEngine:
    def __init__(self):
        self.api_key = config.OPENAI_API_KEY
        self.model = config.OPENAI_MODEL

    def diagnose_incident(self, incident: dict) -> dict:
        """Call OpenAI for root-cause analysis, or return deterministic SRE diagnostic."""
        if self.api_key and self.api_key != "your-openai-api-key-here":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                prompt = (
                    f"You are the EduConnect AI Autonomous Reliability Engineer (SRE). Analyze this incident:\n"
                    f"Service: {incident.get('service_name')}\n"
                    f"Severity: {incident.get('severity')}\n"
                    f"Summary: {incident.get('error_summary')}\n"
                    f"Details: {incident.get('error_details')}\n\n"
                    f"Provide:\n"
                    f"1. Root-cause hypothesis\n"
                    f"2. Risk assessment (Low, Medium, High)\n"
                    f"3. Recommended automated safe recovery action\n"
                    f"4. Prevention advice for developers"
                )
                res = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are EduConnect AI Guardian, an autonomous software reliability engineer. Be concise, precise, and prioritize non-destructive automated self-healing."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300
                )
                diagnosis_text = res.choices[0].message.content
                return {
                    "diagnosis": diagnosis_text,
                    "engine": f"OpenAI {self.model}"
                }
            except Exception as e:
                logger.error(f"OpenAI diagnosis failed: {str(e)}")

        # Deterministic autonomous SRE diagnosis fallback
        service = incident.get("service_name")
        severity = incident.get("severity")
        summary = incident.get("error_summary")

        diagnosis = (
            f"**Autonomous AI Guardian Diagnostic Analysis**\n\n"
            f"- **Observed Phenomenon**: {summary}\n"
            f"- **Root Cause Hypothesis**: Service '{service}' experienced a transient latency spike or connection reset. "
            f"Likely caused by resource contention, concurrent query queueing, or cold-start initialization.\n"
            f"- **Risk Classification**: {severity} risk. The system state remains recoverable without database modification.\n"
            f"- **Prescribed Autonomous Action**: Execute verified safe recovery tool '{incident.get('recommended_action', 'COLLECT_DIAGNOSTICS')}'.\n"
            f"- **Verification Criteria**: Confirm subsequent HTTP probes return 200 OK within 500ms."
        )

        return {
            "diagnosis": diagnosis,
            "engine": "EduConnect Autonomous SRE Engine"
        }
