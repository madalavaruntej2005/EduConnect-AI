from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GuardianIncidentViewSet, RecoveryApprovalViewSet, GuardianMetricViewSet

router = DefaultRouter()
router.register('incidents', GuardianIncidentViewSet, basename='guardian-incidents')
router.register('approvals', RecoveryApprovalViewSet, basename='guardian-approvals')
router.register('metrics', GuardianMetricViewSet, basename='guardian-metrics')

urlpatterns = [
    path('health-overview/', GuardianIncidentViewSet.as_view({'get': 'health_overview'}), name='guardian-health-overview'),
    path('', include(router.urls)),
]
