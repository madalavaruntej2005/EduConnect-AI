from rest_framework.routers import DefaultRouter
from .views import AIAssistantViewSet

router = DefaultRouter()
router.register('', AIAssistantViewSet, basename='ai_assistant')

urlpatterns = router.urls
