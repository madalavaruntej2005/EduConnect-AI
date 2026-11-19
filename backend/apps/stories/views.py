from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Story, StoryViewer
from .serializers import StorySerializer, StoryViewerSerializer

class StoryViewSet(viewsets.ModelViewSet):
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Only active, non-expired stories
        return Story.objects.filter(expires_at__gt=timezone.now()).select_related('author').prefetch_related('views')

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def view_story(self, request, pk=None):
        story = self.get_object()
        viewer_obj, created = StoryViewer.objects.get_or_create(story=story, viewer=request.user)
        return Response({'status': 'viewed', 'viewed_at': viewer_obj.viewed_at})

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def viewers(self, request, pk=None):
        story = self.get_object()
        if story.author != request.user and not request.user.is_staff:
            return Response({'error': 'Only story author can view viewers.'}, status=status.HTTP_403_FORBIDDEN)
        viewers = StoryViewer.objects.filter(story=story).select_related('viewer')
        serializer = StoryViewerSerializer(viewers, many=True)
        return Response(serializer.data)
