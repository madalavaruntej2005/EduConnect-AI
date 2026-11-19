from rest_framework import serializers
from .models import Notification
from apps.accounts.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'recipient', 'actor', 'verb', 'notification_type', 'target_url', 'is_read', 'created_at')
        read_only_fields = ('id', 'recipient', 'actor', 'verb', 'notification_type', 'target_url', 'created_at')
