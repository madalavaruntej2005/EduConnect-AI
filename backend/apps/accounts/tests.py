from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'

    def test_student_registration_and_jwt_generation(self):
        payload = {
            'username': 'test_student',
            'email': 'student@mit.edu',
            'password': 'SecurePassword123!',
            'role': 'STUDENT',
            'major': 'Computer Science'
        }
        res = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['email'], 'student@mit.edu')

    def test_login_flow(self):
        User.objects.create_user(
            email='login_test@mit.edu',
            username='login_student',
            password='MyPassword123!'
        )
        login_res = self.client.post(self.login_url, {
            'email': 'login_test@mit.edu',
            'password': 'MyPassword123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)
