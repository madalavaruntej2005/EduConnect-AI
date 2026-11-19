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
from apps.social.models import Post
from apps.learning.models import Course

User = get_user_model()

class EduConnectAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='api_test_student@mit.edu',
            username='api_tester',
            password='TestPassword123!',
            role='STUDENT'
        )
        self.client.force_authenticate(user=self.user)

    def test_health_check_endpoint(self):
        res = self.client.get('/health/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'healthy')

    def test_social_feed_retrieval(self):
        Post.objects.create(author=self.user, content="Integration testing feed endpoint #ai")
        res = self.client.get('/api/v1/feed/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data.get('results', res.data)), 1)

    def test_course_listing_and_enrollment(self):
        course = Course.objects.create(
            title="Automated Test Course",
            instructor=self.user,
            description="Testing enrollments"
        )
        res = self.client.get('/api/v1/courses/')
        self.assertEqual(res.status_code, 200)

        enroll_res = self.client.post(f'/api/v1/courses/{course.id}/enroll/')
        self.assertIn(enroll_res.status_code, [200, 201])

    def test_ai_tutor_conversation_and_ask(self):
        conv_res = self.client.post('/api/v1/ai/', {
            'title': 'Test AI Session',
            'context_mode': 'TUTOR'
        }, format='json')
        self.assertEqual(conv_res.status_code, 201)
        conv_id = conv_res.data['id']

        ask_res = self.client.post(f'/api/v1/ai/{conv_id}/ask/', {
            'prompt': 'Explain Binary Search Tree time complexity'
        }, format='json')
        self.assertEqual(ask_res.status_code, 200)
        self.assertIn('assistant_message', ask_res.data)
        self.assertTrue(len(ask_res.data['assistant_message']['content']) > 10)

if __name__ == '__main__':
    unittest.main()
