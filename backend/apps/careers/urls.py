from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, ApplicationViewSet

router = DefaultRouter()
router.register('my-applications', ApplicationViewSet, basename='my-applications')
router.register('', JobViewSet, basename='jobs')

urlpatterns = router.urls
