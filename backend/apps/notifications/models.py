import uuid
from django.db import models
from django.conf import settings

class Notification(models.Model):
    """User notifications across social, messaging, learning, and career events."""
    TYPE_CHOICES = (
        ('SOCIAL', 'Social Activity'),
        ('MESSAGE', 'Chat Message'),
        ('CAREER', 'Career & Job Alert'),
        ('LEARNING', 'Learning & Quiz Milestone'),
        ('SYSTEM', 'System Announcement'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='caused_notifications')
    verb = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='SOCIAL', db_index=True)
    target_url = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.username}: {self.verb}"
