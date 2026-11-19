from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from .models import Post, Comment, Like, SavedPost
from .serializers import PostSerializer, CommentSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().select_related('author').prefetch_related('media', 'comments')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        author_id = self.request.query_params.get('author_id', None)
        hashtag = self.request.query_params.get('tag', None)
        post_type = self.request.query_params.get('type', None)

        if author_id:
            qs = qs.filter(author_id=author_id)
        if post_type:
            qs = qs.filter(post_type=post_type.upper())
        if hashtag:
            qs = qs.filter(hashtags__contains=[hashtag.lower()])
        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like_obj = Like.objects.filter(user=request.user, post=post).first()
        if like_obj:
            like_obj.delete()
            Post.objects.filter(id=post.id, likes_count__gt=0).update(likes_count=F('likes_count') - 1)
            post.refresh_from_db()
            return Response({'status': 'unliked', 'likes_count': post.likes_count})
        else:
            Like.objects.create(user=request.user, post=post)
            Post.objects.filter(id=post.id).update(likes_count=F('likes_count') + 1)
            post.refresh_from_db()
            return Response({'status': 'liked', 'likes_count': post.likes_count})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def save_post(self, request, pk=None):
        post = self.get_object()
        saved_obj = SavedPost.objects.filter(user=request.user, post=post).first()
        if saved_obj:
            saved_obj.delete()
            return Response({'status': 'unsaved', 'is_saved': False})
        else:
            SavedPost.objects.create(user=request.user, post=post)
            return Response({'status': 'saved', 'is_saved': True})

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        post = self.get_object()
        if request.method == 'POST':
            serializer = CommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                comment = serializer.save(post=post, author=request.user)
                Post.objects.filter(id=post.id).update(comments_count=F('comments_count') + 1)
                return Response(CommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        comments = Comment.objects.filter(post=post, parent__isnull=True).select_related('author').prefetch_related('replies')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)


class FeedView(viewsets.ReadOnlyModelViewSet):
    """Personalized and Trending Feed for Students."""
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        feed_mode = self.request.query_params.get('mode', 'for_you')

        if feed_mode == 'trending':
            return Post.objects.all().order_by('-likes_count', '-comments_count')[:50]
        elif feed_mode == 'shorts':
            return Post.objects.filter(post_type='SHORT').order_by('-created_at')[:30]

        if user.is_authenticated:
            # Show public posts and connection posts
            return Post.objects.all().order_by('-created_at')
        return Post.objects.filter(visibility='PUBLIC').order_by('-created_at')
