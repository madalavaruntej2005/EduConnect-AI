import uuid
from django.db import models
from django.conf import settings

class GuardianIncident(models.Model):
    """Detected software anomalies, infrastructure errors, and AI diagnostic reports."""
    SEVERITY_CHOICES = (
        ('LOW', 'Low Severity'),
        ('MEDIUM', 'Medium Severity'),
        ('HIGH', 'High Severity'),
        ('CRITICAL', 'Critical Outage Risk'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_name = models.CharField(max_length=80, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM', db_index=True)
    error_summary = models.CharField(max_length=300)
    error_details = models.TextField()
    ai_diagnosis = models.TextField(blank=True)
    recommended_action = models.CharField(max_length=255, blank=True)
    is_resolved = models.BooleanField(default=False, db_index=True)
    requires_human_approval = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.service_name}: {self.error_summary[:40]}"


class GuardianMetric(models.Model):
    """Telemetry metrics (API latency, DB connection, Redis memory, Worker heartbeats)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_name = models.CharField(max_length=100, db_index=True)
    value = models.FloatField()
    unit = models.CharField(max_length=20, default='ms')
    metadata = models.JSONField(default=dict, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-recorded_at']


class GuardianAction(models.Model):
    """Executed recovery workflows by the AI Guardian."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('EXECUTING', 'Executing'),
        ('SUCCESS', 'Successfully Recovered'),
        ('FAILED', 'Recovery Failed'),
        ('REVERTED', 'Rollback Reverted'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(GuardianIncident, null=True, blank=True, on_delete=models.SET_NULL, related_name='actions')
    action_type = models.CharField(max_length=100, db_index=True)
    is_automated = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    execution_log = models.TextField(blank=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-executed_at']

    def __str__(self):
        return f"{self.action_type} ({self.status})"


class RecoveryApproval(models.Model):
    """High-risk action approval gatekeeper requiring human operator sign-off."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved by Admin'),
        ('REJECTED', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(GuardianIncident, on_delete=models.CASCADE, related_name='approvals')
    proposed_action = models.CharField(max_length=255)
    risk_score = models.PositiveIntegerField(default=75)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_actions')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Approval for {self.proposed_action} ({self.status})"
