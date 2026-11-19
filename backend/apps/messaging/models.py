import uuid
from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    """Direct 1-to-1 conversations and Group Chat Rooms."""
    TYPE_CHOICES = (
        ('DIRECT', 'Direct 1-on-1 Message'),
        ('GROUP', 'Group Chat'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='DIRECT', db_index=True)
    name = models.CharField(max_length=150, blank=True)
    avatar = models.URLField(max_length=600, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name or f"Room {self.id}"


class ChatMember(models.Model):
    """Participants in a chat room."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_memberships')
    is_admin = models.BooleanField(default=False)
    last_read_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('room', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.room}"


class Message(models.Model):
    """Chat message with text, media attachments, and read receipts."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    attachment_url = models.URLField(max_length=600, blank=True)
    attachment_type = models.CharField(max_length=30, blank=True)  # IMAGE, PDF, CODE, etc.
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"
