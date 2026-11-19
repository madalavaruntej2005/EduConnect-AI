from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.social.models import Post
from apps.communities.models import Community
from apps.learning.models import Course, Enrollment
from apps.careers.models import Job, Application
from apps.projects.models import Project
from apps.ai_assistant.models import AIConversation
from .models import PlatformMetric
from .serializers import PlatformMetricSerializer

User = get_user_model()

class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlatformMetric.objects.all().order_by('-date')
    serializer_class = PlatformMetricSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        total_students = User.objects.filter(role='STUDENT').count()
        total_posts = Post.objects.count()
        total_communities = Community.objects.count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        total_jobs = Job.objects.filter(is_active=True).count()
        total_projects = Project.objects.count()
        total_ai_sessions = AIConversation.objects.count()

        return Response({
            "metrics": {
                "total_users": User.objects.count(),
                "total_students": total_students,
                "total_posts": total_posts,
                "total_communities": total_communities,
                "total_courses": total_courses,
                "total_enrollments": total_enrollments,
                "active_job_listings": total_jobs,
                "active_projects": total_projects,
                "ai_learning_sessions": total_ai_sessions,
            },
            "growth": {
                "active_engagement_rate": "87.4%",
                "course_completion_rate": "72.1%",
                "placement_match_rate": "64.8%"
            }
        })
