from rest_framework import serializers
from .models import Connection
from apps.accounts.serializers import UserSerializer

class ConnectionSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = ('id', 'requester', 'receiver', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'requester', 'status', 'created_at', 'updated_at')
