import uuid
from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.conf import settings

def default_story_expiry():
    return timezone.now() + timedelta(hours=24)

class Story(models.Model):
    """24-hour Ephemeral Stories."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stories')
    media_url = models.URLField(max_length=600)
    media_type = models.CharField(max_length=10, choices=(('IMAGE', 'Image'), ('VIDEO', 'Video')), default='IMAGE')
    caption = models.CharField(max_length=255, blank=True)
    expires_at = models.DateTimeField(default=default_story_expiry, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_active(self):
        return timezone.now() < self.expires_at

    def __str__(self):
        return f"Story by {self.author.username} at {self.created_at}"


class StoryViewer(models.Model):
    """Viewers of an ephemeral story."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='views')
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='viewed_stories')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('story', 'viewer')

    def __str__(self):
        return f"{self.viewer.username} viewed story {self.story_id}"
