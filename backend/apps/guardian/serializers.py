from rest_framework import serializers
from .models import GuardianIncident, GuardianMetric, GuardianAction, RecoveryApproval

class GuardianMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianMetric
        fields = '__all__'


class GuardianActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianAction
        fields = '__all__'


class RecoveryApprovalSerializer(serializers.ModelSerializer):
    incident_summary = serializers.CharField(source='incident.error_summary', read_only=True)

    class Meta:
        model = RecoveryApproval
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class GuardianIncidentSerializer(serializers.ModelSerializer):
    actions = GuardianActionSerializer(many=True, read_only=True)
    approvals = RecoveryApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = GuardianIncident
        fields = (
            'id', 'service_name', 'severity', 'error_summary',
            'error_details', 'ai_diagnosis', 'recommended_action',
            'is_resolved', 'requires_human_approval', 'resolved_at',
            'actions', 'approvals', 'created_at'
        )
        read_only_fields = ('id', 'created_at')
