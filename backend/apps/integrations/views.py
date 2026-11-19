from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from .models import ExternalAccount
from .serializers import ExternalAccountSerializer
from .adapters import InstagramAdapter, WhatsAppAdapter, LinkedInAdapter, YouTubeAdapter

class IntegrationViewSet(viewsets.ModelViewSet):
    serializer_class = ExternalAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExternalAccount.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def platform_status(self, request):
        """Returns the developer configuration status for each external platform."""
        insta = InstagramAdapter()
        wa = WhatsAppAdapter()
        li = LinkedInAdapter()
        yt = YouTubeAdapter()

        return Response({
            "instagram": {
                "name": "Meta Instagram Graph API",
                "configured": insta.is_configured(),
                "auth_url": insta.get_auth_url() if insta.is_configured() else None,
                "notes": "Requires Meta App Review for production access."
            },
            "whatsapp": {
                "name": "WhatsApp Business Cloud API",
                "configured": wa.is_configured(),
                "notes": "Used for instant security alerts, class updates & interview notices."
            },
            "linkedin": {
                "name": "LinkedIn Professional Graph",
                "configured": li.is_configured(),
                "auth_url": li.get_auth_url() if li.is_configured() else None,
                "notes": "Requires LinkedIn Developer Portal App with Sign In & Sharing scopes."
            },
            "youtube": {
                "name": "YouTube Data API v3",
                "configured": yt.is_configured(),
                "notes": "Used to index, search and embed educational video content."
            }
        })

    @action(detail=False, methods=['get'])
    def search_youtube(self, request):
        query = request.query_params.get('q', 'Python programming')
        adapter = YouTubeAdapter()
        result = adapter.search_educational_videos(query)
        return Response(result)

    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        account = self.get_object()
        account.delete()
        return Response({"status": "disconnected"})
