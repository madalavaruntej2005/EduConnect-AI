from rest_framework import serializers
from .models import Community, Membership
from apps.accounts.serializers import UserSerializer

class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ('id', 'user', 'role', 'joined_at')


class CommunitySerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    is_member = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = (
            'id', 'name', 'slug', 'description', 'category',
            'avatar', 'banner', 'college', 'creator', 'is_private',
            'members_count', 'posts_count', 'is_member', 'my_role',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'creator', 'members_count', 'posts_count', 'is_member', 'my_role', 'created_at', 'updated_at')

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user).exists()
        return False

    def get_my_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            m = obj.memberships.filter(user=request.user).first()
            return m.role if m else None
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        community = Community.objects.create(creator=user, **validated_data)
        Membership.objects.create(community=community, user=user, role='ADMIN')
        return community
