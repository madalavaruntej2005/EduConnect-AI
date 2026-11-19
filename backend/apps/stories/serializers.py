from rest_framework import serializers
from django.utils import timezone
from .models import Story, StoryViewer
from apps.accounts.serializers import UserSerializer

class StoryViewerSerializer(serializers.ModelSerializer):
    viewer = UserSerializer(read_only=True)

    class Meta:
        model = StoryViewer
        fields = ('id', 'viewer', 'viewed_at')


class StorySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    views_count = serializers.SerializerMethodField()
    has_viewed = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = ('id', 'author', 'media_url', 'media_type', 'caption', 'expires_at', 'views_count', 'has_viewed', 'created_at')
        read_only_fields = ('id', 'author', 'expires_at', 'views_count', 'has_viewed', 'created_at')

    def get_views_count(self, obj):
        return obj.views.count()

    def get_has_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.views.filter(viewer=request.user).exists()
        return False

    def create(self, validated_data):
        user = self.context['request'].user
        return Story.objects.create(author=user, **validated_data)
