import uuid
from django.db import models
from django.conf import settings

class ExternalAccount(models.Model):
    """Connected external social and educational accounts (Instagram, WhatsApp, LinkedIn, YouTube)."""
    PROVIDER_CHOICES = (
        ('INSTAGRAM', 'Meta Instagram'),
        ('WHATSAPP', 'WhatsApp Business Cloud'),
        ('LINKEDIN', 'LinkedIn Professional'),
        ('YOUTUBE', 'YouTube Data API'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='external_accounts')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, db_index=True)
    account_id = models.CharField(max_length=255, blank=True)
    account_username = models.CharField(max_length=255, blank=True)
    access_token_encrypted = models.TextField(blank=True)
    refresh_token_encrypted = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'provider')
        ordering = ['provider']

    def __str__(self):
        return f"{self.user.username}'s {self.get_provider_display()}"
