from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EnrollmentViewSet, AchievementViewSet

router = DefaultRouter()
router.register('my-enrollments', EnrollmentViewSet, basename='my-enrollments')
router.register('achievements', AchievementViewSet, basename='achievements')
router.register('', CourseViewSet, basename='courses')

urlpatterns = router.urls
