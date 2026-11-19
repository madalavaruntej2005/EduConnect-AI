import uuid
from django.db import models
from django.conf import settings

class Job(models.Model):
    """Internships, Graduate Roles, and Research Opportunities."""
    JOB_TYPES = (
        ('INTERNSHIP', 'Internship'),
        ('FULL_TIME', 'Full-time'),
        ('PART_TIME', 'Part-time'),
        ('CONTRACT', 'Contract / Research'),
    )

    WORKPLACE_TYPES = (
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
        ('ON_SITE', 'On-site'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    company_name = models.CharField(max_length=200, db_index=True)
    company_logo = models.URLField(
        max_length=600,
        default='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    )
    title = models.CharField(max_length=200, db_index=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES, default='INTERNSHIP')
    workplace_type = models.CharField(max_length=20, choices=WORKPLACE_TYPES, default='REMOTE')
    location = models.CharField(max_length=150, default='New York, NY / Remote')
    description = models.TextField()
    requirements = models.JSONField(default=list, blank=True)
    skills_required = models.JSONField(default=list, blank=True)
    salary_range = models.CharField(max_length=100, default='$35 - $50 / hr')
    application_deadline = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} @ {self.company_name}"


class Application(models.Model):
    """Student applications for jobs & internships."""
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('REVIEWING', 'Under Review'),
        ('INTERVIEWING', 'Interview Scheduled'),
        ('OFFERED', 'Offer Extended'),
        ('REJECTED', 'Not Selected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    resume_url = models.URLField(max_length=600)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'applicant')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.applicant.username} -> {self.job.title} ({self.status})"
