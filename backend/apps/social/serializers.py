import re
from rest_framework import serializers
from .models import Post, PostMedia, Comment, Like, SavedPost
from apps.accounts.serializers import UserSerializer

class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ('id', 'media_type', 'file_url', 'thumbnail_url', 'order')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'parent', 'content', 'likes_count', 'is_liked', 'created_at')
        read_only_fields = ('id', 'post', 'author', 'likes_count', 'created_at')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, comment=obj).exists()
        return False


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    media = PostMediaSerializer(many=True, required=False)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content', 'post_type', 'visibility',
            'likes_count', 'comments_count', 'shares_count',
            'hashtags', 'is_pinned', 'media', 'is_liked', 'is_saved',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'author', 'likes_count', 'comments_count', 'shares_count', 'created_at', 'updated_at')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedPost.objects.filter(user=request.user, post=obj).exists()
        return False

    def create(self, validated_data):
        media_data = self.context.get('request').data.get('media', [])
        # Extract hashtags automatically from content
        content = validated_data.get('content', '')
        extracted_tags = re.findall(r'#(\w+)', content)
        validated_data['hashtags'] = list(set(validated_data.get('hashtags', []) + [t.lower() for t in extracted_tags]))

        post = Post.objects.create(author=self.context['request'].user, **validated_data)

        if isinstance(media_data, list):
            for idx, item in enumerate(media_data):
                if isinstance(item, dict) and 'file_url' in item:
                    PostMedia.objects.create(
                        post=post,
                        file_url=item['file_url'],
                        thumbnail_url=item.get('thumbnail_url', ''),
                        media_type=item.get('media_type', 'IMAGE'),
                        order=idx
                    )

        return post
