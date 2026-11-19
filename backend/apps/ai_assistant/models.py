import uuid
from django.db import models
from django.conf import settings

class AIConversation(models.Model):
    """User-specific academic AI chat sessions."""
    MODE_CHOICES = (
        ('TUTOR', 'Academic Tutor'),
        ('DEBUGGER', 'Code Debugger'),
        ('SUMMARIZER', 'Study Notes Summarizer'),
        ('QUIZ_GEN', 'Practice Quiz Generator'),
        ('CAREER_COACH', 'Career & Interview Coach'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    title = models.CharField(max_length=200, default='Learning Session')
    context_mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='TUTOR')
    total_tokens = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username}: {self.title} ({self.context_mode})"


class AIMessage(models.Model):
    """Messages exchanged in an AI academic tutoring session."""
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
        ('system', 'System Context'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='user')
    content = models.TextField()
    tokens_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"
