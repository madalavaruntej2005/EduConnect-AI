import uuid
from django.db import models

class College(models.Model):
    """Educational institutions, universities, and colleges."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    domain = models.CharField(max_length=150, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='United States')
    logo = models.URLField(
        max_length=500,
        blank=True,
        default='https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80'
    )
    banner = models.URLField(
        max_length=500,
        blank=True,
        default='https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80'
    )
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Colleges'

    def __str__(self):
        return f"{self.name} ({self.code})"
