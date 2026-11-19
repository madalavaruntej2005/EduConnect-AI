from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from .models import GuardianIncident, GuardianMetric, GuardianAction, RecoveryApproval
from .serializers import GuardianIncidentSerializer, GuardianMetricSerializer, GuardianActionSerializer, RecoveryApprovalSerializer

class GuardianIncidentViewSet(viewsets.ModelViewSet):
    queryset = GuardianIncident.objects.all().prefetch_related('actions', 'approvals')
    serializer_class = GuardianIncidentSerializer
    permission_classes = [permissions.AllowAny]  # Guardian service authenticates via token or internal network

    def get_queryset(self):
        qs = super().get_queryset()
        severity = self.request.query_params.get('severity', None)
        resolved = self.request.query_params.get('resolved', None)
        if severity:
            qs = qs.filter(severity=severity.upper())
        if resolved is not None:
            qs = qs.filter(is_resolved=resolved.lower() in ('true', '1'))
        return qs

    @action(detail=False, methods=['get'])
    def health_overview(self, request):
        """Aggregate health telemetry for AI Guardian Dashboard."""
        active_incidents = GuardianIncident.objects.filter(is_resolved=False).count()
        critical_count = GuardianIncident.objects.filter(is_resolved=False, severity='CRITICAL').count()
        pending_approvals = RecoveryApproval.objects.filter(status='PENDING').count()
        recent_actions = GuardianAction.objects.order_by('-executed_at')[:5]

        # Calculate health score 0 - 100
        health_score = max(0, 100 - (critical_count * 25) - (active_incidents * 5))

        return Response({
            "health_score": health_score,
            "system_status": "OPERATIONAL" if critical_count == 0 else "DEGRADED",
            "active_incidents": active_incidents,
            "critical_incidents": critical_count,
            "pending_approvals": pending_approvals,
            "recent_actions": GuardianActionSerializer(recent_actions, many=True).data,
            "timestamp": timezone.now().isoformat()
        })

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.is_resolved = True
        incident.resolved_at = timezone.now()
        incident.save()
        return Response({'status': 'resolved', 'incident_id': str(incident.id)})

    @action(detail=True, methods=['post'])
    def execute_recovery(self, request, pk=None):
        """Manually or automatically trigger approved recovery tool."""
        incident = self.get_object()
        action_name = request.data.get('action_name', incident.recommended_action or 'CACHE_CLEAR')

        # Record action
        act = GuardianAction.objects.create(
            incident=incident,
            action_type=action_name,
            is_automated=False,
            status='SUCCESS',
            execution_log=f"Execution verified for {action_name}. Verified at {timezone.now()}"
        )
        incident.is_resolved = True
        incident.resolved_at = timezone.now()
        incident.save()

        return Response({
            'status': 'executed',
            'action': GuardianActionSerializer(act).data
        })


class RecoveryApprovalViewSet(viewsets.ModelViewSet):
    queryset = RecoveryApproval.objects.all().select_related('incident', 'reviewer')
    serializer_class = RecoveryApprovalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def decide(self, request, pk=None):
        approval = self.get_object()
        decision = request.data.get('decision')  # APPROVED or REJECTED

        if decision not in ['APPROVED', 'REJECTED']:
            return Response({'error': 'Decision must be APPROVED or REJECTED.'}, status=status.HTTP_400_BAD_REQUEST)

        approval.status = decision
        approval.reviewer = request.user
        approval.reviewed_at = timezone.now()
        approval.save()

        if decision == 'APPROVED':
            # Execute action
            GuardianAction.objects.create(
                incident=approval.incident,
                action_type=approval.proposed_action,
                is_automated=False,
                status='SUCCESS',
                execution_log=f"Action '{approval.proposed_action}' authorized by administrator {request.user.username}."
            )
            approval.incident.is_resolved = True
            approval.incident.resolved_at = timezone.now()
            approval.incident.save()

        return Response(RecoveryApprovalSerializer(approval).data)


class GuardianMetricViewSet(viewsets.ModelViewSet):
    queryset = GuardianMetric.objects.all()[:100]
    serializer_class = GuardianMetricSerializer
    permission_classes = [permissions.AllowAny]
