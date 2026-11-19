from rest_framework.routers import DefaultRouter
from .views import FeedView

router = DefaultRouter()
router.register('', FeedView, basename='feed')

urlpatterns = router.urls
