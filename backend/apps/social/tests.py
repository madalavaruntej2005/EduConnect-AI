from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.social.models import Post, Like

User = get_user_model()

class SocialTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='author@educonnect.ai',
            username='social_author',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_post_and_like(self):
        res = self.client.post('/api/v1/posts/', {
            'content': 'Hello EduConnect World! #learning #tech',
            'post_type': 'TEXT',
            'visibility': 'PUBLIC'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        post_id = res.data['id']

        # Like the post
        like_res = self.client.post(f'/api/v1/posts/{post_id}/like/')
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertEqual(like_res.data['status'], 'liked')
        self.assertEqual(like_res.data['likes_count'], 1)

        # Unlike the post
        unlike_res = self.client.post(f'/api/v1/posts/{post_id}/like/')
        self.assertEqual(unlike_res.data['status'], 'unliked')
        self.assertEqual(unlike_res.data['likes_count'], 0)
