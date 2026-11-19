from rest_framework import serializers
from .models import AIConversation, AIMessage

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ('id', 'role', 'content', 'tokens_used', 'created_at')


class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ('id', 'title', 'context_mode', 'total_tokens', 'messages', 'created_at', 'updated_at')
        read_only_fields = ('id', 'total_tokens', 'created_at', 'updated_at')
