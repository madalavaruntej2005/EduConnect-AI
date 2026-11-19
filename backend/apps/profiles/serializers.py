from rest_framework import serializers
from .models import StudentProfile
from apps.accounts.serializers import UserSerializer
from apps.colleges.serializers import CollegeSerializer

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    college_details = CollegeSerializer(source='college', read_only=True)

    class Meta:
        model = StudentProfile
        fields = (
            'id', 'user', 'college', 'college_details', 'major', 'degree',
            'graduation_year', 'cgpa', 'skills', 'interests', 'github_url',
            'linkedin_url', 'portfolio_url', 'streak_count', 'reputation_points',
            'badges', 'created_at', 'updated_at'
        )
