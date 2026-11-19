import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.colleges.models import College

class Community(models.Model):
    """Student communities, academic clubs, and interest groups."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True, db_index=True)
    slug = models.SlugField(max_length=160, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=80, default='Technology', db_index=True)
    avatar = models.URLField(
        max_length=600,
        blank=True,
        default='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80'
    )
    banner = models.URLField(
        max_length=600,
        blank=True,
        default='https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80'
    )
    college = models.ForeignKey(College, null=True, blank=True, on_delete=models.SET_NULL, related_name='communities')
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_communities')
    is_private = models.BooleanField(default=False)
    members_count = models.PositiveIntegerField(default=1)
    posts_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-members_count', 'name']
        verbose_name_plural = 'Communities'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Membership(models.Model):
    """Community memberships with role permissions."""
    ROLE_CHOICES = (
        ('MEMBER', 'Member'),
        ('MODERATOR', 'Moderator'),
        ('ADMIN', 'Community Admin'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.community.name} ({self.role})"
