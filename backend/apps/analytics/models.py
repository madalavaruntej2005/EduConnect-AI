import uuid
from django.db import models

class PlatformMetric(models.Model):
    """Aggregated daily platform metrics and growth tracking."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True, db_index=True)
    active_users = models.PositiveIntegerField(default=0)
    new_registrations = models.PositiveIntegerField(default=0)
    posts_created = models.PositiveIntegerField(default=0)
    messages_sent = models.PositiveIntegerField(default=0)
    courses_completed = models.PositiveIntegerField(default=0)
    ai_queries_processed = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Metrics for {self.date}"
