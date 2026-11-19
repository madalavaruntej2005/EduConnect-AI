from rest_framework import serializers
from .models import ContentReport, AuditLog
from apps.accounts.serializers import UserSerializer

class ContentReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)

    class Meta:
        model = ContentReport
        fields = '__all__'
        read_only_fields = ('id', 'reporter', 'status', 'action_taken', 'reviewed_by', 'reviewed_at', 'created_at')


class AuditLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')
