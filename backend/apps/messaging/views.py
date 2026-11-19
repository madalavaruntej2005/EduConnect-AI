from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMember, Message
from .serializers import ChatRoomSerializer, MessageSerializer

User = get_user_model()

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(members__user=self.request.user).distinct()

    def perform_create(self, serializer):
        room = serializer.save(created_by=self.request.user)
        ChatMember.objects.create(room=room, user=self.request.user, is_admin=True)

    @action(detail=False, methods=['post'])
    def direct(self, request):
        """Start or retrieve a 1-to-1 conversation with a target user."""
        target_user_id = request.data.get('user_id')
        if not target_user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({'error': 'Target user not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'error': 'Cannot start a direct message with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Look for existing direct room between both users
        existing_room = ChatRoom.objects.filter(
            room_type='DIRECT',
            members__user=request.user
        ).filter(
            members__user=target_user
        ).first()

        if existing_room:
            serializer = self.get_serializer(existing_room)
            return Response(serializer.data)

        # Create new direct room
        room = ChatRoom.objects.create(
            room_type='DIRECT',
            name=f"{request.user.username} & {target_user.username}",
            created_by=request.user
        )
        ChatMember.objects.create(room=room, user=request.user, is_admin=True)
        ChatMember.objects.create(room=room, user=target_user, is_admin=False)

        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        room = self.get_object()

        if request.method == 'POST':
            content = request.data.get('content', '')
            attachment_url = request.data.get('attachment_url', '')
            attachment_type = request.data.get('attachment_type', '')

            if not content and not attachment_url:
                return Response({'error': 'Message content or attachment required.'}, status=status.HTTP_400_BAD_REQUEST)

            msg = Message.objects.create(
                room=room,
                sender=request.user,
                content=content,
                attachment_url=attachment_url,
                attachment_type=attachment_type
            )
            # Update room updated_at
            room.save()

            # Update sender's last_read_at
            ChatMember.objects.filter(room=room, user=request.user).update(last_read_at=timezone.now())

            return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

        # GET: retrieve messages with pagination
        msgs = Message.objects.filter(room=room).select_related('sender').order_by('created_at')
        # Mark as read for this user
        ChatMember.objects.filter(room=room, user=request.user).update(last_read_at=timezone.now())
        serializer = MessageSerializer(msgs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        room = self.get_object()
        ChatMember.objects.filter(room=room, user=request.user).update(last_read_at=timezone.now())
        return Response({'status': 'marked_read'})
