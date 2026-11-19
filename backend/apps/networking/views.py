from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Connection
from .serializers import ConnectionSerializer
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class ConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(
            Q(requester=user) | Q(receiver=user)
        ).select_related('requester', 'receiver')

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """Recommend connections from the same college or general students."""
        user = request.user
        connected_ids = set(
            Connection.objects.filter(Q(requester=user) | Q(receiver=user))
            .values_list('requester_id', 'receiver_id')
        )
        excluded_ids = {user.id}
        for r_id, rec_id in connected_ids:
            excluded_ids.add(r_id)
            excluded_ids.add(rec_id)

        suggestions = User.objects.filter(is_active=True).exclude(id__in=excluded_ids)[:10]
        serializer = UserSerializer(suggestions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def send_request(self, request):
        receiver_id = request.data.get('user_id')
        if not receiver_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if receiver == request.user:
            return Response({'error': 'Cannot connect with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = Connection.objects.filter(
            Q(requester=request.user, receiver=receiver) |
            Q(requester=receiver, receiver=request.user)
        ).first()

        if existing:
            return Response({'status': existing.status, 'connection_id': str(existing.id)})

        conn = Connection.objects.create(requester=request.user, receiver=receiver, status='PENDING')
        return Response(ConnectionSerializer(conn).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        conn = self.get_object()
        action_type = request.data.get('action')  # ACCEPT or REJECT

        if conn.receiver != request.user:
            return Response({'error': 'Only recipient can respond.'}, status=status.HTTP_403_FORBIDDEN)

        if action_type == 'ACCEPT':
            conn.status = 'ACCEPTED'
            conn.save()
            return Response({'status': 'ACCEPTED'})
        elif action_type == 'REJECT':
            conn.status = 'REJECTED'
            conn.save()
            return Response({'status': 'REJECTED'})
        return Response({'error': 'Invalid action. Must be ACCEPT or REJECT.'}, status=status.HTTP_400_BAD_REQUEST)
