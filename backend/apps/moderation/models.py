import uuid
from django.db import models
from django.conf import settings

class ContentReport(models.Model):
    """User reports of policy violations, harassment, or inappropriate content."""
    REASON_CHOICES = (
        ('SPAM', 'Spam / Commercial Advertising'),
        ('HARASSMENT', 'Harassment or Bullying'),
        ('ACADEMIC_DISHONESTY', 'Academic Dishonesty / Plagiarism'),
        ('INAPPROPRIATE', 'Inappropriate or NSFW Content'),
        ('HATE_SPEECH', 'Hate Speech or Discrimination'),
        ('OTHER', 'Other Policy Violation'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('RESOLVED', 'Resolved / Content Removed'),
        ('DISMISSED', 'Dismissed / Safe'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='filed_reports')
    content_type = models.CharField(max_length=50, db_index=True)  # POST, COMMENT, USER, COMMUNITY, JOB
    target_id = models.CharField(max_length=100, db_index=True)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES, default='OTHER')
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    action_taken = models.CharField(max_length=255, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_reports')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report {self.id} on {self.content_type} ({self.status})"


class AuditLog(models.Model):
    """Immutable audit trail for security events, admin actions, and account changes."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_entries')
    action = models.CharField(max_length=150, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        actor_name = self.actor.username if self.actor else 'System'
        return f"[{self.timestamp}] {actor_name} -> {self.action}"
