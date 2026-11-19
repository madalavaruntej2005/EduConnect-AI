import uuid
from django.db import models
from django.conf import settings

class Post(models.Model):
    """Social Feed Posts, Photos, Articles and Short Reels."""
    TYPE_CHOICES = (
        ('TEXT', 'Text Post'),
        ('IMAGE', 'Photo Post'),
        ('VIDEO', 'Video Post'),
        ('SHORT', 'Short Reel'),
        ('ARTICLE', 'Academic Article'),
    )

    VISIBILITY_CHOICES = (
        ('PUBLIC', 'Public - All Students'),
        ('COLLEGE', 'College Only'),
        ('CONNECTIONS', 'Connections Only'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    post_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='TEXT', db_index=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PUBLIC', db_index=True)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)
    hashtags = models.JSONField(default=list, blank=True)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author', '-created_at']),
        ]

    def __str__(self):
        return f"{self.author.username}: {self.content[:40]}"


class PostMedia(models.Model):
    """Media assets attached to a post."""
    MEDIA_CHOICES = (
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('DOCUMENT', 'Document'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=20, choices=MEDIA_CHOICES, default='IMAGE')
    file_url = models.URLField(max_length=600)
    thumbnail_url = models.URLField(max_length=600, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Media for {self.post_id} ({self.media_type})"


class Comment(models.Model):
    """Post Comments and Nested Replies."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post_id}"


class Like(models.Model):
    """User likes on Posts or Comments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE, related_name='likes')
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], condition=models.Q(post__isnull=False), name='unique_post_like'),
            models.UniqueConstraint(fields=['user', 'comment'], condition=models.Q(comment__isnull=False), name='unique_comment_like'),
        ]

    def __str__(self):
        return f"Like by {self.user.username}"


class SavedPost(models.Model):
    """Bookmarked / Saved posts by students."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} saved {self.post_id}"
