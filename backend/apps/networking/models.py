import uuid
from django.db import models
from django.conf import settings

class Connection(models.Model):
    """LinkedIn-style student and mentor connections."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending Request'),
        ('ACCEPTED', 'Connected'),
        ('REJECTED', 'Declined'),
        ('BLOCKED', 'Blocked'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_connection_requests')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_connection_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('requester', 'receiver')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.requester.username} -> {self.receiver.username} ({self.status})"
