import os
import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.colleges.models import College
from apps.learning.models import Course
from apps.social.models import Post

User = get_user_model()

class EndToEndStudentWorkflowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_complete_student_lifecycle(self):
        # 1. Register student
        reg_payload = {
            'username': 'e2e_student',
            'email': 'e2e@stanford.edu',
            'password': 'StrongPassword123!',
            'role': 'STUDENT',
            'major': 'Data Science'
        }
        reg_res = self.client.post('/api/v1/auth/register/', reg_payload, format='json')
        self.assertEqual(reg_res.status_code, 201)
        token = reg_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # 2. Check current student profile
        me_res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.data['email'], 'e2e@stanford.edu')

        # 3. Create social learning post with hashtag
        post_payload = {
            'content': 'Just completed my first lab on neural transformers! #AI #Stanford',
            'post_type': 'TEXT',
            'visibility': 'PUBLIC'
        }
        post_res = self.client.post('/api/v1/posts/', post_payload, format='json')
        self.assertEqual(post_res.status_code, 201)
        post_id = post_res.data['id']
        self.assertIn('ai', post_res.data['hashtags'])

        # 4. Like post
        like_res = self.client.post(f'/api/v1/posts/{post_id}/like/')
        self.assertEqual(like_res.status_code, 200)
        self.assertEqual(like_res.data['status'], 'liked')

        # 5. Comment on post
        comment_res = self.client.post(f'/api/v1/posts/{post_id}/comments/', {
            'content': 'Great job! Which optimizer did you choose?'
        }, format='json')
        self.assertEqual(comment_res.status_code, 201)

        # 6. Query AI Tutor Assistant
        conv_res = self.client.post('/api/v1/ai/', {'title': 'E2E Session', 'context_mode': 'TUTOR'}, format='json')
        conv_id = conv_res.data['id']
        ai_res = self.client.post(f'/api/v1/ai/{conv_id}/ask/', {
            'prompt': 'Why does Adam optimizer perform well on sparse gradients?'
        }, format='json')
        self.assertEqual(ai_res.status_code, 200)
        self.assertIn('assistant_message', ai_res.data)

        # 7. Check platform telemetry reflects health
        health_res = self.client.get('/health/')
        self.assertEqual(health_res.status_code, 200)
        self.assertEqual(health_res.json()['status'], 'healthy')

if __name__ == '__main__':
    unittest.main()
