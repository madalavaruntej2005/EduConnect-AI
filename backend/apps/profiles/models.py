import uuid
from django.db import models
from django.conf import settings
from apps.colleges.models import College

class StudentProfile(models.Model):
    """Rich Academic and Professional Student Profile."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    college = models.ForeignKey(College, null=True, blank=True, on_delete=models.SET_NULL, related_name='students')
    major = models.CharField(max_length=150, default='Computer Science')
    degree = models.CharField(max_length=100, default='Bachelor of Science')
    graduation_year = models.IntegerField(default=2026)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    skills = models.JSONField(default=list, blank=True)
    interests = models.JSONField(default=list, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    streak_count = models.IntegerField(default=1)
    reputation_points = models.IntegerField(default=100)
    badges = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.major})"
