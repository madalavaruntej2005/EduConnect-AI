from rest_framework import serializers
from .models import Job, Application
from apps.accounts.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    recruiter = UserSerializer(read_only=True)
    applications_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            'id', 'recruiter', 'company_name', 'company_logo', 'title',
            'job_type', 'workplace_type', 'location', 'description',
            'requirements', 'skills_required', 'salary_range',
            'application_deadline', 'is_active', 'applications_count',
            'has_applied', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'recruiter', 'applications_count', 'has_applied', 'created_at', 'updated_at')

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.applications.filter(applicant=request.user).exists()
        return False


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'job', 'applicant', 'resume_url', 'cover_letter', 'status', 'applied_at', 'updated_at')
        read_only_fields = ('id', 'job', 'applicant', 'applied_at', 'updated_at')
