from rest_framework import serializers
from .models import ExternalAccount

class ExternalAccountSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='get_provider_display', read_only=True)

    class Meta:
        model = ExternalAccount
        fields = (
            'id', 'provider', 'provider_name', 'account_id',
            'account_username', 'is_active', 'last_synced_at',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'last_synced_at')
