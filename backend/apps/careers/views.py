from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True).select_related('recruiter').prefetch_related('applications')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        job_type = self.request.query_params.get('type', None)
        workplace = self.request.query_params.get('workplace', None)
        search = self.request.query_params.get('search', None)

        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(company_name__icontains=search) | qs.filter(description__icontains=search)
        if job_type:
            qs = qs.filter(job_type=job_type.upper())
        if workplace:
            qs = qs.filter(workplace_type=workplace.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        job = self.get_object()
        resume_url = request.data.get('resume_url')
        cover_letter = request.data.get('cover_letter', '')

        if not resume_url:
            return Response({'error': 'resume_url is required.'}, status=status.HTTP_400_BAD_REQUEST)

        app, created = Application.objects.get_or_create(
            job=job,
            applicant=request.user,
            defaults={'resume_url': resume_url, 'cover_letter': cover_letter}
        )

        if not created:
            return Response({'error': 'You have already applied for this role.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ApplicationSerializer(app).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def applicants(self, request, pk=None):
        job = self.get_object()
        if job.recruiter != request.user and not request.user.is_staff:
            return Response({'error': 'Only job recruiter can view applicants.'}, status=status.HTTP_403_FORBIDDEN)
        apps = Application.objects.filter(job=job).select_related('applicant')
        return Response(ApplicationSerializer(apps, many=True).data)


class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).select_related('job', 'job__recruiter')
