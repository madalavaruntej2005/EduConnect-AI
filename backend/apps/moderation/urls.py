from rest_framework.routers import DefaultRouter
from .views import ContentReportViewSet, AuditLogViewSet

router = DefaultRouter()
router.register('reports', ContentReportViewSet, basename='moderation-reports')
router.register('audit-logs', AuditLogViewSet, basename='audit-logs')

urlpatterns = router.urls
