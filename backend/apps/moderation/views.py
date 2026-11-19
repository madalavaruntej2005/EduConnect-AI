from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import ContentReport, AuditLog
from .serializers import ContentReportSerializer, AuditLogSerializer

class ContentReportViewSet(viewsets.ModelViewSet):
    queryset = ContentReport.objects.all().select_related('reporter', 'reviewed_by')
    serializer_class = ContentReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        if not request.user.is_staff and request.user.role not in ['ADMIN', 'COLLEGE_ADMIN']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        report = self.get_object()
        action_taken = request.data.get('action_taken', 'Reviewed and action completed')
        report.status = 'RESOLVED'
        report.action_taken = action_taken
        report.reviewed_by = request.user
        report.reviewed_at = timezone.now()
        report.save()

        # Write audit log
        AuditLog.objects.create(
            actor=request.user,
            action=f"Resolved Content Report {report.id} on {report.content_type}",
            details={'target_id': report.target_id, 'action_taken': action_taken}
        )

        return Response(ContentReportSerializer(report).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('actor')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
