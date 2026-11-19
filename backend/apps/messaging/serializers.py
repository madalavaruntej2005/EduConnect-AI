from rest_framework import serializers
from .models import ChatRoom, ChatMember, Message
from apps.accounts.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'room', 'sender', 'content', 'attachment_url', 'attachment_type', 'is_read', 'created_at')
        read_only_fields = ('id', 'sender', 'is_read', 'created_at')


class ChatMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChatMember
        fields = ('id', 'user', 'is_admin', 'last_read_at', 'joined_at')


class ChatRoomSerializer(serializers.ModelSerializer):
    members = ChatMemberSerializer(many=True, read_only=True)
    latest_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'room_type', 'name', 'avatar', 'created_by', 'members', 'latest_message', 'unread_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def get_latest_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            if member and member.last_read_at:
                return obj.messages.filter(created_at__gt=member.last_read_at).exclude(sender=request.user).count()
            return obj.messages.exclude(sender=request.user).count()
        return 0
